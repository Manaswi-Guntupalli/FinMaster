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
    
    // Generate contextual fallback hints based on question analysis
    return generateContextualHint(question, options, difficulty, topic);
  }
}

// Generate contextual hints when AI is unavailable
function generateContextualHint(question, options, difficulty, topic) {
  const questionLower = question.toLowerCase();
  const optionsText = options.join(' ').toLowerCase();
  
  let hint = "💡 ";
  
  // Analyze question keywords for specific guidance
  if (questionLower.includes('budget') || questionLower.includes('budgeting')) {
    hint += "Think about income vs expenses. A budget helps track where your money goes. In India, consider both fixed costs (rent, EMI) and variable expenses (groceries, entertainment).";
  }
  else if (questionLower.includes('saving') || questionLower.includes('save')) {
    hint += "Consider the 50-30-20 rule: 50% needs, 30% wants, 20% savings. In India, PPF, Fixed Deposits, and Mutual Funds are popular saving options. Think about your financial goals!";
  }
  else if (questionLower.includes('emergency fund')) {
    hint += "Emergency funds should cover 3-6 months of expenses. Keep it in liquid assets like savings accounts. Think: what if you suddenly lose your income?";
  }
  else if (questionLower.includes('credit card') || questionLower.includes('credit score')) {
    hint += "Credit cards are loans, not free money! Pay full balance to avoid interest (often 36-42% annually in India). Credit scores range from 300-900. Higher is better!";
  }
  else if (questionLower.includes('invest') || questionLower.includes('stock') || questionLower.includes('mutual fund')) {
    hint += "Investment involves risk vs return. Diversify your portfolio. In India, consider equity, debt, and gold. Think long-term! SIP (Systematic Investment Plan) helps average costs.";
  }
  else if (questionLower.includes('debt') || questionLower.includes('loan') || questionLower.includes('emi')) {
    hint += "Debt has interest costs. Compare interest rates! Home loans are cheapest (~7-9%), personal loans costly (~11-15%). Pay high-interest debt first. EMI = Principal + Interest.";
  }
  else if (questionLower.includes('insurance') || questionLower.includes('policy')) {
    hint += "Insurance protects against financial risks. Term insurance for life, health insurance for medical costs. Don't mix insurance with investment! Consider coverage amount carefully.";
  }
  else if (questionLower.includes('tax') || questionLower.includes('income tax') || questionLower.includes('80c')) {
    hint += "In India, income tax has slabs. Section 80C allows ₹1.5 lakh deduction (EPF, PPF, ELSS, life insurance). New tax regime vs old - calculate which saves more!";
  }
  else if (questionLower.includes('inflation')) {
    hint += "Inflation reduces purchasing power. If inflation is 6%, you need ₹106 next year to buy what costs ₹100 today. Your investments should beat inflation!";
  }
  else if (questionLower.includes('interest') || questionLower.includes('compound')) {
    hint += "Compound interest = interest on interest! It grows wealth exponentially. Simple interest is linear. Albert Einstein called compound interest the 8th wonder. Start investing early!";
  }
  else if (questionLower.includes('retirement') || questionLower.includes('pension')) {
    hint += "Retirement planning needs early start. Calculate: Monthly expenses × 12 × 25 years. NPS (National Pension System) offers tax benefits. Consider inflation when planning!";
  }
  else if (questionLower.includes('financial goal') || questionLower.includes('target')) {
    hint += "SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound. Short-term (<3 years), Medium-term (3-5 years), Long-term (>5 years). Plan investments accordingly!";
  }
  else if (questionLower.includes('dividend') || questionLower.includes('shares')) {
    hint += "Dividends are company profits shared with shareholders. In India, dividend income is taxable. Capital gains from shares depend on holding period: <1 year = short-term, >1 year = long-term.";
  }
  else if (questionLower.includes('risk') || questionLower.includes('diversif')) {
    hint += "Don't put all eggs in one basket! Diversification spreads risk across assets. High risk = High potential return (and vice versa). Match risk with your goals and age.";
  }
  else if (questionLower.includes('percent') || questionLower.includes('%') || questionLower.includes('rate')) {
    hint += "Look at the numbers carefully! Calculate percentages: (part/total) × 100. Compare rates to find best option. Annual rates are higher numbers than monthly rates.";
  }
  else if (questionLower.includes('how often') || questionLower.includes('frequency')) {
    hint += "Frequency matters for financial habits! Regular reviews help stay on track. Common frequencies: daily, weekly, monthly, quarterly, annually. Choose what fits your lifestyle.";
  }
  else if (questionLower.includes('priority') || questionLower.includes('first') || questionLower.includes('most important')) {
    hint += "Prioritize needs over wants! Emergency fund first, then clear high-interest debt, then investments. Basic necessities (food, shelter, health) always come first.";
  }
  else {
    // Generic contextual hint
    hint += `Read the question carefully: "${question.substring(0, 60)}${question.length > 60 ? '...' : ''}" Think about what it's really asking. Eliminate clearly wrong options. `;
    
    if (difficulty === 'easy') {
      hint += "The answer is usually straightforward - trust your basic financial knowledge!";
    } else if (difficulty === 'hard') {
      hint += "Break it down step-by-step. What financial principle is being tested?";
    } else {
      hint += "Consider real-life scenarios in India. What would a financially smart person do?";
    }
  }
  
  hint += " 🇮🇳";
  return hint;
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
      accuracy: tp.totalAttempts > 0 ? ((tp.correctAnswers / tp.totalAttempts) * 100) : 0,
      attempts: tp.totalAttempts,
      correctAnswers: tp.correctAnswers,
      avgTime: tp.averageTimeSpent
    })).filter(p => p.attempts > 0);

    // Identify weak topics (accuracy < 70% or very slow)
    const weakTopics = performanceData
      .filter(p => p.accuracy < 70 || p.avgTime > 60)
      .sort((a, b) => a.accuracy - b.accuracy) // Sort by accuracy (lowest first)
      .map(topic => {
        let suggestion = '';
        let detailedAnalysis = '';
        const accuracy = topic.accuracy;
        const missedQuestions = topic.attempts - topic.correctAnswers;
        
        // Generate specific suggestions based on performance
        if (accuracy < 30) {
          suggestion = `🚨 <strong>CRITICAL WEAKNESS</strong> - This topic needs immediate attention!`;
          detailedAnalysis = `
            <div class="analysis-section">
              <p><strong>Current Status:</strong> You've missed ${missedQuestions} out of ${topic.attempts} questions (${accuracy.toFixed(1)}% accuracy). This indicates a fundamental gap in understanding.</p>
              
              <p><strong>📚 What You Need to Do:</strong></p>
              <ul>
                <li>🎯 <strong>Start with the basics:</strong> Before attempting more questions, review the core concepts of ${topic.topic}. Make sure you understand the fundamentals.</li>
                <li>📖 <strong>Read explanations carefully:</strong> After each question (correct or wrong), spend 2-3 minutes reading the explanation thoroughly.</li>
                <li>💡 <strong>Use AI hints:</strong> Don't hesitate to click "Ask AI for Help" when stuck. Understanding is more important than guessing.</li>
                <li>🐢 <strong>Go slow:</strong> Practice 3-5 EASY questions daily. Quality over quantity!</li>
                <li>📝 <strong>Take notes:</strong> Write down key concepts, formulas, or rules related to ${topic.topic}.</li>
              </ul>
              
              <p><strong>🎯 Goal:</strong> Reach 60% accuracy before moving to medium difficulty. Focus on understanding WHY answers are correct, not just WHICH answer is correct.</p>
            </div>
          `;
        } else if (accuracy < 50) {
          suggestion = `⚠️ <strong>NEEDS SIGNIFICANT IMPROVEMENT</strong> - Let's work on building your foundation`;
          detailedAnalysis = `
            <div class="analysis-section">
              <p><strong>Current Status:</strong> You're getting ${topic.correctAnswers} out of ${topic.attempts} questions right (${accuracy.toFixed(1)}%). You understand some concepts but there are gaps.</p>
              
              <p><strong>📚 Action Plan:</strong></p>
              <ul>
                <li>🔍 <strong>Identify patterns:</strong> Review the questions you got wrong. Are you missing similar types? Focus on those specific areas.</li>
                <li>🎓 <strong>Learn from mistakes:</strong> Each wrong answer is a learning opportunity. Read the explanation and understand the concept behind it.</li>
                <li>🇮🇳 <strong>Connect to real life:</strong> Think about how ${topic.topic} applies to everyday Indian scenarios (shopping, banking, investments).</li>
                <li>⏰ <strong>Practice schedule:</strong> Dedicate 15 minutes daily to ${topic.topic}. Practice 5-7 questions with full focus.</li>
                <li>👥 <strong>Teach someone:</strong> Explain concepts to a friend or family member. Teaching reinforces learning.</li>
              </ul>
              
              <p><strong>🎯 Goal:</strong> Aim for 70% accuracy within 2 weeks. Track your progress after every 5 questions.</p>
            </div>
          `;
        } else if (accuracy < 70) {
          suggestion = `📚 <strong>ROOM FOR IMPROVEMENT</strong> - You're on the right track, let's push further!`;
          detailedAnalysis = `
            <div class="analysis-section">
              <p><strong>Current Status:</strong> You're at ${accuracy.toFixed(1)}% accuracy with ${topic.correctAnswers}/${topic.attempts} questions correct. Good progress, but there's room to master this topic!</p>
              
              <p><strong>📚 Next Steps to Mastery:</strong></p>
              <ul>
                <li>🎯 <strong>Target weak spots:</strong> You already know the basics. Now focus on the tricky aspects you're missing.</li>
                <li>⚡ <strong>Increase difficulty:</strong> Start practicing medium-difficulty questions to challenge yourself.</li>
                <li>⏱️ <strong>Time yourself:</strong> Try to improve both accuracy AND speed. Aim to answer each question in 30-45 seconds.</li>
                <li>🔄 <strong>Revisit mistakes:</strong> Review the questions you got wrong and try similar questions to confirm understanding.</li>
                <li>📊 <strong>Apply concepts:</strong> Look for ${topic.topic} examples in news, apps, or your daily life to reinforce learning.</li>
              </ul>
              
              <p><strong>🎯 Goal:</strong> Reach 85%+ accuracy to show mastery. You're almost there!</p>
            </div>
          `;
        } else if (topic.avgTime > 60) {
          suggestion = `⏱️ <strong>SPEED IMPROVEMENT NEEDED</strong> - Good accuracy but taking too long`;
          detailedAnalysis = `
            <div class="analysis-section">
              <p><strong>Current Status:</strong> You're accurate (${accuracy.toFixed(1)}%) but averaging ${topic.avgTime.toFixed(0)} seconds per question. Let's work on speed!</p>
              
              <p><strong>⚡ Speed Improvement Strategy:</strong></p>
              <ul>
                <li>⏰ <strong>Practice with timer:</strong> Set 40-second limit per question. This creates urgency and improves decision-making.</li>
                <li>🎯 <strong>Pattern recognition:</strong> The more you practice, the faster you'll recognize question patterns.</li>
                <li>✂️ <strong>Eliminate quickly:</strong> Train yourself to eliminate obviously wrong options first (process of elimination).</li>
                <li>🧠 <strong>Trust your instincts:</strong> First answer is often correct. Don't overthink!</li>
                <li>📝 <strong>Memorize key facts:</strong> Quick recall of formulas, rates, or rules saves thinking time.</li>
              </ul>
              
              <p><strong>🎯 Goal:</strong> Maintain ${accuracy.toFixed(0)}% accuracy while reducing time to under 40 seconds per question.</p>
            </div>
          `;
        }
        
        return {
          topic: topic.topic,
          category: topic.category,
          accuracy: Math.round(accuracy),
          questionsAttempted: topic.attempts,
          correctAnswers: topic.correctAnswers,
          suggestion: suggestion,
          detailedAnalysis: detailedAnalysis,
          weaknessScore: Math.round(100 - accuracy)
        };
      });

    // If no weak topics but user has performance data, show their best areas for improvement
    if (weakTopics.length === 0 && performanceData.length > 0) {
      return performanceData
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3)
        .map(topic => ({
          topic: topic.topic,
          category: topic.category,
          accuracy: Math.round(topic.accuracy),
          questionsAttempted: topic.attempts,
          correctAnswers: topic.correctAnswers,
          suggestion: `✨ <strong>EXCELLENT WORK!</strong> - Keep up the great performance`,
          detailedAnalysis: `
            <div class="analysis-section">
              <p><strong>Current Status:</strong> You're performing very well in ${topic.topic} with ${Math.round(topic.accuracy)}% accuracy!</p>
              <p><strong>🌟 Maintenance Tips:</strong></p>
              <ul>
                <li>🔄 Practice 2-3 questions weekly to keep skills sharp</li>
                <li>🎓 Try harder difficulty levels to challenge yourself</li>
                <li>👨‍🏫 Help others learn this topic to reinforce your knowledge</li>
                <li>📈 Set new goal: Aim for 95%+ accuracy or faster completion time</li>
              </ul>
            </div>
          `,
          weaknessScore: Math.round(100 - topic.accuracy)
        }));
    }

    return weakTopics;
  } catch (error) {
    console.error('Error identifying weak topics:', error);
    return [];
  }
}

// NEW: Generate personalized learning path
async function generateLearningPath(userData, weakTopics, topicPerformance) {
  try {
    // Build learning path based on weak topics and user progress
    if (!weakTopics || weakTopics.length === 0) {
      // If no weak topics, suggest next levels or revisit topics
      return topicPerformance
        .filter(tp => tp.totalAttempts > 0)
        .sort((a, b) => {
          const accuracyA = (a.correctAnswers / a.totalAttempts) * 100;
          const accuracyB = (b.correctAnswers / b.totalAttempts) * 100;
          return accuracyA - accuracyB; // Sort by accuracy (lowest first)
        })
        .slice(0, 5)
        .map((topic, index) => {
          const accuracy = Math.round((topic.correctAnswers / topic.totalAttempts) * 100);
          const missedQuestions = topic.totalAttempts - topic.correctAnswers;
          let priorityLevel = 'Medium';
          let recommendation = '';
          
          if (accuracy < 50) {
            priorityLevel = 'High';
            recommendation = `
              <div class="recommendation-detailed">
                <div class="rec-header">
                  <span class="rec-status critical">🚨 NEEDS IMMEDIATE ATTENTION</span>
                  <span class="rec-accuracy">${accuracy}% Accuracy</span>
                </div>
                
                <div class="rec-stats">
                  <div class="stat-box">
                    <div class="stat-value">${topic.totalAttempts}</div>
                    <div class="stat-label">Questions Attempted</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-value">${topic.correctAnswers}</div>
                    <div class="stat-label">Correct Answers</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-value">${missedQuestions}</div>
                    <div class="stat-label">Needs Work</div>
                  </div>
                </div>

                <div class="rec-analysis">
                  <h5>📊 Performance Analysis:</h5>
                  <p>You're missing ${missedQuestions} out of ${topic.totalAttempts} questions. This indicates fundamental gaps that need addressing before moving forward.</p>
                </div>

                <div class="rec-action-plan">
                  <h5>🎯 Your Week 1 Action Plan:</h5>
                  <div class="daily-tasks">
                    <div class="day-task"><strong>Days 1-2:</strong> Review basic concepts of ${topic.topic}. Watch explanatory videos or read guides. Don't attempt questions yet - just learn!</div>
                    <div class="day-task"><strong>Days 3-4:</strong> Practice 3 EASY questions daily. Focus on understanding, not speed. Read explanation after EVERY question.</div>
                    <div class="day-task"><strong>Days 5-7:</strong> Practice 5 questions daily (mix of easy and medium). Use AI hints when stuck. Track improvement.</div>
                  </div>
                  
                  <div class="success-metric">
                    <strong>✅ Success Target:</strong> Reach 60% accuracy by end of Week 1. Then move to Week 2 plan.
                  </div>
                </div>

                <div class="rec-tips">
                  <h5>💡 Pro Tips for ${topic.topic}:</h5>
                  <ul>
                    <li><strong>Make it real:</strong> Connect every concept to Indian real-life examples (UPI, PAN, Bank accounts, etc.)</li>
                    <li><strong>Learn the WHY:</strong> Don't memorize answers. Understand the logic behind them.</li>
                    <li><strong>Use AI wisely:</strong> Ask for hints BEFORE guessing randomly. Learning is the goal, not just points.</li>
                    <li><strong>Take breaks:</strong> 15-minute focused sessions are better than 1 hour of distracted practice.</li>
                  </ul>
                </div>
              </div>
            `;
          } else if (accuracy < 70) {
            priorityLevel = 'Medium';
            recommendation = `
              <div class="recommendation-detailed">
                <div class="rec-header">
                  <span class="rec-status improving">📚 BUILDING MOMENTUM</span>
                  <span class="rec-accuracy">${accuracy}% Accuracy</span>
                </div>
                
                <div class="rec-stats">
                  <div class="stat-box">
                    <div class="stat-value">${topic.correctAnswers}/${topic.totalAttempts}</div>
                    <div class="stat-label">Success Rate</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-value">${100 - accuracy}%</div>
                    <div class="stat-label">Room to Grow</div>
                  </div>
                </div>

                <div class="rec-analysis">
                  <h5>📊 Performance Analysis:</h5>
                  <p>Good progress! You understand the basics of ${topic.topic}, but consistency needs improvement. You're ${70 - accuracy}% away from mastery level.</p>
                </div>

                <div class="rec-action-plan">
                  <h5>🎯 Path to Mastery (Next 2 Weeks):</h5>
                  <div class="weekly-plan">
                    <div class="week-block">
                      <strong>Week 1 Focus: Strengthen Foundation</strong>
                      <ul>
                        <li>Practice 5-7 questions daily on ${topic.topic}</li>
                        <li>Review all wrong answers immediately</li>
                        <li>Try to identify which specific sub-topics you're missing</li>
                        <li>Target: Reach 75% accuracy</li>
                      </ul>
                    </div>
                    <div class="week-block">
                      <strong>Week 2 Focus: Challenge Yourself</strong>
                      <ul>
                        <li>Start attempting MEDIUM difficulty questions</li>
                        <li>Time yourself: aim for 40-45 seconds per question</li>
                        <li>Teach concepts to a friend to reinforce learning</li>
                        <li>Target: Reach 85% accuracy</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="rec-tips">
                  <h5>💡 Level-Up Strategies:</h5>
                  <ul>
                    <li><strong>Pattern spotting:</strong> Notice similar question types and learn shortcuts</li>
                    <li><strong>Active recall:</strong> After reading explanation, close it and explain concept in your own words</li>
                    <li><strong>Real-world practice:</strong> Look for ${topic.topic} examples in daily life and news</li>
                    <li><strong>Track progress:</strong> Check your % after every 5 questions to see improvement</li>
                  </ul>
                </div>
              </div>
            `;
          } else {
            priorityLevel = 'Low';
            recommendation = `
              <div class="recommendation-detailed">
                <div class="rec-header">
                  <span class="rec-status excellent">⭐ EXCELLENT PERFORMANCE</span>
                  <span class="rec-accuracy">${accuracy}% Accuracy</span>
                </div>
                
                <div class="rec-stats">
                  <div class="stat-box">
                    <div class="stat-value">${topic.correctAnswers}/${topic.totalAttempts}</div>
                    <div class="stat-label">Great Success Rate</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-value">${100 - accuracy}%</div>
                    <div class="stat-label">To Perfection</div>
                  </div>
                </div>

                <div class="rec-analysis">
                  <h5>📊 Performance Analysis:</h5>
                  <p>Outstanding work on ${topic.topic}! You've mastered this area. Now it's about maintaining excellence and pushing to expert level.</p>
                </div>

                <div class="rec-action-plan">
                  <h5>🎯 Mastery Maintenance Plan:</h5>
                  <div class="maintenance-tasks">
                    <div class="task-item">📅 <strong>Weekly Review:</strong> Practice 2-3 questions per week to keep skills sharp</div>
                    <div class="task-item">🚀 <strong>Challenge Mode:</strong> Only attempt HARD difficulty questions to push your limits</div>
                    <div class="task-item">⏱️ <strong>Speed Run:</strong> Try to complete questions in under 30 seconds while maintaining accuracy</div>
                    <div class="task-item">👨‍🏫 <strong>Teach Others:</strong> Help friends understand ${topic.topic} - teaching deepens your mastery</div>
                    <div class="task-item">🎯 <strong>New Goal:</strong> Aim for 95%+ accuracy or help others improve their scores</div>
                  </div>
                </div>
              </div>
            `;
          }
          
          return {
            level: topic.topic,
            category: topic.category,
            recommendation: recommendation,
            priority: priorityLevel,
            accuracy: accuracy,
            questionsAttempted: topic.totalAttempts
          };
        });
    }

    // Generate learning path from weak topics
    const learningPath = weakTopics
      .sort((a, b) => b.weaknessScore - a.weaknessScore) // Sort by weakness (weakest first)
      .map((topic, index) => {
        const missedQuestions = topic.questionsAttempted - topic.correctAnswers;
        let priorityLevel = 'Medium';
        let recommendation = '';
        
        if (topic.accuracy < 30) {
          priorityLevel = 'High';
          recommendation = `
            <div class="recommendation-detailed">
              <div class="rec-header">
                <span class="rec-status critical">🚨 CRITICAL - START HERE</span>
                <span class="rec-accuracy">${topic.accuracy}% Accuracy</span>
              </div>
              
              <div class="rec-stats">
                <div class="stat-box">
                  <div class="stat-value">${topic.questionsAttempted}</div>
                  <div class="stat-label">Attempted</div>
                </div>
                <div class="stat-box">
                  <div class="stat-value">${topic.correctAnswers}</div>
                  <div class="stat-label">Correct</div>
                </div>
                <div class="stat-box">
                  <div class="stat-value">${missedQuestions}</div>
                  <div class="stat-label">To Improve</div>
                </div>
              </div>

              <div class="rec-analysis">
                <h5>📊 Why This is Priority #${index + 1}:</h5>
                <p>You're missing ${missedQuestions} out of ${topic.questionsAttempted} questions in ${topic.topic}. This is a foundational topic that affects your progress in other areas. Fixing this will have ripple benefits across your learning!</p>
              </div>

              <div class="rec-action-plan">
                <h5>🎯 Intensive Recovery Plan (Week 1):</h5>
                <div class="daily-schedule">
                  <div class="schedule-item">
                    <div class="day-label">📅 Days 1-2</div>
                    <div class="day-content">
                      <strong>Learning Phase - NO QUESTIONS YET</strong>
                      <ul>
                        <li>Read about ${topic.topic} basics from trusted sources</li>
                        <li>Watch 2-3 short explanatory videos on YouTube</li>
                        <li>Take handwritten notes - writing helps memory!</li>
                        <li>Understand core concepts before practicing</li>
                      </ul>
                    </div>
                  </div>
                  <div class="schedule-item">
                    <div class="day-label">📅 Days 3-5</div>
                    <div class="day-content">
                      <strong>Practice Phase - Start Slow</strong>
                      <ul>
                        <li><strong>Day 3:</strong> Attempt 3 EASY questions, read ALL explanations</li>
                        <li><strong>Day 4:</strong> Attempt 4 EASY questions, use AI hints if stuck</li>
                        <li><strong>Day 5:</strong> Attempt 5 EASY questions, aim for 50%+ accuracy</li>
                        <li>Note: Speed doesn't matter yet. Focus on understanding!</li>
                      </ul>
                    </div>
                  </div>
                  <div class="schedule-item">
                    <div class="day-label">📅 Days 6-7</div>
                    <div class="day-content">
                      <strong>Challenge Phase - Mix It Up</strong>
                      <ul>
                        <li>Attempt 7 questions daily (5 easy + 2 medium)</li>
                        <li>Time yourself but don't rush - aim for 60 seconds per question</li>
                        <li>Review ALL wrong answers - understand WHY you missed them</li>
                        <li>Target: Achieve 60% accuracy consistently</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div class="success-metric">
                  ✅ <strong>Week 1 Goal:</strong> From ${topic.accuracy}% → 60% accuracy (double your current rate!)
                </div>
              </div>

              <div class="rec-tips">
                <h5>💡 Critical Success Tips for ${topic.topic}:</h5>
                <ul>
                  <li>🎯 <strong>One topic at a time:</strong> Don't switch to other topics until you hit 60% here</li>
                  <li>🧠 <strong>Understand, don't memorize:</strong> Ask yourself "why is this answer correct?" after each question</li>
                  <li>🇮🇳 <strong>Make it Indian:</strong> Relate every concept to Indian money, banks, or daily life</li>
                  <li>💬 <strong>Use AI hints:</strong> Not shameful to ask for help! Click "Ask AI for Help" when confused</li>
                  <li>✍️ <strong>Write it down:</strong> Keep a small notebook for key formulas, rules, and concepts</li>
                  <li>🔁 <strong>Repeat wrong questions:</strong> After 2 days, redo the questions you got wrong initially</li>
                </ul>
              </div>

              <div class="motivational-quote">
                💪 <strong>Remember:</strong> Every expert was once a beginner. Your ${topic.accuracy}% today will become 80%+ with focused effort!
              </div>
            </div>
          `;
        } else if (topic.accuracy < 50) {
          priorityLevel = 'High';
          recommendation = `
            <div class="recommendation-detailed">
              <div class="rec-header">
                <span class="rec-status warning">⚠️ HIGH PRIORITY</span>
                <span class="rec-accuracy">${topic.accuracy}% Accuracy</span>
              </div>
              
              <div class="rec-stats">
                <div class="stat-box">
                  <div class="stat-value">${topic.correctAnswers}/${topic.questionsAttempted}</div>
                  <div class="stat-label">Current Performance</div>
                </div>
                <div class="stat-box">
                  <div class="stat-value">${70 - topic.accuracy}%</div>
                  <div class="stat-label">Gap to Master</div>
                </div>
              </div>

              <div class="rec-analysis">
                <h5>📊 Performance Insight:</h5>
                <p>You're struggling with ${topic.topic} but showing potential. You understand some concepts but have gaps. With the right approach, you can reach 70%+ accuracy in 2 weeks!</p>
              </div>

              <div class="rec-action-plan">
                <h5>🎯 2-Week Improvement Blueprint:</h5>
                <div class="week-block">
                  <div class="week-title">📅 Week 1: Fix the Gaps</div>
                  <ul>
                    <li><strong>Identify patterns:</strong> Which types of ${topic.topic} questions do you miss most?</li>
                    <li><strong>Daily practice:</strong> 5-7 questions per day, mix of easy and medium</li>
                    <li><strong>Deep review:</strong> Spend 5 minutes on EACH wrong answer understanding why</li>
                    <li><strong>Real-world connection:</strong> Find 1 daily-life example of ${topic.topic} each day</li>
                    <li><strong>Week 1 Target:</strong> Reach 60% accuracy</li>
                  </ul>
                </div>
                <div class="week-block">
                  <div class="week-title">📅 Week 2: Build Confidence</div>
                  <ul>
                    <li><strong>Increase volume:</strong> 8-10 questions per day</li>
                    <li><strong>Add difficulty:</strong> 70% medium, 30% easy questions</li>
                    <li><strong>Speed up:</strong> Try to complete in 45 seconds per question</li>
                    <li><strong>Teach someone:</strong> Explain ${topic.topic} concepts to a friend</li>
                    <li><strong>Week 2 Target:</strong> Reach 75% accuracy</li>
                  </ul>
                </div>
              </div>

              <div class="rec-tips">
                <h5>💡 Smart Study Tips:</h5>
                <ul>
                  <li>📖 <strong>Active learning:</strong> Don't just read - summarize in your own words</li>
                  <li>🔍 <strong>Error analysis:</strong> Keep list of mistakes - patterns will emerge</li>
                  <li>⏰ <strong>Consistent timing:</strong> Practice same time daily (builds habit)</li>
                  <li>🎯 <strong>Focus blocks:</strong> 15-min sessions better than 1-hour marathon</li>
                </ul>
              </div>
            </div>
          `;
        } else if (topic.accuracy < 70) {
          priorityLevel = 'Medium';
          recommendation = `
            <div class="recommendation-detailed">
              <div class="rec-header">
                <span class="rec-status improving">📚 GOOD PROGRESS - PUSH FURTHER</span>
                <span class="rec-accuracy">${topic.accuracy}% Accuracy</span>
              </div>
              
              <div class="rec-stats">
                <div class="stat-box">
                  <div class="stat-value">${topic.correctAnswers}/${topic.questionsAttempted}</div>
                  <div class="stat-label">Success Rate</div>
                </div>
                <div class="stat-box">
                  <div class="stat-value">${85 - topic.accuracy}%</div>
                  <div class="stat-label">To Excellence</div>
                </div>
              </div>

              <div class="rec-analysis">
                <h5>📊 Current Standing:</h5>
                <p>You're doing well in ${topic.topic}! You understand the fundamentals. Now it's about refinement and reaching mastery level (85%+).</p>
              </div>

              <div class="rec-action-plan">
                <h5>🎯 Path to Mastery:</h5>
                <ul>
                  <li><strong>Challenge yourself:</strong> Focus on MEDIUM and HARD difficulty questions</li>
                  <li><strong>Speed + Accuracy:</strong> Aim for under 40 seconds per question</li>
                  <li><strong>Teach others:</strong> Explain ${topic.topic} to friends - teaching = mastery</li>
                  <li><strong>Weekly practice:</strong> 3-4 sessions per week to maintain and improve</li>
                  <li><strong>Target:</strong> Reach 85% accuracy in 10 days</li>
                </ul>
              </div>

              <div class="rec-tips">
                <h5>💡 Advanced Strategies:</h5>
                <ul>
                  <li>⚡ Work on eliminating wrong options quickly</li>
                  <li>🧩 Look for question patterns and shortcuts</li>
                  <li>📰 Follow ${topic.topic} updates in finance news</li>
                  <li>🏆 Set personal records - fastest correct answer streak!</li>
                </ul>
              </div>
            </div>
          `;
        } else {
          priorityLevel = 'Low';
          recommendation = `
            <div class="recommendation-detailed">
              <div class="rec-header">
                <span class="rec-status excellent">⭐ STRONG PERFORMANCE</span>
                <span class="rec-accuracy">${topic.accuracy}% Accuracy</span>
              </div>
              
              <div class="rec-analysis">
                <p>Excellent work on ${topic.topic}! Just maintain this level with periodic practice.</p>
              </div>

              <div class="rec-action-plan">
                <h5>🎯 Maintenance Plan:</h5>
                <ul>
                  <li>Practice 2-3 questions weekly</li>
                  <li>Try HARD questions only to stay challenged</li>
                  <li>Help others learn this topic</li>
                  <li>Target: Maintain 70%+ always</li>
                </ul>
              </div>
            </div>
          `;
        }
        
        return {
          level: topic.topic,
          category: topic.category,
          recommendation: recommendation,
          priority: priorityLevel,
          accuracy: topic.accuracy,
          questionsAttempted: topic.questionsAttempted
        };
      });

    return learningPath;
  } catch (error) {
    console.error('Error generating learning path:', error);
    return [];
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
          
Provide a motivational message in maximum 40 words for an Indian student learning finance. 
Be short, crisp, and encouraging. Use simple language and be culturally appropriate.`
        },
        {
          role: "user",
          content: `User: Level ${userData.currentLevel}, ${userData.totalPoints} points, ${userData.streak} day streak.
Recent performance: ${recentPerformance}. Give short motivation (max 40 words).`
        }
      ],
      max_tokens: 80,
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
