const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  virtualBalance: {
    type: Number,
    default: 1000
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: Number,
    default: 1
  },
  completedLevels: [{
    type: Number
  }],
  achievements: [{
    name: String,
    earnedAt: Date
  }],
  streak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Track performance by topic for AI analysis
  topicPerformance: [{
    topic: String,
    category: String,
    totalAttempts: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 },
    lastAttempted: Date,
    difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  }],
  // AI-identified weak areas
  weakTopics: [{
    topic: String,
    category: String,
    weaknessScore: { type: Number, min: 0, max: 100 }, // 0 = strong, 100 = very weak
    identifiedAt: Date,
    improvementSuggestions: [String],
    practiceCount: { type: Number, default: 0 }
  }],
  // Personalized learning path
  learningPath: [{
    topic: String,
    category: String,
    priority: { type: Number, min: 1, max: 10 },
    status: { type: String, enum: ['pending', 'in-progress', 'mastered'], default: 'pending' },
    recommendedAt: Date,
    completedAt: Date
  }],
  // AI interaction history
  aiInteractions: [{
    type: { type: String, enum: ['chat', 'hint', 'explanation', 'analysis', 'concept'] },
    topic: String,
    timestamp: Date,
    helpful: Boolean
  }],
  // India-specific profile data
  preferredLanguage: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'mr', 'bn', 'ta', 'te', 'gu']
  },
  ageGroup: {
    type: String,
    enum: ['13-17', '18-24', '25-30', '31-40'],
    default: '18-24'
  },
  financialGoals: [String],
  lastAIAnalysis: Date
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
