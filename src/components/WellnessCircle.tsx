'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    Book,
    Crown,
    Heart,
    MapPin,
    MessageCircle,
    Plus,
    Search,
    Send,
    Share2,
    Sparkles,
    Target,
    ThumbsUp,
    Trophy,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  level: number;
  streak: number;
  badges: string[];
  location?: string;
  joinDate: Date;
  lastActive: Date;
  wellnessScore: number;
  helpfulPosts: number;
  isOnline: boolean;
  bio?: string;
}

interface CommunityPost {
  id: string;
  author: CommunityMember;
  content: string;
  type: 'achievement' | 'question' | 'story' | 'tip' | 'challenge';
  timestamp: Date;
  likes: number;
  comments: CommunityComment[];
  tags: string[];
  isLiked: boolean;
  image?: string;
}

interface CommunityComment {
  id: string;
  author: CommunityMember;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

interface WellnessChallenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  participants: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reward: string;
  endDate: Date;
  progress: number;
  isJoined: boolean;
  category: string;
}

interface WellnessCircleProps {
  onJoinChallenge?: (challengeId: string) => void;
  onCreatePost?: (post: Omit<CommunityPost, 'id' | 'timestamp'>) => void;
}

export default function WellnessCircle({ onJoinChallenge, onCreatePost }: WellnessCircleProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'members' | 'groups'>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [challenges, setChallenges] = useState<WellnessChallenge[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<CommunityPost['type']>('story');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Sample data
  useEffect(() => {
    const sampleMembers: CommunityMember[] = [
      {
        id: 'member-1',
        name: 'Sarah Chen',
        avatar: '👩‍💼',
        level: 15,
        streak: 42,
        badges: ['🎯', '💪', '🧘'],
        location: 'San Francisco, CA',
        joinDate: new Date(2024, 0, 15),
        lastActive: new Date(),
        wellnessScore: 89,
        helpfulPosts: 23,
        isOnline: true,
        bio: 'Mental health advocate and mindfulness enthusiast'
      },
      {
        id: 'member-2',
        name: 'Alex Rivera',
        avatar: '🧑‍💻',
        level: 12,
        streak: 28,
        badges: ['🌟', '❤️', '🏃'],
        location: 'New York, NY',
        joinDate: new Date(2024, 1, 3),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        wellnessScore: 76,
        helpfulPosts: 18,
        isOnline: false,
        bio: 'Yoga instructor and wellness coach'
      },
      {
        id: 'member-3',
        name: 'Jordan Kim',
        avatar: '👨‍🎨',
        level: 8,
        streak: 15,
        badges: ['🎨', '🌱'],
        location: 'Austin, TX',
        joinDate: new Date(2024, 2, 10),
        lastActive: new Date(Date.now() - 30 * 60 * 1000),
        wellnessScore: 82,
        helpfulPosts: 12,
        isOnline: true,
        bio: 'Creative soul finding balance through art therapy'
      }
    ];

    const samplePosts: CommunityPost[] = [
      {
        id: 'post-1',
        author: sampleMembers[0],
        content: "Just completed my 30-day meditation streak! 🧘‍♀️ The transformation in my anxiety levels has been incredible. Starting with just 5 minutes a day really works!",
        type: 'achievement',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 47,
        comments: [
          {
            id: 'comment-1',
            author: sampleMembers[1],
            content: "Congratulations Sarah! Your journey has been so inspiring to follow.",
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            likes: 5,
            isLiked: false
          }
        ],
        tags: ['meditation', 'anxiety', 'milestone'],
        isLiked: true
      },
      {
        id: 'post-2',
        author: sampleMembers[1],
        content: "Does anyone have tips for maintaining motivation during difficult days? I'm struggling to keep up with my wellness routine when work gets overwhelming.",
        type: 'question',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 23,
        comments: [
          {
            id: 'comment-2',
            author: sampleMembers[2],
            content: "I find that even 2-3 minutes of deep breathing helps reset my mindset. Small steps count!",
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            likes: 8,
            isLiked: true
          }
        ],
        tags: ['motivation', 'stress', 'work-life'],
        isLiked: false
      },
      {
        id: 'post-3',
        author: sampleMembers[2],
        content: "Created a gratitude jar today! 🏺 Writing down three things I'm grateful for each morning. It's amazing how this simple practice shifts my entire outlook.",
        type: 'tip',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likes: 34,
        comments: [],
        tags: ['gratitude', 'mindfulness', 'positivity'],
        isLiked: true
      }
    ];

    const sampleChallenges: WellnessChallenge[] = [
      {
        id: 'challenge-1',
        title: '21-Day Mindfulness Challenge',
        description: 'Practice mindfulness for 10 minutes daily and track your mood improvements',
        duration: '21 days',
        participants: 847,
        difficulty: 'beginner',
        reward: 'Mindfulness Master Badge',
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        progress: 65,
        isJoined: true,
        category: 'mindfulness'
      },
      {
        id: 'challenge-2',
        title: 'Stress-Free September',
        description: 'Learn and practice different stress-reduction techniques every week',
        duration: '30 days',
        participants: 623,
        difficulty: 'intermediate',
        reward: 'Zen Warrior Badge',
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        progress: 0,
        isJoined: false,
        category: 'stress-relief'
      },
      {
        id: 'challenge-3',
        title: 'Emotional Intelligence Bootcamp',
        description: 'Advanced challenge to understand and manage emotions effectively',
        duration: '14 days',
        participants: 234,
        difficulty: 'advanced',
        reward: 'Emotion Master Badge',
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        progress: 0,
        isJoined: false,
        category: 'emotional-health'
      }
    ];

    setMembers(sampleMembers);
    setPosts(samplePosts);
    setChallenges(sampleChallenges);
  }, []);

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleJoinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, isJoined: true, participants: challenge.participants + 1 }
        : challenge
    ));
    onJoinChallenge?.(challengeId);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Omit<CommunityPost, 'id' | 'timestamp'> = {
      author: members[0], // Current user
      content: newPostContent,
      type: newPostType,
      likes: 0,
      comments: [],
      tags: [],
      isLiked: false
    };

    onCreatePost?.(newPost);
    setNewPostContent('');
    setShowCreatePost(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPostTypeIcon = (type: CommunityPost['type']) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-4 h-4" />;
      case 'question': return <MessageCircle className="w-4 h-4" />;
      case 'story': return <Book className="w-4 h-4" />;
      case 'tip': return <Sparkles className="w-4 h-4" />;
      case 'challenge': return <Target className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'feed', name: 'Community Feed', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'challenges', name: 'Challenges', icon: <Target className="w-5 h-5" /> },
    { id: 'members', name: 'Members', icon: <Users className="w-5 h-5" /> },
    { id: 'groups', name: 'Support Groups', icon: <Heart className="w-5 h-5" /> }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Users className="w-8 h-8" />
                Wellness Circle
              </h1>
              <p className="text-white/80 text-lg">Connect with your wellness community</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreatePost(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl px-6 py-3 font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Share Post
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">1,247</div>
              <div className="text-white/90">Active Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">156</div>
              <div className="text-white/90">Posts Today</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">23</div>
              <div className="text-white/90">Active Challenges</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">89%</div>
              <div className="text-white/90">Member Satisfaction</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100"
      >
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors flex-1 ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search posts, topics, or members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Posts</option>
                  <option value="achievement">Achievements</option>
                  <option value="question">Questions</option>
                  <option value="story">Stories</option>
                  <option value="tip">Tips</option>
                </select>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center text-xl">
                        {post.author.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                          {post.author.name}
                          {post.author.level >= 10 && <Crown className="w-4 h-4 text-yellow-500" />}
                          {post.author.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span>Level {post.author.level}</span>
                          <span>•</span>
                          <span>{post.timestamp.toLocaleDateString()}</span>
                          {post.author.location && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{post.author.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      post.type === 'achievement' ? 'bg-yellow-100 text-yellow-700' :
                      post.type === 'question' ? 'bg-blue-100 text-blue-700' :
                      post.type === 'story' ? 'bg-purple-100 text-purple-700' :
                      post.type === 'tip' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {getPostTypeIcon(post.type)}
                      {post.type}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{post.content}</p>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          post.isLiked 
                            ? 'bg-pink-100 text-pink-600' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments.length}
                      </button>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-sm">
                            {comment.author.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-xl p-3">
                              <div className="font-medium text-gray-800 text-sm">{comment.author.name}</div>
                              <div className="text-gray-700 text-sm">{comment.content}</div>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>{comment.timestamp.toLocaleDateString()}</span>
                              <button className="flex items-center gap-1 hover:text-gray-700">
                                <ThumbsUp className="w-3 h-3" />
                                {comment.likes}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </div>
                    <div className="text-sm text-gray-600">
                      {challenge.participants} participants
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">{challenge.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{challenge.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Reward:</span>
                      <span className="font-medium">{challenge.reward}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Ends:</span>
                      <span className="font-medium">{challenge.endDate.toLocaleDateString()}</span>
                    </div>

                    {challenge.isJoined && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress:</span>
                          <span className="font-medium">{challenge.progress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${challenge.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={challenge.isJoined}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                        challenge.isJoined
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg'
                      }`}
                    >
                      {challenge.isJoined ? 'Joined ✓' : 'Join Challenge'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center text-3xl">
                        {member.avatar}
                      </div>
                      {member.isOnline && (
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
                      {member.name}
                      {member.level >= 15 && <Crown className="w-5 h-5 text-yellow-500" />}
                    </h3>
                    
                    {member.bio && (
                      <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">{member.level}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Streak:</span>
                        <span className="font-medium">{member.streak} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Wellness Score:</span>
                        <span className="font-medium">{member.wellnessScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Helpful Posts:</span>
                        <span className="font-medium">{member.helpfulPosts}</span>
                      </div>

                      {member.badges.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="text-sm text-gray-600 mb-2">Badges:</div>
                          <div className="flex justify-center gap-1">
                            {member.badges.map((badge, i) => (
                              <span key={i} className="text-lg">{badge}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {member.location && (
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {member.location}
                        </div>
                      )}
                    </div>

                    <button className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                      Connect
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'groups' && (
          <motion.div
            key="groups"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  id: 'anxiety-support',
                  name: 'Anxiety Support Circle',
                  description: 'A safe space to share experiences and coping strategies for anxiety',
                  members: 1247,
                  posts: 89,
                  category: 'Mental Health',
                  icon: '🤗',
                  isJoined: true
                },
                {
                  id: 'meditation-masters',
                  name: 'Meditation Masters',
                  description: 'Share meditation techniques and deepen your practice together',
                  members: 892,
                  posts: 156,
                  category: 'Mindfulness',
                  icon: '🧘',
                  isJoined: false
                },
                {
                  id: 'stress-warriors',
                  name: 'Stress Warriors',
                  description: 'Combat workplace stress with proven strategies and peer support',
                  members: 634,
                  posts: 78,
                  category: 'Workplace Wellness',
                  icon: '💪',
                  isJoined: true
                },
                {
                  id: 'sleep-solutions',
                  name: 'Sleep Solutions',
                  description: 'Improve sleep quality and establish healthy bedtime routines',
                  members: 456,
                  posts: 45,
                  category: 'Sleep Health',
                  icon: '😴',
                  isJoined: false
                }
              ].map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center text-2xl">
                      {group.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                        {group.isJoined && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Joined
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>{group.members} members</span>
                        <span>•</span>
                        <span>{group.posts} posts this week</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {group.category}
                        </span>
                        <button
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            group.isJoined
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg'
                          }`}
                        >
                          {group.isJoined ? 'View Group' : 'Join Group'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreatePost(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Share with the Community</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Type
                  </label>
                  <select
                    value={newPostType}
                    onChange={(e) => setNewPostType(e.target.value as CommunityPost['type'])}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="story">Share Your Story</option>
                    <option value="achievement">Celebrate Achievement</option>
                    <option value="question">Ask Question</option>
                    <option value="tip">Share Tip</option>
                    <option value="challenge">Create Challenge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What&apos;s on your mind?
                  </label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your wellness journey, ask for support, or inspire others..."
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Share Post
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
