const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const {
  chatWithAI,
  getQuestionHint,
  enhanceExplanation,
  analyzeProgress,
  explainConcept,
  identifyWeakTopics,
  generateLearningPath,
  suggestNextDifficulty,
  generatePracticeQuestion,
  getMotivationalMessage,
  explainWrongAnswer
} = require('../services/aiService');

const router = express.Router();

// General AI chat with user profile
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = await User.findById(req.userId);
    const userProfile = {
      ageGroup: user.ageGroup,
      preferredLanguage: user.preferredLanguage,
      financialGoals: user.financialGoals
    };

    const response = await chatWithAI(message, context || '', userProfile);
    
    // Track AI interaction
    user.aiInteractions.push({
      type: 'chat',
      topic: context || 'general',
      timestamp: new Date()
    });
    await user.save();
    
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get hint for a question
router.post('/hint', authMiddleware, async (req, res) => {
  try {
    const { question, options, difficulty, topic } = req.body;
    
    if (!question || !options) {
      return res.status(400).json({ message: 'Question and options are required' });
    }

    const hint = await getQuestionHint(question, options, difficulty, topic || '');
    
    const user = await User.findById(req.userId);
    user.aiInteractions.push({
      type: 'hint',
      topic: topic || 'unknown',
      timestamp: new Date()
    });
    await user.save();
    
    res.json({ hint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enhanced explanation
router.post('/enhance-explanation', authMiddleware, async (req, res) => {
  try {
    const { question, correctAnswer, userAnswer, originalExplanation } = req.body;
    
    const enhancedExplanation = await enhanceExplanation(
      question,
      correctAnswer,
      userAnswer,
      originalExplanation
    );
    
    res.json({ enhancedExplanation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get progress analysis
router.get('/analyze-progress', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    const analysis = await analyzeProgress(user, user.completedLevels, user.topicPerformance || []);
    
    user.lastAIAnalysis = new Date();
    await user.save();
    
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Explain a concept
router.post('/explain', authMiddleware, async (req, res) => {
  try {
    const { concept } = req.body;
    
    if (!concept) {
      return res.status(400).json({ message: 'Concept is required' });
    }

    const user = await User.findById(req.userId);
    const explanation = await explainConcept(concept, user.ageGroup);
    
    user.aiInteractions.push({
      type: 'concept',
      topic: concept,
      timestamp: new Date()
    });
    await user.save();
    
    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NEW: Identify weak topics
router.get('/weak-topics', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.topicPerformance || user.topicPerformance.length === 0) {
      return res.json({ weakTopics: [] });
    }
    
    const weakTopics = await identifyWeakTopics(user.topicPerformance || [], user);
    
    // Update user's weak topics in database
    if (weakTopics && weakTopics.length > 0) {
      user.weakTopics = weakTopics.map(wt => ({
        topic: wt.topic,
        category: wt.category,
        weaknessScore: wt.weaknessScore,
        identifiedAt: new Date(),
        improvementSuggestions: wt.suggestion ? [wt.suggestion] : []
      }));
      
      await user.save();
    }
    
    res.json({ weakTopics });
  } catch (error) {
    console.error('Weak Topics Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// NEW: Generate personalized learning path
router.get('/learning-path', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // First, identify weak topics from current performance
    let weakTopics = [];
    if (user.topicPerformance && user.topicPerformance.length > 0) {
      weakTopics = await identifyWeakTopics(user.topicPerformance, user);
    }
    
    // Generate learning path based on weak topics and overall performance
    const learningPath = await generateLearningPath(
      user, 
      weakTopics, 
      user.topicPerformance || []
    );
    
    // Update user's learning path in database
    if (learningPath && learningPath.length > 0) {
      // Convert priority strings to numbers for database storage
      const convertPriorityToNumber = (priority) => {
        if (typeof priority === 'number') return priority;
        const priorityStr = String(priority).toLowerCase();
        if (priorityStr === 'high') return 10;
        if (priorityStr === 'medium') return 5;
        if (priorityStr === 'low') return 2;
        return 5; // default to medium
      };
      
      user.learningPath = learningPath.map(lp => ({
        topic: lp.level || lp.topic,
        category: lp.category,
        priority: convertPriorityToNumber(lp.priority),
        status: 'pending',
        recommendedAt: new Date()
      }));
      
      await user.save();
    }
    
    res.json({ learningPath });
  } catch (error) {
    console.error('Learning Path Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// NEW: Get adaptive difficulty suggestion
router.post('/suggest-difficulty', authMiddleware, async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    const user = await User.findById(req.userId);
    const suggestedDifficulty = await suggestNextDifficulty(user.topicPerformance || [], topic);
    
    res.json({ suggestedDifficulty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NEW: Generate practice question
router.post('/generate-question', authMiddleware, async (req, res) => {
  try {
    const { topic, category, difficulty } = req.body;
    
    if (!topic || !category) {
      return res.status(400).json({ message: 'Topic and category are required' });
    }
    
    const user = await User.findById(req.userId);
    const question = await generatePracticeQuestion(
      topic, 
      category, 
      difficulty || 'medium',
      user.ageGroup
    );
    
    res.json({ question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NEW: Get motivational message
router.get('/motivation', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Determine recent performance
    let recentPerformance = 'good';
    if (user.topicPerformance && user.topicPerformance.length > 0) {
      const recentTopics = user.topicPerformance.slice(-3);
      const avgAccuracy = recentTopics.reduce((sum, tp) => {
        return sum + (tp.totalAttempts > 0 ? (tp.correctAnswers / tp.totalAttempts) : 0);
      }, 0) / recentTopics.length;
      
      if (avgAccuracy < 0.4) recentPerformance = 'needs improvement';
      else if (avgAccuracy > 0.8) recentPerformance = 'excellent';
    }
    
    const motivation = await getMotivationalMessage(user, recentPerformance);
    
    res.json({ motivation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NEW: Explain wrong answer
router.post('/explain-wrong', authMiddleware, async (req, res) => {
  try {
    const { question, selectedOption, correctOption, topic } = req.body;
    
    if (!question || !selectedOption || !correctOption) {
      return res.status(400).json({ message: 'Question, selected option, and correct option are required' });
    }
    
    const explanation = await explainWrongAnswer(question, selectedOption, correctOption, topic || '');
    
    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
