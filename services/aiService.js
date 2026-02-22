const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuration for India-specific context
const INDIA_CONTEXT = `You are an expert financial literacy coach specifically for young Indians (ages 13-40). 
Your knowledge includes:
- Indian banking system (RBI, nationalized banks, payment banks)
- Digital payments (UPI, BHIM, Paytm, PhonePe, Google Pay)
- Indian taxation (Income Tax, GST, PAN, Aadhaar)
- Government schemes (PPF, EPF, NSC, Sukanya Samriddhi, PMJDY, APY)
- Indian stock market (NSE, BSE, NIFTY, SENSEX, Zerodha, Groww)
- Indian mutual funds, SIPs, and investment options
- Indian financial regulations (SEBI, IRDAI, RBI guidelines)
- Indian insurance (LIC, health insurance, term insurance)
- Indian real estate and property laws
- Financial planning for Indian youth including education loans, bike/car loans
- Indian currency (₹ Rupees), inflation rates, and economic conditions
Always use Indian examples, terminology, and context. Use ₹ for currency.`;

// AI Chat function with India-specific context
async function chatWithAI(message, context = '', userProfile = {}) {
  try {
    const systemPrompt = `${INDIA_CONTEXT}
    
User Profile: Age ${userProfile.ageGroup || '18-24'}, Language: ${userProfile.preferredLanguage || 'English'}
${userProfile.financialGoals ? 'Financial Goals: ' + userProfile.financialGoals.join(', ') : ''}

Provide clear, encouraging responses in simple language with Indian examples. 
If speaking to teens (13-17), use relatable examples like pocket money, first bank account, student savings.
If speaking to 18-24, focus on college expenses, first job, investments, credit cards.
Keep responses under 200 words unless explaining complex Indian financial topics.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: context ? `Context: ${context}\n\nQuestion: ${message}` : message
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get AI response');
  }
}

// Get AI hint for a question with India-specific context
async function getQuestionHint(question, options, difficulty = 'medium', topic = '') {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${INDIA_CONTEXT}
          
You are a helpful tutor for Indian youth learning finance. Provide hints that guide students 
toward the right answer without revealing it directly. Use Indian examples and terminology. 
Keep hints under 60 words.`
        },
        {
          role: "user",
          content: `Topic: ${topic}\nDifficulty: ${difficulty}\n\nQuestion: ${question}\n\nOptions:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nProvide a helpful hint with an Indian example.`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get hint');
  }
}

// Enhance explanation with AI and Indian context
async function enhanceExplanation(question, correctAnswer, userAnswer, originalExplanation, topic = '') {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${INDIA_CONTEXT}
          
You are an encouraging finance tutor for Indian youth. Rewrite explanations in a friendly way, 
add helpful tips and real Indian examples. If wrong answer, explain why it's incorrect gently. 
Keep under 150 words.`
        },
        {
          role: "user",
          content: `Topic: ${topic}\nQuestion: ${question}\nThey chose: ${userAnswer}\nCorrect answer: ${correctAnswer}\nOriginal explanation: ${originalExplanation}\n\nRewrite this explanation with Indian context and examples.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return originalExplanation; // Fallback to original
  }
}

// Analyze user progress and give recommendations with weak topic identification
async function analyzeProgress(userData, completedLevels, topicPerformance = []) {
  try {
    // Calculate performance metrics
    const performanceData = topicPerformance.map(tp => ({
      topic: tp.topic,
      category: tp.category,
      accuracy: tp.totalAttempts > 0 ? ((tp.correctAnswers / tp.totalAttempts) * 100).toFixed(1) : 0,
      attempts: tp.totalAttempts
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${INDIA_CONTEXT}
          
You are analyzing an Indian student's financial literacy progress. Provide:
1. Brief encouragement (1 sentence)
2. Specific recommendation for improvement
3. Next topic to focus on
4. One actionable tip for Indian context
Keep under 150 words.`
        },
        {
          role: "user",
          content: `Stats:
- Total Points: ${userData.totalPoints}
- Current Level: ${userData.currentLevel}
- Completed Levels: ${completedLevels.length}/10
- Current Streak: ${userData.streak} days
- Virtual Balance: ₹${userData.virtualBalance}

Topic Performance:
${performanceData.map(p => `- ${p.topic} (${p.category}): ${p.accuracy}% accuracy, ${p.attempts} attempts`).join('\n')}

Provide analysis and recommendations.`
        }
      ],
      max_tokens: 250,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to analyze progress');
  }
}

// NEW: Identify weak topics using AI analysis
async function identifyWeakTopics(topicPerformance, userData) {
  try {
    if (!topicPerformance || topicPerformance.length === 0) {
      return [];
    }

    const performanceData = topicPerformance.map(tp => ({
      topic: tp.topic,
      category: tp.category,
      accuracy: tp.totalAttempts > 0 ? ((tp.correctAnswers / tp.totalAttempts) * 100).toFixed(1) : 0,
      attempts: tp.totalAttempts,
      avgTime: tp.averageTimeSpent
    })).filter(p => p.attempts > 0);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${INDIA_CONTEXT}
          
Analyze topic performance data and identify weak areas. Return a JSON array of weak topics with:
- topic name
- category 
- weaknessScore (0-100, where 100 is weakest)
- reason (brief explanation why it's weak)
- suggestions (array of 2-3 specific improvement tips for Indian context)

Consider: accuracy < 60% is weak, accuracy < 40% is very weak, taking too long also indicates weakness.
Focus on topics with sufficient attempts (3+) to ensure statistical significance.`
        },
        {
          role: "user",
          content: `User Age: ${userData.ageGroup || '18-24'}
          
Performance Data:
${performanceData.map(p => `- ${p.topic} (${p.category}): ${p.accuracy}% correct, ${p.attempts} attempts, avg ${p.avgTime}s`).join('\n')}

Identify weak topics (return valid JSON array only).`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response.weakTopics || [];
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Fallback: simple algorithm
    return topicPerformance
      .filter(tp => tp.totalAttempts >= 3)
      .map(tp => {
        const accuracy = (tp.correctAnswers / tp.totalAttempts) * 100;
        if (accuracy < 60) {
          return {
            topic: tp.topic,
            category: tp.category,
            weaknessScore: 100 - accuracy,
            reason: `Low accuracy (${accuracy.toFixed(1)}%)`,
            suggestions: ['Practice more questions on this topic', 'Review basic concepts', 'Ask AI for explanations']
          };
        }
        return null;
      })
      .filter(w => w !== null);
  }
}

// NEW: Generate personalized learning path
async function generateLearningPath(userData, weakTopics, topicPerformance) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${INDIA_CONTEXT}
          
Create a personalized learning path for an Indian student. Return JSON array with:
- topic (specific financial topic)
- category
- priority (1-10, 10 is highest)
- reason (why this is important for them)
- estimatedDays (days to master)
- resources (array of 2-3 Indian resources/tips)

Prioritize:
1. Weak topics that need immediate attention
2. Age-appropriate topics (e.g., UPI for teens, tax planning for 25+)
3. Foundational topics before advanced ones
4. Practical Indian financial skills`
        },
        {
          role: "user",
          content: `User Profile:
- Age: ${userData.ageGroup || '18-24'}
- Current Level: ${userData.currentLevel}
- Financial Goals: ${userData.financialGoals ? userData.financialGoals.join(', ') : 'General financial literacy'}

Weak Topics:
${weakTopics.map(w => `- ${w.topic} (${w.category}): weakness score ${w.weaknessScore}`).join('\n')}

Create learning path (return valid JSON only).`
        }
      ],
      max_tokens: 600,
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response.learningPath || [];
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Fallback learning path
    return weakTopics.slice(0, 3).map((topic, index) => ({
      topic: topic.topic,
      category: topic.category,
      priority: 10 - index,
      reason: 'Identified as weak area',
      estimatedDays: 7,
      resources: ['Practice more questions', 'Read explanations carefully']
    }));
  }
}

// NEW: Adaptive difficulty suggestion
async function suggestNextDifficulty(topicPerformance, currentTopic) {
  const topicData = topicPerformance.find(tp => tp.topic === currentTopic);
  
  if (!topicData || topicData.totalAttempts < 3) {
    return 'medium'; // Default
  }
  
  const accuracy = (topicData.correctAnswers / topicData.totalAttempts) * 100;
  
  if (accuracy >= 80) return 'hard';
  if (accuracy >= 60) return 'medium';
  return 'easy';
}

// NEW: Generate practice questions using AI
async function generatePracticeQuestion(topic, category, difficulty, ageGroup = '18-24') {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${INDIA_CONTEXT}
          
Generate a multiple-choice question for Indian youth. Return JSON with:
- question (clear, specific question)
- options (array of 4 options)
- correctAnswer (index 0-3)
- explanation (why correct answer is right, with Indian context)
- practicalExample (real-world Indian scenario)
- relatedTerms (array of Indian financial terms)

Make it relevant to Indian context with local examples, currency in ₹, and Indian financial institutions.`
        },
        {
          role: "user",
          content: `Create a ${difficulty} question about ${topic} (${category}) for age group ${ageGroup}.
Focus on practical Indian scenarios. Return valid JSON only.`
        }
      ],
      max_tokens: 400,
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate practice question');
  }
}

// Explain a financial concept with Indian context
async function explainConcept(concept, userAge = '18-24') {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${INDIA_CONTEXT}
          
You are a financial educator for Indian youth. Explain concepts in simple terms with:
1. Clear definition
2. Real Indian example
3. Why it matters for Indian youth
4. One practical tip
Keep under 150 words.`
        },
        {
          role: "user",
          content: `Explain "${concept}" for age group ${userAge} with Indian context and examples.`
        }
      ],
      max_tokens: 250,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to explain concept');
  }
}

// NEW: Get motivational message based on performance
async function getMotivationalMessage(userData, recentPerformance = 'good') {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${INDIA_CONTEXT}
          
Provide a brief motivational message (2-3 sentences) for an Indian student learning finance. 
Be encouraging and culturally appropriate. Reference Indian success stories or relatable examples when possible.`
        },
        {
          role: "user",
          content: `User: Level ${userData.currentLevel}, ${userData.totalPoints} points, ${userData.streak} day streak.
Recent performance: ${recentPerformance}. Give motivation.`
        }
      ],
      max_tokens: 100,
      temperature: 0.8
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return "Keep going! Every question brings you closer to financial mastery! 🎯";
  }
}

// NEW: Explain why an answer was wrong with Indian examples
async function explainWrongAnswer(question, selectedOption, correctOption, topic) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${INDIA_CONTEXT}
          
Explain why the selected answer is incorrect and guide toward correct understanding.
Be encouraging and use Indian examples. Keep under 100 words.`
        },
        {
          role: "user",
          content: `Topic: ${topic}
Question: ${question}
They selected: ${selectedOption}
Correct answer: ${correctOption}

Explain the mistake and clarify the concept.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return null;
  }
}

module.exports = {
  chatWithAI,
  getQuestionHint,
  enhanceExplanation,
  analyzeProgress,
  explainConcept,
  // New advanced features
  identifyWeakTopics,
  generateLearningPath,
  suggestNextDifficulty,
  generatePracticeQuestion,
  getMotivationalMessage,
  explainWrongAnswer
};
