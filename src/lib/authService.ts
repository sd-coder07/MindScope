// Production-Ready Authentication Service
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from './database';

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  dateOfBirth?: Date;
  gender?: string;
  preferredLanguage?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  therapeuticApproaches: string[];
  preferredLanguage: string;
  lastLogin?: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  }

  // Register new user
  async register(data: RegisterData): Promise<{ user: AuthUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Check username uniqueness if provided
      if (data.username) {
        const existingUsername = await prisma.user.findUnique({
          where: { username: data.username }
        });

        if (existingUsername) {
          throw new Error('Username already taken');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, this.bcryptRounds);

      // Generate email verification token
      const emailVerificationToken = uuidv4();

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          preferredLanguage: data.preferredLanguage || 'en',
          emailVerificationToken,
          therapeuticApproaches: ['CBT', 'mindfulness'], // Default approaches
        },
      });

      // Log registration event
      await this.logAuditEvent('user_registration', user.id, {
        email: user.email,
        success: true
      });

      // Generate JWT token
      const token = this.generateToken(user.id, user.email);

      // Return user data (exclude password)
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        username: user.username || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        isEmailVerified: user.isEmailVerified,
        therapeuticApproaches: user.therapeuticApproaches,
        preferredLanguage: user.preferredLanguage,
      };

      return { user: authUser, token };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(data: LoginData, ipAddress?: string, userAgent?: string): Promise<{ user: AuthUser; token: string }> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        await this.logAuditEvent('login_failed', null, {
          email: data.email,
          reason: 'user_not_found',
          ipAddress,
          userAgent
        });
        throw new Error('Invalid email or password');
      }

      // Check if account is active
      if (!user.isActive) {
        await this.logAuditEvent('login_failed', user.id, {
          email: data.email,
          reason: 'account_inactive',
          ipAddress,
          userAgent
        });
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);

      if (!isPasswordValid) {
        await this.logAuditEvent('login_failed', user.id, {
          email: data.email,
          reason: 'invalid_password',
          ipAddress,
          userAgent
        });
        throw new Error('Invalid email or password');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Log successful login
      await this.logAuditEvent('login_success', user.id, {
        email: user.email,
        ipAddress,
        userAgent
      });

      // Generate JWT token
      const token = this.generateToken(user.id, user.email);

      // Return user data (exclude password)
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        username: user.username || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        isEmailVerified: user.isEmailVerified,
        therapeuticApproaches: user.therapeuticApproaches,
        preferredLanguage: user.preferredLanguage,
        lastLogin: new Date(),
      };

      return { user: authUser, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        isEmailVerified: user.isEmailVerified,
        therapeuticApproaches: user.therapeuticApproaches,
        preferredLanguage: user.preferredLanguage,
        lastLogin: user.lastLogin || undefined,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  // Generate JWT token
  private generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  // Password reset request
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if user exists for security
        return true;
      }

      const resetToken = uuidv4();
      const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpiry: resetExpiry
        }
      });

      await this.logAuditEvent('password_reset_requested', user.id, {
        email: user.email
      });

      // TODO: Send email with reset link
      // await this.sendPasswordResetEmail(user.email, resetToken);

      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      return false;
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null
        }
      });

      await this.logAuditEvent('password_reset_completed', user.id, {
        email: user.email
      });

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<boolean> {
    try {
      const user = await prisma.user.findFirst({
        where: { emailVerificationToken: token }
      });

      if (!user) {
        throw new Error('Invalid verification token');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null
        }
      });

      await this.logAuditEvent('email_verified', user.id, {
        email: user.email
      });

      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      return false;
    }
  }

  // Change password (authenticated user)
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, this.bcryptRounds);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      await this.logAuditEvent('password_changed', userId, {
        email: user.email
      });

      return true;
    } catch (error) {
      console.error('Password change error:', error);
      return false;
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<RegisterData>): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: updates.firstName,
          lastName: updates.lastName,
          username: updates.username,
          dateOfBirth: updates.dateOfBirth,
          gender: updates.gender,
          preferredLanguage: updates.preferredLanguage,
        }
      });

      await this.logAuditEvent('profile_updated', userId, {
        email: user.email,
        updatedFields: Object.keys(updates)
      });

      return {
        id: user.id,
        email: user.email,
        username: user.username || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        isEmailVerified: user.isEmailVerified,
        therapeuticApproaches: user.therapeuticApproaches,
        preferredLanguage: user.preferredLanguage,
        lastLogin: user.lastLogin || undefined,
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return null;
    }
  }

  // Log audit events
  private async logAuditEvent(eventType: string, userId?: string | null, metadata?: any): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          eventType,
          action: eventType,
          userId,
          userEmail: metadata?.email,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          success: !metadata?.reason,
          errorMessage: metadata?.reason,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }

  // Deactivate user account
  async deactivateAccount(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });

      await this.logAuditEvent('account_deactivated', userId);
      return true;
    } catch (error) {
      console.error('Account deactivation error:', error);
      return false;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        isEmailVerified: user.isEmailVerified,
        therapeuticApproaches: user.therapeuticApproaches,
        preferredLanguage: user.preferredLanguage,
        lastLogin: user.lastLogin || undefined,
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
