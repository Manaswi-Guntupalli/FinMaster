const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    res.json({
      username: user.username,
      virtualBalance: user.virtualBalance,
      totalPoints: user.totalPoints,
      currentLevel: user.currentLevel,
      completedLevels: user.completedLevels.length,
      achievements: user.achievements,
      streak: user.streak,
      joinedDate: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const topUsers = await User.find()
      .select('username totalPoints virtualBalance completedLevels')
      .sort({ totalPoints: -1 })
      .limit(10);
    
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
