const express = require('express');
const authMiddleware = require('../middleware/auth');
const SnakeGameResult = require('../models/SnakeGame');
const Question = require('../models/Question');
const User = require('../models/User');

const router = express.Router();

// Snake and Ladder board configuration
const SNAKES = {
  98: 78, 95: 75, 93: 73, 87: 24, 64: 60,
  62: 19, 56: 53, 49: 11, 47: 26, 16: 6
};

const LADDERS = {
  2: 38, 7: 14, 8: 31, 15: 26, 21: 42,
  28: 84, 36: 44, 51: 67, 71: 91, 78: 98
};

const CHECKPOINTS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99];

// Get random financial question
router.get('/question', authMiddleware, async (req, res) => {
  try {
    // Get random questions from database
    const count = await Question.countDocuments();
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne().skip(random);
    
    if (!question) {
      return res.status(404).json({ message: 'No questions available' });
    }

    res.json({
      questionId: question._id,
      question: question.question,
      options: question.options,
      category: question.category,
      difficulty: question.difficulty
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check answer
router.post('/check-answer', authMiddleware, async (req, res) => {
  try {
    const { questionId, selectedAnswer } = req.body;
    
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;
    
    res.json({
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || 'Good try!'
    });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save game result
router.post('/save-result', authMiddleware, async (req, res) => {
  try {
    const {
      playerName,
      ageGroup,
      finalScore,
      questionsCorrect,
      questionsTotal,
      wonGame,
      playerPosition,
      computerPosition,
      computerScore,
      timeTaken,
      snakesHit,
      laddersClimbed
    } = req.body;

    const user = await User.findById(req.userId);
    
    const gameResult = new SnakeGameResult({
      userId: req.userId,
      username: user.username,
      playerName: playerName || user.username,
      ageGroup,
      finalScore,
      questionsCorrect,
      questionsTotal,
      wonGame,
      playerPosition,
      computerPosition,
      computerScore,
      timeTaken,
      snakesHit,
      laddersClimbed
    });

    await gameResult.save();

    // Update user's total points if they won
    if (wonGame) {
      user.totalPoints += Math.floor(finalScore * 0.1); // 10% of game score added to total points
      await user.save();
    }

    res.json({
      message: 'Game result saved successfully',
      result: gameResult
    });
  } catch (error) {
    console.error('Error saving game result:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const { type } = req.query; // 'all-time', 'weekly', 'recent'
    
    let query = {};
    
    if (type === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query.playedAt = { $gte: oneWeekAgo };
    }

    let results;
    if (type === 'recent') {
      results = await SnakeGameResult.find(query)
        .sort({ playedAt: -1 })
        .limit(10)
        .select('username playerName finalScore wonGame questionsCorrect questionsTotal playedAt');
    } else {
      results = await SnakeGameResult.find(query)
        .sort({ finalScore: -1, playedAt: -1 })
        .limit(10)
        .select('username playerName finalScore wonGame questionsCorrect questionsTotal playedAt');
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's game stats
router.get('/my-stats', authMiddleware, async (req, res) => {
  try {
    const games = await SnakeGameResult.find({ userId: req.userId })
      .sort({ playedAt: -1 });
    
    const totalGames = games.length;
    const wins = games.filter(g => g.wonGame).length;
    const bestScore = games.length > 0 ? Math.max(...games.map(g => g.finalScore)) : 0;
    const avgScore = games.length > 0 
      ? games.reduce((sum, g) => sum + g.finalScore, 0) / games.length 
      : 0;

    res.json({
      totalGames,
      wins,
      losses: totalGames - wins,
      bestScore,
      avgScore: Math.round(avgScore),
      recentGames: games.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get board configuration
router.get('/board-config', (req, res) => {
  res.json({
    snakes: SNAKES,
    ladders: LADDERS,
    checkpoints: CHECKPOINTS,
    boardSize: 100
  });
});

module.exports = router;
