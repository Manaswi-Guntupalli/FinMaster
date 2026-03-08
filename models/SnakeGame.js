const mongoose = require('mongoose');

const snakeGameResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  playerName: {
    type: String,
    default: ''
  },
  ageGroup: {
    type: String,
    default: '18-24'
  },
  finalScore: {
    type: Number,
    required: true,
    default: 0
  },
  questionsCorrect: {
    type: Number,
    default: 0
  },
  questionsTotal: {
    type: Number,
    default: 0
  },
  wonGame: {
    type: Boolean,
    required: true
  },
  playerPosition: {
    type: Number,
    required: true
  },
  computerPosition: {
    type: Number,
    required: true
  },
  computerScore: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  snakesHit: {
    type: Number,
    default: 0
  },
  laddersClimbed: {
    type: Number,
    default: 0
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for leaderboard queries
snakeGameResultSchema.index({ finalScore: -1, playedAt: -1 });
snakeGameResultSchema.index({ playedAt: -1 });

module.exports = mongoose.model('SnakeGameResult', snakeGameResultSchema);
