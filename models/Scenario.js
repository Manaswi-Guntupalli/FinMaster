const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  scenarioNumber: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '💼'
  },
  category: {
    type: String,
    enum: ['Emergency', 'Career', 'Investment', 'Business', 'Life Events'],
    required: true
  },
  introduction: {
    type: String,
    required: true
  },
  totalQuestions: {
    type: Number,
    default: 10
  },
  rewardPoints: {
    type: Number,
    default: 500 // Total possible points (10 questions × 50 points)
  },
  questions: [{
    questionNumber: {
      type: Number,
      required: true
    },
    questionType: {
      type: String,
      enum: ['yes-no', 'mcq'],
      required: true
    },
    situation: {
      type: String,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String
    }],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // Can be boolean (yes/no) or number (mcq index)
      required: true
    },
    correctPoints: {
      type: Number,
      default: 50
    },
    wrongPenalty: {
      type: Number,
      default: 25
    },
    virtualMoneyContext: {
      type: String // Context about virtual money in this decision
    },
    explanation: {
      type: String,
      required: true
    },
    // For story progression
    nextQuestionContext: {
      type: String // Sets up next question in the story
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scenario', scenarioSchema);
