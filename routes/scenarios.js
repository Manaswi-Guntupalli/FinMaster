const express = require('express');
const router = express.Router();
const Scenario = require('../models/Scenario');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { enhanceScenarioExplanation } = require('../services/aiService');

// GET all scenarios with unlock status
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Check if user has completed all 10 levels
    const hasCompletedAllLevels = user.completedLevels.length >= 10;
    
    if (!hasCompletedAllLevels) {
      return res.json({
        unlocked: false,
        message: 'Complete all 10 levels to unlock Real-Life Financial Scenarios!',
        scenarios: []
      });
    }

    const scenarios = await Scenario.find().sort({ scenarioNumber: 1 });
    
    const scenariosWithProgress = scenarios.map(scenario => {
      const progress = user.scenarioProgress.find(
        sp => sp.scenarioNumber === scenario.scenarioNumber
      );
      
      const isCompleted = user.completedScenarios.includes(scenario.scenarioNumber);
      
      // Scenario 1 is always unlocked after Level 10
      // Scenario 2+ require previous scenario completion
      const isUnlocked = scenario.scenarioNumber === 1 || 
                        user.completedScenarios.includes(scenario.scenarioNumber - 1);
      
      return {
        scenarioNumber: scenario.scenarioNumber,
        title: scenario.title,
        description: scenario.description,
        icon: scenario.icon,
        category: scenario.category,
        totalQuestions: scenario.questions.length,
        isUnlocked,
        isCompleted,
        currentQuestion: progress ? progress.currentQuestion : 1,
        correctAnswers: progress ? progress.correctAnswers : 0,
        totalPointsEarned: progress ? progress.totalPointsEarned : 0,
        totalPointsLost: progress ? progress.totalPointsLost : 0
      };
    });

    res.json({
      unlocked: true,
      scenarios: scenariosWithProgress
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
});

// GET specific scenario details
router.get('/:scenarioNumber', auth, async (req, res) => {
  try {
    const scenarioNumber = parseInt(req.params.scenarioNumber);
    const user = await User.findById(req.userId);
    
    // Check if user has completed all 10 levels
    if (user.completedLevels.length < 10) {
      return res.status(403).json({ error: 'Complete all 10 levels first!' });
    }
    
    // Check if scenario is unlocked
    if (scenarioNumber > 1 && !user.completedScenarios.includes(scenarioNumber - 1)) {
      return res.status(403).json({ error: 'Complete previous scenario first!' });
    }
    
    const scenario = await Scenario.findOne({ scenarioNumber });
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    const progress = user.scenarioProgress.find(sp => sp.scenarioNumber === scenarioNumber);
    const isCompleted = user.completedScenarios.includes(scenarioNumber);
    
    res.json({
      scenarioNumber: scenario.scenarioNumber,
      title: scenario.title,
      description: scenario.description,
      icon: scenario.icon,
      category: scenario.category,
      totalQuestions: scenario.questions.length,
      currentQuestion: progress ? progress.currentQuestion : 1,
      isCompleted,
      progress: progress || null
    });
  } catch (error) {
    console.error('Error fetching scenario:', error);
    res.status(500).json({ error: 'Failed to fetch scenario' });
  }
});

// GET specific question in scenario
router.get('/:scenarioNumber/question/:questionNumber', auth, async (req, res) => {
  try {
    const scenarioNumber = parseInt(req.params.scenarioNumber);
    const questionNumber = parseInt(req.params.questionNumber);
    const user = await User.findById(req.userId);
    
    // Check if scenario is unlocked
    if (user.completedLevels.length < 10 || 
        (scenarioNumber > 1 && !user.completedScenarios.includes(scenarioNumber - 1))) {
      return res.status(403).json({ error: 'Scenario not unlocked' });
    }
    
    const scenario = await Scenario.findOne({ scenarioNumber });
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    const question = scenario.questions.find(q => q.questionNumber === questionNumber);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check sequential access - can't skip questions
    const progress = user.scenarioProgress.find(sp => sp.scenarioNumber === scenarioNumber);
    if (progress && questionNumber > progress.currentQuestion) {
      return res.status(403).json({ 
        error: 'Answer current question first!',
        currentQuestion: progress.currentQuestion
      });
    }
    
    // Don't send correct answer to frontend
    const questionObj = question.toObject();
    const { correctAnswer, explanation, _id, ...questionData } = questionObj;
    
    res.json({
      questionNumber: question.questionNumber,
      questionType: question.questionType,
      situation: question.situation,
      question: question.question,
      options: question.options,
      virtualMoneyContext: question.virtualMoneyContext,
      nextQuestionContext: question.nextQuestionContext,
      correctPoints: question.correctPoints,
      wrongPenalty: question.wrongPenalty,
      totalQuestions: scenario.questions.length,
      scenarioTitle: scenario.title
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// POST answer to question
router.post('/:scenarioNumber/answer', auth, async (req, res) => {
  try {
    const scenarioNumber = parseInt(req.params.scenarioNumber);
    const { questionNumber, userAnswer } = req.body;
    
    console.log('📝 Answer submission:', { scenarioNumber, questionNumber, userAnswer });
    
    const user = await User.findById(req.userId);
    const scenario = await Scenario.findOne({ scenarioNumber });
    
    if (!scenario) {
      console.error('❌ Scenario not found:', scenarioNumber);
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    const question = scenario.questions.find(q => q.questionNumber === questionNumber);
    if (!question) {
      console.error('❌ Question not found:', questionNumber);
      return res.status(404).json({ error: 'Question not found' });
    }
    
    console.log('✅ Question found. Correct answer:', question.correctAnswer, 'Type:', typeof question.correctAnswer);
    console.log('📥 User answer:', userAnswer, 'Type:', typeof userAnswer);
    
    // Check if answer is correct 
    let isCorrect;
    if (question.questionType === 'yes-no') {
      // For yes-no questions: 0 = Yes (index 0), 1 = No (index 1)
      // correctAnswer is stored as boolean: true = Yes, false = No
      const userBoolAnswer = userAnswer === 0 ? true : false;
      isCorrect = userBoolAnswer === question.correctAnswer;
      console.log('🔄 Yes/No - User selected index:', userAnswer, '→ boolean:', userBoolAnswer, '| Correct:', question.correctAnswer);
    } else {
      // For MCQ questions: direct index comparison
      isCorrect = Number(userAnswer) === Number(question.correctAnswer);
      console.log('🔄 MCQ - User index:', userAnswer, '| Correct index:', question.correctAnswer);
    }
    
    console.log('📊 Is correct?', isCorrect);
    const pointsChange = isCorrect ? question.correctPoints : -question.wrongPenalty;
    
    // Update user's total points
    user.totalPoints = Math.max(0, user.totalPoints + pointsChange);
    
    // Find or create scenario progress
    let progress = user.scenarioProgress.find(sp => sp.scenarioNumber === scenarioNumber);
    if (!progress) {
      progress = {
        scenarioNumber,
        currentQuestion: 1,
        answeredQuestions: [],
        correctAnswers: 0,
        wrongAnswers: 0,
        totalPointsEarned: 0,
        totalPointsLost: 0,
        isCompleted: false,
        startedAt: new Date()
      };
      user.scenarioProgress.push(progress);
    }
    
    // Record the answer
    progress.answeredQuestions.push({
      questionNumber,
      userAnswer,
      isCorrect,
      pointsChange,
      answeredAt: new Date()
    });
    
    if (isCorrect) {
      progress.correctAnswers += 1;
      progress.totalPointsEarned += question.correctPoints;
    } else {
      progress.wrongAnswers += 1;
      progress.totalPointsLost += question.wrongPenalty;
    }
    
    // Check if scenario is complete
    const isScenarioComplete = questionNumber === scenario.questions.length;
    
    if (isScenarioComplete) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      
      // Add to completedScenarios if not already there
      if (!user.completedScenarios.includes(scenarioNumber)) {
        user.completedScenarios.push(scenarioNumber);
      }
      
      console.log('🎉 Scenario completed! User now has', user.completedScenarios.length, 'completed scenarios');
    } else {
      // Move to next question
      progress.currentQuestion = questionNumber + 1;
      console.log('➡️ Moving to next question:', progress.currentQuestion);
    }
    
    await user.save();
    console.log('✅ User progress saved successfully');
    
    // Prepare response
    let explanation = question.explanation;
    
    // If answer is wrong, optionally enhance explanation with AI
    if (!isCorrect) {
      try {
        const enhancedExplanation = await enhanceScenarioExplanation(
          question.situation,
          question.question,
          userAnswer,
          question.correctAnswer,
          question.options,
          question.explanation
        );
        if (enhancedExplanation) {
          explanation = enhancedExplanation;
        }
      } catch (aiError) {
        console.error('AI explanation enhancement failed, using default:', aiError.message);
        // Use default explanation
      }
    }
    
    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      pointsChange,
      totalPoints: user.totalPoints,
      explanation: !isCorrect ? explanation : null,
      nextQuestionContext: question.nextQuestionContext,
      isScenarioComplete,
      currentQuestion: progress.currentQuestion,
      progress: {
        correctAnswers: progress.correctAnswers,
        wrongAnswers: progress.wrongAnswers,
        totalPointsEarned: progress.totalPointsEarned,
        totalPointsLost: progress.totalPointsLost
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// POST reset/replay scenario
router.post('/:scenarioNumber/reset', auth, async (req, res) => {
  try {
    const scenarioNumber = parseInt(req.params.scenarioNumber);
    const user = await User.findById(req.userId);
    
    // Remove from completed scenarios to allow replay
    user.completedScenarios = user.completedScenarios.filter(s => s !== scenarioNumber);
    
    // Reset progress
    user.scenarioProgress = user.scenarioProgress.filter(sp => sp.scenarioNumber !== scenarioNumber);
    
    await user.save();
    
    res.json({ message: 'Scenario reset successfully!' });
  } catch (error) {
    console.error('Error resetting scenario:', error);
    res.status(500).json({ error: 'Failed to reset scenario' });
  }
});

module.exports = router;
