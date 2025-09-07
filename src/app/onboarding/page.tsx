'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Brain, CheckCircle, ChevronLeft, ChevronRight, Eye, Heart, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string>('');

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to MindScope',
      subtitle: 'Your personal AI-powered mental health companion',
      component: WelcomeStep
    },
    {
      id: 'goals',
      title: 'What are your goals? *',
      subtitle: 'Help us understand how we can best support you (Required)',
      component: GoalsStep
    },
    {
      id: 'experience',
      title: 'Mental Health Experience *',
      subtitle: 'Tell us about your current mental health journey (Required)',
      component: ExperienceStep
    },
    {
      id: 'preferences',
      title: 'Therapy Preferences *',
      subtitle: 'What therapeutic approaches interest you? (Required)',
      component: PreferencesStep
    },
    {
      id: 'privacy',
      title: 'Privacy & Security *',
      subtitle: 'Your data security is our top priority (Required)',
      component: PrivacyStep
    },
    {
      id: 'optical-test',
      title: 'Innovative Wellness Assessment *',
      subtitle: 'A unique approach to understanding your mental state (Required)',
      component: OpticalTestStep
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      subtitle: 'Welcome to your personalized mental wellness journey',
      component: CompleteStep
    }
  ];

  const validateCurrentStep = () => {
    const currentStepId = steps[currentStep].id;
    
    switch (currentStepId) {
      case 'goals':
        if (!answers.goals || answers.goals.length === 0) {
          setValidationError('Please select at least one goal to continue.');
          return false;
        }
        break;
      case 'experience':
        if (!answers.experience) {
          setValidationError('Please select your mental health experience level.');
          return false;
        }
        break;
      case 'preferences':
        if (!answers.preferences || answers.preferences.length === 0) {
          setValidationError('Please select at least one therapeutic approach.');
          return false;
        }
        break;
      case 'privacy':
        if (!answers.privacyConsent) {
          setValidationError('Please agree to the privacy policy and terms of service to continue.');
          return false;
        }
        break;
      case 'optical-test':
        if (!answers.opticalTest) {
          setValidationError('Please complete the visual assessment to continue.');
          return false;
        }
        break;
      default:
        break;
    }
    
    setValidationError('');
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAnswer = (key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    // Clear validation error when user makes a selection
    if (validationError) {
      setValidationError('');
    }
  };

  const isCurrentStepValid = () => {
    const currentStepId = steps[currentStep].id;
    
    switch (currentStepId) {
      case 'goals':
        return answers.goals && answers.goals.length > 0;
      case 'experience':
        return !!answers.experience;
      case 'preferences':
        return answers.preferences && answers.preferences.length > 0;
      case 'privacy':
        return !!answers.privacyConsent;
      case 'optical-test':
        return !!answers.opticalTest;
      default:
        return true; // Steps that don't require validation
    }
  };

  const getCurrentStepRequirement = () => {
    const currentStepId = steps[currentStep].id;
    
    switch (currentStepId) {
      case 'goals':
        return 'Select at least one goal';
      case 'experience':
        return 'Select your experience level';
      case 'preferences':
        return 'Select at least one approach';
      case 'privacy':
        return 'Agree to privacy policy and terms';
      case 'optical-test':
        return 'Complete the visual assessment';
      default:
        return '';
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-serenity-100 via-healing-100 to-warm-100">
      {/* Progress Bar */}
      <div className="w-full bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-serenity-400 to-healing-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {steps[currentStep].title}
          </h1>
          <p className="text-xl text-gray-600">
            {steps[currentStep].subtitle}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent 
              answers={answers} 
              updateAnswer={updateAnswer}
              onNext={nextStep}
            />
          </motion.div>
        </AnimatePresence>

        {/* Validation Message */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-center"
          >
            <p className="text-red-600 font-medium">{validationError}</p>
          </motion.div>
        )}

        {/* Requirement Indicator */}
        {getCurrentStepRequirement() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className={`text-sm ${isCurrentStepValid() ? 'text-green-600' : 'text-gray-500'}`}>
              {isCurrentStepValid() ? '✓ ' : '• '}
              {getCurrentStepRequirement()}
              {isCurrentStepValid() && ' (Complete)'}
            </p>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </motion.button>

          {currentStep === steps.length - 1 ? (
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-serenity-400 to-healing-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <span>Enter Dashboard</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Link>
          ) : (
            <div className="flex flex-col items-end">
              <motion.button
                whileHover={isCurrentStepValid() ? { scale: 1.05 } : {}}
                whileTap={isCurrentStepValid() ? { scale: 0.95 } : {}}
                onClick={nextStep}
                disabled={!isCurrentStepValid()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full shadow-lg transition-all ${
                  isCurrentStepValid()
                    ? 'bg-gradient-to-r from-serenity-400 to-healing-400 text-white hover:shadow-xl cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Personalized mental health recommendations based on your unique patterns'
    },
    {
      icon: Eye,
      title: 'Emotion Detection',
      description: 'Advanced facial analysis to understand your emotional state in real-time'
    },
    {
      icon: Heart,
      title: 'Therapeutic Exercises',
      description: 'Evidence-based CBT, DBT, and mindfulness practices tailored to you'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Blockchain-secured data with complete user control and anonymity'
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 bg-gradient-to-r from-serenity-400 to-healing-400 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>
        <p className="text-lg text-gray-600 leading-relaxed">
          MindScope uses cutting-edge AI and biometric technology to provide personalized mental health support. 
          Our platform combines the latest research in psychology with innovative technology to help you 
          understand and improve your mental wellness.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="flex items-start space-x-4 p-6 bg-gradient-to-br from-serenity-50 to-healing-50 rounded-2xl"
          >
            <div className={`w-12 h-12 bg-gradient-to-r from-serenity-400 to-healing-400 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="w-full mt-8 py-4 bg-gradient-to-r from-serenity-400 to-healing-400 text-white rounded-2xl font-semibold text-lg hover:shadow-lg transition-all"
      >
        Let&apos;s Get Started
      </motion.button>
    </div>
  );
}

function GoalsStep({ answers, updateAnswer }: { answers: any, updateAnswer: (key: string, value: any) => void }) {
  const goals = [
    { id: 'stress', label: 'Reduce Stress & Anxiety', icon: '🧘', color: 'serenity' },
    { id: 'mood', label: 'Improve Mood & Happiness', icon: '😊', color: 'sunset' },
    { id: 'sleep', label: 'Better Sleep Quality', icon: '😴', color: 'ocean' },
    { id: 'focus', label: 'Enhance Focus & Productivity', icon: '🎯', color: 'healing' },
    { id: 'relationships', label: 'Improve Relationships', icon: '💝', color: 'warm' },
    { id: 'habits', label: 'Build Healthy Habits', icon: '💪', color: 'serenity' }
  ];

  const selectedGoals = answers.goals || [];

  const toggleGoal = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter((id: string) => id !== goalId)
      : [...selectedGoals, goalId];
    updateAnswer('goals', newGoals);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <p className="text-gray-600">Select at least one goal that applies to you. <span className="text-red-500 font-medium">Required*</span></p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <motion.button
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleGoal(goal.id)}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              selectedGoals.includes(goal.id)
                ? `border-${goal.color}-400 bg-${goal.color}-50`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{goal.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{goal.label}</h3>
              </div>
              {selectedGoals.includes(goal.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-6 h-6 bg-${goal.color}-400 rounded-full flex items-center justify-center`}
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 text-center text-gray-600">
        <p>Selected: {selectedGoals.length} goals</p>
      </div>
    </div>
  );
}

function ExperienceStep({ answers, updateAnswer }: { answers: any, updateAnswer: (key: string, value: any) => void }) {
  const experiences = [
    { id: 'new', label: 'New to mental health support', description: 'I\'m just starting my wellness journey' },
    { id: 'some', label: 'Some experience', description: 'I\'ve tried therapy or self-help before' },
    { id: 'experienced', label: 'Experienced', description: 'I have ongoing mental health support' },
    { id: 'professional', label: 'Mental health professional', description: 'I work in the mental health field' }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <p className="text-gray-600">Please select your mental health experience level. <span className="text-red-500 font-medium">Required*</span></p>
      </div>
      <div className="space-y-4">
        {experiences.map((exp) => (
          <motion.button
            key={exp.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => updateAnswer('experience', exp.id)}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              answers.experience === exp.id
                ? 'border-serenity-400 bg-serenity-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{exp.label}</h3>
                <p className="text-gray-600 text-sm">{exp.description}</p>
              </div>
              {answers.experience === exp.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-serenity-400 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function PreferencesStep({ answers, updateAnswer }: { answers: any, updateAnswer: (key: string, value: any) => void }) {
  const approaches = [
    { id: 'cbt', label: 'Cognitive Behavioral Therapy (CBT)', description: 'Focus on changing thought patterns' },
    { id: 'dbt', label: 'Dialectical Behavior Therapy (DBT)', description: 'Skills for emotional regulation' },
    { id: 'mindfulness', label: 'Mindfulness & Meditation', description: 'Present-moment awareness practices' },
    { id: 'acceptance', label: 'Acceptance & Commitment Therapy (ACT)', description: 'Accepting thoughts while committing to values' },
    { id: 'somatic', label: 'Body-Based Approaches', description: 'Physical awareness and movement' },
    { id: 'creative', label: 'Creative & Expressive Therapies', description: 'Art, music, and creative expression' }
  ];

  const selectedApproaches = answers.preferences || [];

  const toggleApproach = (approachId: string) => {
    const newApproaches = selectedApproaches.includes(approachId)
      ? selectedApproaches.filter((id: string) => id !== approachId)
      : [...selectedApproaches, approachId];
    updateAnswer('preferences', newApproaches);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <p className="text-gray-600">Select at least one therapeutic approach that interests you. <span className="text-red-500 font-medium">Required*</span></p>
      </div>

      <div className="space-y-4">
        {approaches.map((approach) => (
          <motion.button
            key={approach.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggleApproach(approach.id)}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedApproaches.includes(approach.id)
                ? 'border-healing-400 bg-healing-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{approach.label}</h3>
                <p className="text-gray-600 text-sm">{approach.description}</p>
              </div>
              {selectedApproaches.includes(approach.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-healing-400 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function PrivacyStep({ answers, updateAnswer }: { answers: any, updateAnswer: (key: string, value: any) => void }) {
  const privacyFeatures = [
    {
      title: 'Blockchain Security',
      description: 'Your data is encrypted and stored on a decentralized blockchain, giving you complete control.',
      icon: Shield
    },
    {
      title: 'Anonymous Community',
      description: 'Connect with others without revealing your identity. Your privacy is always protected.',
      icon: Users
    },
    {
      title: 'Local Processing',
      description: 'Emotion detection and analysis happen on your device. Your biometric data never leaves your device.',
      icon: Eye
    },
    {
      title: 'Data Ownership',
      description: 'You own your data. You can export, delete, or transfer it at any time.',
      icon: Heart
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Shield className="w-8 h-8 text-white" />
        </motion.div>
        <p className="text-gray-600 leading-relaxed">
          Your mental health data is extremely sensitive. We&apos;ve built MindScope with privacy-first architecture 
          to ensure your information remains secure and under your control.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {privacyFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={answers.privacyConsent || false}
            onChange={(e) => updateAnswer('privacyConsent', e.target.checked)}
            className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <div>
            <p className="text-gray-800 font-medium">
              I agree to the privacy policy and terms of service 
              <span className="text-red-500 font-medium ml-1">*</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              I understand that my data is processed locally and securely, and I have full control over my information.
              <span className="text-red-500 text-xs font-medium block mt-1">Required to continue</span>
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

function OpticalTestStep({ answers, updateAnswer }: { answers: any, updateAnswer: (key: string, value: any) => void }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const illusions = [
    {
      id: 'spinning',
      image: '🌀',
      question: 'Which direction does the spiral appear to move?',
      options: ['Clockwise', 'Counter-clockwise', 'Not moving', 'Both directions']
    },
    {
      id: 'color',
      image: '🔵',
      question: 'What color do you see most prominently?',
      options: ['Blue', 'Purple', 'Green', 'Gray']
    },
    {
      id: 'depth',
      image: '⚫',
      question: 'How does this pattern make you feel?',
      options: ['Calm', 'Anxious', 'Focused', 'Dizzy']
    }
  ];

  const currentIllusion = illusions[0]; // For demo, showing first one

  const handleSelection = (option: string) => {
    setSelectedOption(option);
    updateAnswer('opticalTest', { illusion: currentIllusion.id, response: option });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <p className="text-gray-600 mb-4">
          This innovative assessment uses visual perception to gain insights into your current mental state. 
          There are no right or wrong answers - just select what feels most accurate to you.
          <span className="text-red-500 font-medium block mt-2">Required to continue *</span>
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a simplified demonstration. The full version would include 
            interactive visual illusions and advanced analysis.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-8xl mb-6">{currentIllusion.image}</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {currentIllusion.question}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentIllusion.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelection(option)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedOption === option
                  ? 'border-serenity-400 bg-serenity-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium text-gray-800">{option}</span>
              {selectedOption === option && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 w-6 h-6 bg-serenity-400 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-serenity-50 rounded-xl"
          >
            <h4 className="font-semibold text-gray-800 mb-2">Analysis</h4>
            <p className="text-gray-600">
              Your response suggests a {selectedOption.toLowerCase()} perception style, which often correlates 
              with certain cognitive and emotional patterns. This information will help personalize your experience.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CompleteStep({ answers }: { answers: any }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to Your Mental Wellness Journey!
      </h2>

      <p className="text-xl text-gray-600 mb-8 leading-relaxed">
        Based on your responses, we&apos;ve created a personalized experience tailored to your needs, 
        goals, and preferences. Your mental health journey starts now.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-gradient-to-br from-serenity-50 to-healing-50 rounded-2xl">
          <Brain className="w-12 h-12 text-serenity-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-800 mb-2">Personalized AI</h3>
          <p className="text-sm text-gray-600">Your AI coach is ready with customized recommendations</p>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-healing-50 to-warm-50 rounded-2xl">
          <Heart className="w-12 h-12 text-healing-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-800 mb-2">Tailored Therapy</h3>
          <p className="text-sm text-gray-600">Evidence-based exercises matched to your preferences</p>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-warm-50 to-sunset-50 rounded-2xl">
          <Shield className="w-12 h-12 text-warm-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-800 mb-2">Privacy Protected</h3>
          <p className="text-sm text-gray-600">Your data is secure and under your complete control</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-serenity-50 to-healing-50 rounded-2xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Your Personalized Setup:</h4>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-sm text-gray-600 mb-1">Selected Goals:</p>
            <p className="font-medium text-gray-800">
              {answers.goals?.length || 0} wellness objectives
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Experience Level:</p>
            <p className="font-medium text-gray-800 capitalize">
              {answers.experience || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Therapy Preferences:</p>
            <p className="font-medium text-gray-800">
              {answers.preferences?.length || 0} approaches selected
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Privacy Consent:</p>
            <p className="font-medium text-gray-800">
              {answers.privacyConsent ? 'Confirmed' : 'Pending'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
