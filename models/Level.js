const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  levelNumber: {
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
  introduction: {
    type: String,
    required: true
  },
  unlockCost: {
    type: Number,
    default: 0
  },
  rewardCoins: {
    type: Number,
    default: 100
  },
  icon: {
    type: String,
    default: '💰'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  }
});

module.exports = mongoose.model('Level', levelSchema);
