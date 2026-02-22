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

    const user = await User.findById(req.userId);
    
    // Initialize levelProgress if it doesn't exist (for old users)
    if (!user.levelProgress) {
      user.levelProgress = [];
      await user.save();
      console.log('✨ Initialized levelProgress array for user');
    }
    
    console.log('\n🔍 Loading Level', req.params.levelNumber);
    console.log('User has', user.levelProgress.length, 'level progress entries');
    
    // Check if user has progress in this level
    let levelProgress = user.levelProgress.find(lp => lp.levelNumber === parseInt(req.params.levelNumber));
    console.log('Found existing progress?', !!levelProgress);
    if (levelProgress) {
      console.log('Progress details:', {
        questionsAnswered: levelProgress.questionsAnswered.length,
        selectedQuestions: levelProgress.selectedQuestions.length,
        correctAnswers: levelProgress.correctAnswers
      });
    }
    
    let selectedQuestions;
    
    // Only resume with saved questions if user has actually started answering
    // If they haven't answered any questions yet, randomize fresh questions each time
    if (levelProgress && levelProgress.selectedQuestions.length > 0 && levelProgress.questionsAnswered.length > 0) {
      // Resume with the same questions (user is in the middle of quiz)
      console.log('🔄 Resuming with saved questions - user has answered', levelProgress.questionsAnswered.length, 'questions');
      const questionsFromDB = await Question.find({ 
        _id: { $in: levelProgress.selectedQuestions }
      });
      
      // Check if the questions still exist (important after re-seeding database)
      if (questionsFromDB.length === 0 || questionsFromDB.length < levelProgress.selectedQuestions.length) {
        console.log('⚠️ Old progress has invalid question IDs. Clearing and starting fresh...');
        // Clear the invalid progress
        user.levelProgress = user.levelProgress.filter(lp => lp.levelNumber !== parseInt(req.params.levelNumber));
        await user.save();
        levelProgress = null; // Force new question selection
      } else {
        // Sort questions to match the original order from levelProgress.selectedQuestions
        // This is CRITICAL - MongoDB find() doesn't preserve order!
        selectedQuestions = levelProgress.selectedQuestions.map(id => 
          questionsFromDB.find(q => q._id.toString() === id.toString())
        ).filter(q => q !== undefined); // Filter out any missing questions
      }
    } else if (levelProgress && levelProgress.questionsAnswered.length === 0) {
      // User has progress entry but hasn't answered anything - DELETE it and randomize new questions
      console.log('🎲 User hasn\'t answered any questions yet - DELETING old progress and selecting NEW random questions');
      user.levelProgress = user.levelProgress.filter(lp => lp.levelNumber !== parseInt(req.params.levelNumber));
      await user.save();
      levelProgress = null; // Force new random selection
    }
    
    if (!levelProgress || !selectedQuestions) {
      // Select 5 questions from each difficulty level randomly
      const easyQuestions = await Question.find({ 
        levelNumber: req.params.levelNumber, 
        difficulty: 'easy' 
      });
      const mediumQuestions = await Question.find({ 
        levelNumber: req.params.levelNumber, 
        difficulty: 'medium' 
      });
      const hardQuestions = await Question.find({ 
        levelNumber: req.params.levelNumber, 
        difficulty: 'hard' 
      });
      
      // Randomly select 5 from each difficulty (or all if less than 5)
      const selectedEasy = shuffleArray(easyQuestions).slice(0, 5);
      const selectedMedium = shuffleArray(mediumQuestions).slice(0, 5);
      const selectedHard = shuffleArray(hardQuestions).slice(0, 5);
      
      // Combine: Easy first → Medium → Hard (proper difficulty flow)
      selectedQuestions = [...selectedEasy, ...selectedMedium, ...selectedHard];
      
      console.log('📊 Question Selection:', {
        availableEasy: easyQuestions.length,
        availableMedium: mediumQuestions.length,
        availableHard: hardQuestions.length,
        selectedEasy: selectedEasy.length,
        selectedMedium: selectedMedium.length,
        selectedHard: selectedHard.length,
        total: selectedQuestions.length
      });
      console.log('🎲 Selected Question IDs:', selectedQuestions.map(q => q._id.toString()));
      console.log('📝 First Question:', selectedQuestions[0]?.question.substring(0, 60) + '...');
      
      // Create or update level progress
      if (!levelProgress) {
        user.levelProgress.push({
          levelNumber: parseInt(req.params.levelNumber),
          questionsAnswered: [],
          correctAnswers: 0,
          pointsEarned: 0,
          coinsEarned: 0,
          selectedQuestions: selectedQuestions.map(q => q._id.toString()),
          startedAt: new Date(),
          lastUpdated: new Date()
        });
        await user.save();
        console.log('✅ Created new level progress, saved to DB');
        // Get the newly created progress
        levelProgress = user.levelProgress.find(lp => lp.levelNumber === parseInt(req.params.levelNumber));
        console.log('Newly created progress:', levelProgress ? 'Found' : 'NOT FOUND');
      } else {
        levelProgress.selectedQuestions = selectedQuestions.map(q => q._id.toString());
        levelProgress.lastUpdated = new Date();
        await user.save();
      }
    }
    
    // Return questions with answered status
    const answeredIds = levelProgress ? levelProgress.questionsAnswered : [];
    
    res.json({
      level,
      questions: selectedQuestions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        points: q.points,
        difficulty: q.difficulty,
        isAnswered: answeredIds.includes(q._id.toString())
      })),
      progress: levelProgress ? {
        questionsAnswered: levelProgress.questionsAnswered.length,
        totalQuestions: selectedQuestions.length,
        correctAnswers: levelProgress.correctAnswers,
        pointsEarned: levelProgress.pointsEarned,
        coinsEarned: levelProgress.coinsEarned
      } : null
    });
    
    console.log('📤 Returning response with progress:', levelProgress ? 'YES' : 'NO');
    if (levelProgress) {
      console.log('   Questions answered:', levelProgress.questionsAnswered.length, '/', selectedQuestions.length);
    }
  } catch (error) {
    console.error('❌ Error in get level:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

    // Initialize levelProgress if it doesn't exist (for old users)
    if (!user.levelProgress) {
      user.levelProgress = [];
      console.log('✨ Initialized levelProgress array for user');
    }

    console.log('\n📝 Submitting answer for level', question.levelNumber);
    console.log('User has', user.levelProgress.length, 'level progress entries');

    // Update level progress
    let levelProgress = user.levelProgress.find(lp => lp.levelNumber === question.levelNumber);
    console.log('Found level progress?', !!levelProgress);
    
    if (!levelProgress) {
      // If progress doesn't exist, create it (shouldn't happen, but safety check)
      user.levelProgress.push({
        levelNumber: question.levelNumber,
        questionsAnswered: [questionId],
        correctAnswers: isCorrect ? 1 : 0,
        pointsEarned: isCorrect ? question.points : 0,
        coinsEarned: isCorrect ? 50 : 0,
        selectedQuestions: [],
        startedAt: new Date(),
        lastUpdated: new Date()
      });
    } else {
      // Check if this question was already answered
      if (!levelProgress.questionsAnswered.includes(questionId)) {
        levelProgress.questionsAnswered.push(questionId);
        
        if (isCorrect) {
          levelProgress.correctAnswers += 1;
          levelProgress.pointsEarned += question.points;
          levelProgress.coinsEarned += 50;
        }
        
        levelProgress.lastUpdated = new Date();
      }
    }

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

    const finalProgress = user.levelProgress.find(lp => lp.levelNumber === question.levelNumber);
    console.log('✅ Progress saved for level', question.levelNumber);
    console.log('   Questions answered:', finalProgress?.questionsAnswered.length || 0);
    console.log('   Correct answers:', finalProgress?.correctAnswers || 0);
    console.log('   Points earned:', finalProgress?.pointsEarned || 0);

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

    // Initialize levelProgress if it doesn't exist (for old users)
    if (!user.levelProgress) {
      user.levelProgress = [];
    }

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

      // Clear level progress after completion
      user.levelProgress = user.levelProgress.filter(lp => lp.levelNumber !== levelNumber);

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
