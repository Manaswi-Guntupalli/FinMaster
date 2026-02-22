const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Level = require('../models/Level');
const Question = require('../models/Question');

const router = express.Router();

// Get all levels
router.get('/levels', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const levels = await Level.find().sort({ levelNumber: 1 });
    
    const levelsWithStatus = levels.map(level => ({
      ...level.toObject(),
      isUnlocked: level.levelNumber === 1 || 
                  user.completedLevels.includes(level.levelNumber - 1) ||
                  (user.virtualBalance >= level.unlockCost && level.levelNumber <= user.currentLevel + 1),
      isCompleted: user.completedLevels.includes(level.levelNumber)
    }));

    res.json(levelsWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get level details
router.get('/levels/:levelNumber', authMiddleware, async (req, res) => {
  try {
    const level = await Level.findOne({ levelNumber: req.params.levelNumber });
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const questions = await Question.find({ levelNumber: req.params.levelNumber });
    
    res.json({
      level,
      questions: questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        points: q.points,
        difficulty: q.difficulty
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit answer
router.post('/submit-answer', authMiddleware, async (req, res) => {
  try {
    const { questionId, selectedAnswer, timeSpent } = req.body;
    
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;
    const user = await User.findById(req.userId);

    // Track topic performance
    const topicIndex = user.topicPerformance.findIndex(
      tp => tp.topic === question.topic && tp.category === question.category
    );

    if (topicIndex >= 0) {
      // Update existing topic performance
      user.topicPerformance[topicIndex].totalAttempts += 1;
      if (isCorrect) {
        user.topicPerformance[topicIndex].correctAnswers += 1;
      }
      // Update average time spent
      const currentAvg = user.topicPerformance[topicIndex].averageTimeSpent;
      const totalAttempts = user.topicPerformance[topicIndex].totalAttempts;
      user.topicPerformance[topicIndex].averageTimeSpent = 
        ((currentAvg * (totalAttempts - 1)) + (timeSpent || 30)) / totalAttempts;
      user.topicPerformance[topicIndex].lastAttempted = new Date();
    } else {
      // Add new topic performance
      user.topicPerformance.push({
        topic: question.topic,
        category: question.category,
        totalAttempts: 1,
        correctAnswers: isCorrect ? 1 : 0,
        averageTimeSpent: timeSpent || 30,
        lastAttempted: new Date(),
        difficultyLevel: question.difficulty
      });
    }

    if (isCorrect) {
      user.totalPoints += question.points;
      user.virtualBalance += 50; // Earn coins for correct answer
      user.streak += 1;

      // Check for streak achievements
      if (user.streak === 5 && !user.achievements.some(a => a.name === 'Hot Streak')) {
        user.achievements.push({ name: 'Hot Streak', earnedAt: new Date() });
      }
      
      await user.save();
    } else {
      user.streak = 0;
      await user.save();
    }

    res.json({
      correct: isCorrect,
      explanation: question.explanation,
      correctAnswer: question.correctAnswer,
      points: isCorrect ? question.points : 0,
      coinsEarned: isCorrect ? 50 : 0,
      newBalance: user.virtualBalance,
      newPoints: user.totalPoints,
      streak: user.streak,
      newAchievements: isCorrect && user.streak === 5 ? ['Hot Streak'] : [],
      topic: question.topic,
      category: question.category
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete level
router.post('/complete-level', authMiddleware, async (req, res) => {
  try {
    const { levelNumber } = req.body;
    
    const user = await User.findById(req.userId);
    const level = await Level.findOne({ levelNumber });

    if (!user.completedLevels.includes(levelNumber)) {
      user.completedLevels.push(levelNumber);
      user.virtualBalance += level.rewardCoins;
      user.currentLevel = Math.max(user.currentLevel, levelNumber + 1);

      // Achievement for first level
      if (levelNumber === 1 && !user.achievements.some(a => a.name === 'First Steps')) {
        user.achievements.push({ name: 'First Steps', earnedAt: new Date() });
      }

      // Achievement for all levels
      if (user.completedLevels.length === 10 && !user.achievements.some(a => a.name === 'Finance Master')) {
        user.achievements.push({ name: 'Finance Master', earnedAt: new Date() });
      }

      await user.save();
    }

    res.json({
      message: 'Level completed!',
      rewardCoins: level.rewardCoins,
      newBalance: user.virtualBalance,
      totalPoints: user.totalPoints,
      achievements: user.achievements
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unlock level
router.post('/unlock-level', authMiddleware, async (req, res) => {
  try {
    const { levelNumber } = req.body;
    
    const user = await User.findById(req.userId);
    const level = await Level.findOne({ levelNumber });

    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    if (user.virtualBalance < level.unlockCost) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.virtualBalance -= level.unlockCost;
    user.currentLevel = Math.max(user.currentLevel, levelNumber);
    await user.save();

    res.json({
      message: 'Level unlocked!',
      newBalance: user.virtualBalance,
      currentLevel: user.currentLevel
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
