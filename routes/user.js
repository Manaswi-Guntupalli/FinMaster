const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

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

// Upload profile picture
router.post('/upload-profile-picture', authMiddleware, (req, res) => {
  console.log('📸 Profile picture upload request received');
  console.log('User ID:', req.userId);
  
  upload.single('profilePicture')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error occurred
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      // Other errors
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }

    try {
      console.log('File received:', req.file ? req.file.filename : 'No file');
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const user = await User.findById(req.userId);
      console.log('User found:', user.username);
      
      // Delete old profile picture if exists
      if (user.profilePicture) {
        const fs = require('fs');
        const oldPath = path.join(__dirname, '..', 'public', user.profilePicture);
        console.log('Deleting old picture:', oldPath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log('Old picture deleted');
        }
      }

      // Update user with new profile picture path
      const profilePicturePath = '/uploads/profiles/' + req.file.filename;
      user.profilePicture = profilePicturePath;
      await user.save();

      console.log('✅ Profile picture saved:', profilePicturePath);
      
      res.json({ 
        message: 'Profile picture uploaded successfully',
        profilePicture: profilePicturePath
      });
    } catch (error) {
      console.error('❌ Profile picture upload error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
});

module.exports = router;
