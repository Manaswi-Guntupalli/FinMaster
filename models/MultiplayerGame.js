const mongoose = require('mongoose');

const multiplayerGameSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    gameMode: {
        type: String,
        enum: ['quiz-rush', 'snake-ladder'],
        default: 'quiz-rush'
    },
    player1: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        avatar: String,
        score: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        totalAnswers: { type: Number, default: 0 },
        answers: [{
            questionId: String,
            selectedAnswer: Number,
            isCorrect: Boolean,
            timeTaken: Number,
            pointsEarned: Number
        }]
    },
    player2: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        avatar: String,
        score: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 },
        totalAnswers: { type: Number, default: 0 },
        answers: [{
            questionId: String,
            selectedAnswer: Number,
            isCorrect: Boolean,
            timeTaken: Number,
            pointsEarned: Number
        }]
    },
    questions: [{
        questionId: String,
        category: String,
        difficulty: String,
        correctAnswer: Number
    }],
    status: {
        type: String,
        enum: ['waiting', 'ready', 'playing', 'finished'],
        default: 'waiting'
    },
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    winnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startTime: Date,
    endTime: Date,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7200 // Auto-delete after 2 hours
    }
});

// Index for quick lookups
multiplayerGameSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('MultiplayerGame', multiplayerGameSchema);
