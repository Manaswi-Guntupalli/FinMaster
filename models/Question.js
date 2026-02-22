const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 10
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  // New fields for Indian context and AI features
  topic: {
    type: String,
    required: true,
    default: 'General Finance'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Banking', 'Investments', 'Insurance', 'Taxation', 'Digital Payments',
      'Government Schemes', 'Credit & Loans', 'Budgeting', 'Savings', 
      'Stock Market', 'Mutual Funds', 'Real Estate', 'Retirement Planning',
      'Financial Regulations', 'Money Management', 'Economic Concepts'
    ],
    default: 'Money Management'
  },
  indiaSpecific: {
    type: Boolean,
    default: false
  },
  relatedTerms: [String], // Indian financial terms like UPI, GST, PAN, etc.
  ageRelevance: {
    type: String,
    enum: ['13-17', '18-24', '25-30', '31-40', 'all'],
    default: 'all'
  },
  practicalExample: String, // Real-world Indian example
  estimatedTime: { // Time in seconds
    type: Number,
    default: 30
  }
});

module.exports = mongoose.model('Question', questionSchema);
