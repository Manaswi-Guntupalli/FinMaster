// API Configuration
const API_URL = 'http://localhost:3000/api';

// State Management
let currentUser = null;
let authToken = null;
let currentLevel = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let totalQuestionsInLevel = 0;
let answeredQuestionsCount = 0;
let correctAnswersCount = 0;
let totalPointsEarned = 0;
let totalCoinsEarned = 0;
let isAIChatOpen = false;
let currentQuestionData = null;
let selectedOptionIndex = null; // Track selected option
let currentAdaptiveRecommendation = null;
let lastAdaptiveInsightKey = null;

// Audio Context for Sound Effects
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// Sound Effects
function playCheerSound() {
    // Create a happy cheer sound using Web Audio API
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function playErrorSound() {
    // Create an error sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playCoinSound() {
    // Create a coin collection sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Gold Coin Splash Animation
function createCoinSplash() {
    const coinContainer = document.getElementById('coin-container');
    const numberOfCoins = 30;
    
    for (let i = 0; i < numberOfCoins; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'coin';
            coin.textContent = '🪙';
            
            // Random horizontal position
            coin.style.left = Math.random() * 100 + '%';
            
            // Random animation duration for variety
            const duration = 2 + Math.random() * 1.5;
            coin.style.animationDuration = duration + 's';
            
            // Random delay for staggered effect
            const delay = Math.random() * 0.3;
            coin.style.animationDelay = delay + 's';
            
            // Random size for depth effect
            const size = 1.5 + Math.random() * 1.5;
            coin.style.fontSize = size + 'rem';
            
            coinContainer.appendChild(coin);
            
            // Remove coin after animation completes
            setTimeout(() => {
                coin.remove();
            }, (duration + delay) * 1000);
            
            // Play coin sound
            if (i % 3 === 0) playCoinSound();
        }, i * 40);
    }
}

// Toast Notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Local Storage
function saveAuthToken(token) {
    localStorage.setItem('finmaster_token', token);
    authToken = token;
}

function loadAuthToken() {
    const token = localStorage.getItem('finmaster_token');
    if (token) {
        authToken = token;
        return true;
    }
    return false;
}

function clearAuthToken() {
    localStorage.removeItem('finmaster_token');
    authToken = null;
}

// API Calls
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    };
    
    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth Functions
async function register(username, email, password) {
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        
        saveAuthToken(data.token);
        currentUser = data.user;
        showToast('Welcome to FinMaster! 🎉', 'success');
        loadDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function login(email, password) {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        saveAuthToken(data.token);
        currentUser = data.user;
        showToast('Welcome back! 🚀', 'success');
        loadDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function logout() {
    clearAuthToken();
    currentUser = null;
    showScreen('auth-screen');
    showToast('Logged out successfully', 'info');
}

// Dashboard Functions
async function loadDashboard() {
    document.getElementById('loading-screen').classList.remove('hidden');
    
    try {
        const [userData, levels] = await Promise.all([
            apiCall('/user/profile'),
            apiCall('/game/levels')
        ]);
        
        currentUser = userData;
        updateDashboardUI(userData, levels);
        
        // Update profile picture in header
        updateProfilePicture(userData.profilePicture);
        
        showScreen('dashboard-screen');
        
        // Load scenarios (if unlocked)
        loadScenarios();
        
        // Load AI insights
        setTimeout(() => {
            if (userData.totalPoints > 0) {
                loadInitialMotivation();
            }
        }, 1000);
    } catch (error) {
        console.error('Dashboard load error:', error);
        showToast('Failed to load dashboard', 'error');
        // Only logout if it's an authentication error
        if (error.message && (error.message.includes('authentication') || error.message.includes('Token'))) {
            logout();
        }
    } finally {
        document.getElementById('loading-screen').classList.add('hidden');
    }
}

// Load initial motivation on dashboard load
async function loadInitialMotivation() {
    try {
        const response = await apiCall('/ai/motivation');
        document.getElementById('motivation-text').textContent = response.motivation || 'Keep going! You\'re doing great! 🚀';
    } catch (error) {
        // Use default message
    }
}

// Badge Functions
function updateBadges(totalPoints) {
    const badges = [
        { name: 'Bronze', points: 300, class: 'bronze' },
        { name: 'Silver', points: 600, class: 'silver' },
        { name: 'Gold', points: 900, class: 'gold' },
        { name: 'Diamond', points: 1200, class: 'diamond' },
        { name: 'Champion', points: 1500, class: 'champion' }
    ];

    const badgeCards = document.querySelectorAll('.badge-card');
    
    badgeCards.forEach((card, index) => {
        const badge = badges[index];
        if (totalPoints >= badge.points) {
            card.classList.add('earned', badge.class);
        } else {
            card.classList.remove('earned', badge.class);
        }
    });
}

function shareLevelCompletion() {
    const levelTitle = currentLevel?.title || 'a level';
    const pointsEarned = document.getElementById('points-earned').textContent;
    const coinsEarned = document.getElementById('coins-earned').textContent;
    const correctAnswers = document.getElementById('correct-answers').textContent;
    
    const shareText = `🎉 Achievement Unlocked on FinMaster! 🎉

📚 Level Completed: "${levelTitle}"
✅ Correct Answers: ${correctAnswers}
⭐ Points Earned: ${pointsEarned}
💰 Coins Earned: ${coinsEarned}

Building my financial literacy one level at a time! 💪📈

#FinMaster #FinancialLiteracy #MoneyManagement #PersonalFinance #FinancialFreedom`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share({
            title: 'FinMaster - Level Completed! 🎉',
            text: shareText
        }).then(() => {
            showToast('Shared successfully! 🎉', 'success');
        }).catch((error) => {
            // User cancelled or error occurred, fallback to copy
            if (error.name !== 'AbortError') {
                copyToClipboard(shareText);
            }
        });
    } else {
        // Fallback: Copy to clipboard
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('Achievement copied to clipboard! 📋', 'success');
    } catch (err) {
        showToast('Failed to copy. Please share manually.', 'error');
    }
    
    document.body.removeChild(textarea);
}

function updateDashboardUI(userData, levels) {
    // Update user info
    document.getElementById('username').textContent = userData.username;
    document.getElementById('balance').textContent = userData.virtualBalance;
    document.getElementById('points').textContent = userData.totalPoints;
    document.getElementById('completed-levels').textContent = userData.completedLevels.length;
    document.getElementById('streak').textContent = userData.streak;
    
    // Update badges
    updateBadges(userData.totalPoints);
    
    // Update levels grid
    const levelsGrid = document.getElementById('levels-grid');
    levelsGrid.innerHTML = levels.map(level => {
        const statusIcon = level.isCompleted ? '✅' : 
                          level.isUnlocked ? '🔓' : '🔒';
        const cardClass = level.isCompleted ? 'completed' : 
                         level.isUnlocked ? '' : 'locked';
        
        return `
            <div class="level-card ${cardClass}" data-level="${level.levelNumber}" 
                 ${level.isUnlocked ? 'onclick="openLevel(' + level.levelNumber + ')"' : ''}>
                <div class="level-header">
                    <span class="level-number">Level ${level.levelNumber}</span>
                    <span class="level-status">${statusIcon}</span>
                </div>
                <div class="level-icon">${level.icon}</div>
                <h3 class="level-title">${level.title}</h3>
                <p class="level-description">${level.description}</p>
                <div class="level-footer">
                    <span class="level-difficulty difficulty-${level.difficulty.toLowerCase()}">${level.difficulty}</span>
                    <span class="level-reward">🪙 ${level.rewardCoins}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Level Functions
async function openLevel(levelNumber) {
    document.getElementById('loading-screen').classList.remove('hidden');
    
    // FORCE clear all cached state
    currentQuestions = [];
    currentLevel = null;
    currentQuestionIndex = 0;
    totalQuestionsInLevel = 0;
    answeredQuestionsCount = 0;
    correctAnswersCount = 0;
    selectedOptionIndex = null;
    currentAdaptiveRecommendation = null;
    lastAdaptiveInsightKey = null;
    
    try {
        // Add timestamp to prevent any caching
        const levelData = await apiCall(`/game/levels/${levelNumber}?t=${Date.now()}`);
        console.log('📥 Received level data:', {
            hasProgress: !!levelData.progress,
            progress: levelData.progress,
            totalQuestions: levelData.questions.length,
            questionIDs: levelData.questions.map(q => q._id),
            firstQuestionText: levelData.questions[0]?.question.substring(0, 50)
        });
        
        currentLevel = levelData.level;
        totalQuestionsInLevel = levelData.questions.length;
        currentQuestions = levelData.questions.filter(question => !question.isAnswered);
        currentAdaptiveRecommendation = levelData.adaptiveRecommendation || null;
        
        // Check if there's existing progress
        if (levelData.progress && levelData.progress.questionsAnswered > 0) {
            answeredQuestionsCount = levelData.progress.questionsAnswered;
            currentQuestionIndex = answeredQuestionsCount;
            correctAnswersCount = levelData.progress.correctAnswers;
            totalPointsEarned = levelData.progress.pointsEarned;
            totalCoinsEarned = levelData.progress.coinsEarned;
            
            console.log('📊 Resuming Level Progress:', {
                questionsAnswered: answeredQuestionsCount,
                totalQuestions: totalQuestionsInLevel,
                remainingQuestions: currentQuestions.length,
                correctAnswers: correctAnswersCount,
                pointsEarned: totalPointsEarned
            });
        } else {
            // Starting fresh
            currentQuestionIndex = 0;
            answeredQuestionsCount = 0;
            correctAnswersCount = 0;
            totalPointsEarned = 0;
            totalCoinsEarned = 0;
            
            console.log('🆕 Starting fresh level');
        }
        
        displayLevelIntro();
        showScreen('level-detail-screen');
    } catch (error) {
        console.error('Error loading level:', error);
        showToast('Failed to load level', 'error');
    } finally {
        document.getElementById('loading-screen').classList.add('hidden');
    }
}

function displayLevelIntro() {
    document.getElementById('level-icon-large').textContent = currentLevel.icon;
    document.getElementById('level-title').textContent = currentLevel.title;
    document.getElementById('level-introduction').textContent = currentLevel.introduction;
    
    // Update button text if resuming
    const startBtn = document.getElementById('start-quiz-btn');
    if (answeredQuestionsCount > 0 && currentQuestions.length > 0) {
        startBtn.textContent = `Resume Quiz (Question ${answeredQuestionsCount + 1}/${totalQuestionsInLevel}) 🚀`;
    } else {
        startBtn.textContent = 'Start Quiz 🚀';
    }
    
    // Show intro, hide quiz and complete
    document.querySelector('.level-intro').classList.remove('hidden');
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('level-complete-container').classList.add('hidden');
}

function startQuiz() {
    document.querySelector('.level-intro').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('total-questions').textContent = totalQuestionsInLevel;
    
    // Safety check - if no questions, show error
    if (!currentQuestions || currentQuestions.length === 0) {
        if (answeredQuestionsCount >= totalQuestionsInLevel && totalQuestionsInLevel > 0) {
            completeLevel();
            return;
        }
        alert('Error: No questions available. Please try refreshing the page.');
        loadDashboard();
        return;
    }
    
    displayQuestion();
}

function selectAdaptiveQuestionFromPool() {
    if (!currentQuestions.length) {
        return null;
    }

    const preferredOrder = currentAdaptiveRecommendation?.difficultyOrder?.length
        ? currentAdaptiveRecommendation.difficultyOrder
        : ['medium', 'easy', 'hard'];
    const preferredTopic = !currentAdaptiveRecommendation || currentAdaptiveRecommendation.suggestedDifficulty === 'easy'
        ? currentQuestionData?.topic
        : null;

    for (const difficulty of preferredOrder) {
        const candidates = currentQuestions.filter(question => question.difficulty === difficulty);
        if (candidates.length) {
            const topicCandidates = preferredTopic
                ? candidates.filter(question => question.topic === preferredTopic)
                : [];
            const pool = topicCandidates.length ? topicCandidates : candidates;
            return pool[Math.floor(Math.random() * pool.length)];
        }
    }

    return currentQuestions[0];
}

function buildStepFallbackRecommendation(question, wasCorrect, remainingQuestions) {
    const currentDifficulty = question?.difficulty || 'medium';
    const upgradeMap = { easy: 'medium', medium: 'hard', hard: 'hard' };
    const downgradeMap = { hard: 'medium', medium: 'easy', easy: 'easy' };
    const suggestedDifficulty = wasCorrect
        ? (upgradeMap[currentDifficulty] || 'medium')
        : (downgradeMap[currentDifficulty] || 'easy');

    const remainingCounts = remainingQuestions.reduce((counts, remainingQuestion) => {
        const difficulty = remainingQuestion.difficulty || 'medium';
        counts[difficulty] = (counts[difficulty] || 0) + 1;
        return counts;
    }, { easy: 0, medium: 0, hard: 0 });

    const fallbackOrder = {
        easy: ['easy', 'medium', 'hard'],
        medium: ['medium', 'easy', 'hard'],
        hard: ['hard', 'medium', 'easy']
    };

    const difficultyOrder = fallbackOrder[suggestedDifficulty].filter(difficulty => remainingCounts[difficulty] > 0);
    const finalDifficulty = difficultyOrder[0] || Object.keys(remainingCounts).find(difficulty => remainingCounts[difficulty] > 0) || 'medium';

    return {
        suggestedDifficulty: finalDifficulty,
        difficultyOrder: difficultyOrder.length ? difficultyOrder : fallbackOrder.medium,
        reason: wasCorrect
            ? 'Adaptive progression moved you one step up after a correct answer.'
            : 'Adaptive progression moved you one step down after an incorrect answer.',
        remainingCounts
    };
}

function displayQuestion() {
    const question = selectAdaptiveQuestionFromPool();
    
    // Safety check
    if (!question) {
        completeLevel();
        return;
    }
    
    currentQuestionData = question; // Store for AI hints
    selectedOptionIndex = null; // Reset selected option
    
    // Track question start time
    questionStartTime = Date.now();
    
    // Update progress
    const currentQuestionNumber = answeredQuestionsCount + 1;
    document.getElementById('current-question').textContent = currentQuestionNumber;
    document.getElementById('current-question-header').textContent = currentQuestionNumber;
    const progress = (currentQuestionNumber / totalQuestionsInLevel) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    
    // Display difficulty badge with color coding
    const difficultyBadge = document.getElementById('difficulty-badge');
    const difficulty = question.difficulty.toUpperCase();
    difficultyBadge.textContent = difficulty;
    difficultyBadge.className = 'difficulty-badge difficulty-' + question.difficulty;
    
    // Display question
    document.getElementById('question-text').textContent = question.question;

    if (currentAdaptiveRecommendation?.reason) {
        const adaptiveKey = `${currentAdaptiveRecommendation.suggestedDifficulty}:${currentAdaptiveRecommendation.reason}`;
        if (lastAdaptiveInsightKey !== adaptiveKey) {
            lastAdaptiveInsightKey = adaptiveKey;
            showToast(`Adaptive AI: ${currentAdaptiveRecommendation.reason}`, 'info');
        }
    }
    
    // Reset and disable submit button
    const submitBtn = document.getElementById('submit-answer-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submit Answer';
    submitBtn.style.display = 'block';
    
    // Reset AI hint
    const hintBtn = document.getElementById('ai-hint-btn');
    const hintContainer = document.getElementById('ai-hint-container');
    hintBtn.disabled = false;
    hintBtn.textContent = '💡 Ask AI for Help';
    hintContainer.classList.add('hidden');
    
    // Display options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = question.options.map((option, index) => `
        <div class="option" data-index="${index}" onclick="selectOption(${index})">
            ${option}
        </div>
    `).join('');
    
    // Hide feedback
    document.getElementById('feedback-container').classList.add('hidden');
}

function selectOption(selectedIndex) {
    // Remove previous selection
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Mark new selection
    options[selectedIndex].classList.add('selected');
    selectedOptionIndex = selectedIndex;
    
    // Enable submit button
    const submitBtn = document.getElementById('submit-answer-btn');
    submitBtn.disabled = false;
}

async function submitAnswer() {
    if (selectedOptionIndex === null) return;
    
    const question = currentQuestionData;
    const submitBtn = document.getElementById('submit-answer-btn');
    
    // Hide submit button
    submitBtn.style.display = 'none';
    
    // Calculate time spent on question
    const timeSpent = questionStartTime ? Math.round((Date.now() - questionStartTime) / 1000) : 30;
    
    // Disable all options
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        opt.classList.add('disabled');
        opt.onclick = null;
    });
    
    try {
        const result = await apiCall('/game/submit-answer', {
            method: 'POST',
            body: JSON.stringify({
                questionId: question._id,
                selectedAnswer: selectedOptionIndex,
                timeSpent: timeSpent
            })
        });
        
        console.log('✅ Answer submitted:', {
            questionIndex: answeredQuestionsCount,
            correct: result.correct,
            newProgress: answeredQuestionsCount + 1
        });
        
        // Update user balance and points
        currentUser.virtualBalance = result.newBalance;
        currentUser.totalPoints = result.newPoints;
        currentUser.streak = result.streak;
        
        // Show badge notifications if any new badges earned
        if (result.newBadges && result.newBadges.length > 0) {
            result.newBadges.forEach((badge, index) => {
                setTimeout(() => {
                    showToast(`🏅 Badge Unlocked: ${badge}!`, 'success');
                }, (index + 1) * 1000);
            });
        }
        
        // Visual feedback
        const selectedOption = options[selectedOptionIndex];
        const correctOption = options[result.correctAnswer];
        
        if (result.correct) {
            selectedOption.classList.add('correct');
            playCheerSound();
            createCoinSplash();
            correctAnswersCount++;
            totalPointsEarned += result.points;
            totalCoinsEarned += result.coinsEarned;
        } else {
            selectedOption.classList.add('incorrect');
            correctOption.classList.add('correct');
            playErrorSound();
        }

        answeredQuestionsCount++;
        currentQuestionIndex = answeredQuestionsCount;
        currentQuestions = currentQuestions.filter(remainingQuestion => remainingQuestion._id !== question._id);

        const fallbackRecommendation = buildStepFallbackRecommendation(question, result.correct, currentQuestions);
        const hasEasyRemaining = currentQuestions.some(remainingQuestion => remainingQuestion.difficulty === 'easy');
        const hasMediumRemaining = currentQuestions.some(remainingQuestion => remainingQuestion.difficulty === 'medium');

        if (result.adaptiveRecommendation) {
            const serverRecommendation = result.adaptiveRecommendation;
            const inconsistentMediumMiss = !result.correct
                && question.difficulty === 'medium'
                && hasEasyRemaining
                && serverRecommendation.suggestedDifficulty === 'hard';
            const inconsistentEasyHit = result.correct
                && question.difficulty === 'easy'
                && hasMediumRemaining
                && serverRecommendation.suggestedDifficulty === 'hard';

            currentAdaptiveRecommendation = (inconsistentMediumMiss || inconsistentEasyHit)
                ? fallbackRecommendation
                : serverRecommendation;
        } else {
            currentAdaptiveRecommendation = fallbackRecommendation;
        }
        
        // Show feedback
        setTimeout(() => {
            displayFeedback(result);
        }, 800);
        
    } catch (error) {
        showToast('Failed to submit answer', 'error');
        // Re-enable submit button and options on error
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Answer';
        submitBtn.style.display = 'block';
        options.forEach(opt => {
            opt.classList.remove('disabled');
            const index = parseInt(opt.dataset.index);
            opt.onclick = () => selectOption(index);
        });
    }
}

async function displayFeedback(result) {
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackContent = document.getElementById('feedback-content');
    
    const feedbackClass = result.correct ? 'feedback-correct' : 'feedback-incorrect';
    const feedbackTitle = result.correct ? '✅ Correct!' : '❌ Incorrect';
    
    let explanation = result.explanation;
    
    // Get AI-enhanced explanation for wrong answers
    if (!result.correct && currentQuestionData) {
        try {
            const aiResponse = await apiCall('/ai/enhance-explanation', {
                method: 'POST',
                body: JSON.stringify({
                    question: currentQuestionData.question,
                    correctAnswer: currentQuestionData.options[result.correctAnswer],
                    userAnswer: currentQuestionData.options[result.correctAnswer], // This would be the user's choice
                    originalExplanation: result.explanation
                })
            });
            explanation = aiResponse.enhancedExplanation;
        } catch (error) {
            // Use original explanation if AI fails
            console.log('Using original explanation');
        }
    }
    
    feedbackContent.innerHTML = `
        <div class="${feedbackClass}">
            <h4>${feedbackTitle}</h4>
            <p class="feedback-explanation">${explanation}</p>
            <div class="feedback-stats">
                ${result.correct ? `
                    <span class="feedback-stat">+${result.points} points</span>
                    <span class="feedback-stat">+${result.coinsEarned} coins</span>
                ` : ''}
                <span class="feedback-stat">Streak: ${result.streak} 🔥</span>
            </div>
            ${result.adaptiveRecommendation ? `
                <div class="feedback-stats">
                    <span class="feedback-stat">AI Next: ${result.adaptiveRecommendation.suggestedDifficulty.toUpperCase()}</span>
                    <span class="feedback-stat">Skill: ${result.skillSnapshot?.skillBand || 'balanced'}</span>
                </div>
                <p class="feedback-explanation">${result.adaptiveRecommendation.reason}</p>
            ` : ''}
        </div>
    `;
    
    feedbackContainer.classList.remove('hidden');
}

function nextQuestion() {
    if (currentQuestions.length > 0) {
        displayQuestion();
    } else {
        completeLevel();
    }
}

async function completeLevel() {
    try {
        const result = await apiCall('/game/complete-level', {
            method: 'POST',
            body: JSON.stringify({
                levelNumber: currentLevel.levelNumber
            })
        });
        
        // Update user data
        currentUser.virtualBalance = result.newBalance;
        currentUser.totalPoints = result.totalPoints;
        
        displayLevelComplete(result);
    } catch (error) {
        showToast('Failed to complete level', 'error');
    }
}

function displayLevelComplete(result) {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('level-complete-container').classList.remove('hidden');
    
    document.getElementById('level-complete-message').textContent = 
        `Great job! You've mastered ${currentLevel.title}!`;
    
    document.getElementById('correct-answers').textContent = 
        `${correctAnswersCount}/${totalQuestionsInLevel}`;
    document.getElementById('points-earned').textContent = totalPointsEarned;
    document.getElementById('coins-earned').textContent = 
        totalCoinsEarned + result.rewardCoins;
    
    // Celebration animation
    createCoinSplash();
    setTimeout(createCoinSplash, 500);
    playCheerSound();
    
    // Show achievement notifications
    if (result.achievements && result.achievements.length > 0) {
        result.achievements.forEach((achievement, index) => {
            setTimeout(() => {
                showToast(`🏆 Achievement Unlocked: ${achievement.name}`, 'success');
            }, (index + 1) * 1000);
        });
    }
}

// AI Functions
async function sendAIMessage(message, isQuickAction = false) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    
    // Add user message
    if (!isQuickAction) {
        const userMessage = document.createElement('div');
        userMessage.className = 'ai-message ai-user';
        userMessage.innerHTML = `
            <div class="ai-avatar">👤</div>
            <div class="ai-bubble">${message}</div>
        `;
        messagesContainer.appendChild(userMessage);
    }
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'ai-message ai-bot';
    typingIndicator.innerHTML = `
        <div class="ai-avatar">🤖</div>
        <div class="ai-bubble ai-typing">
            <div class="ai-typing-dot"></div>
            <div class="ai-typing-dot"></div>
            <div class="ai-typing-dot"></div>
        </div>
    `;
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        const response = await apiCall('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ 
                message,
                context: `User is at level ${currentUser.currentLevel}, has ${currentUser.totalPoints} points, and ${currentUser.virtualBalance} coins.`
            })
        });
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add AI response
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message ai-bot';
        aiMessage.innerHTML = `
            <div class="ai-avatar">🤖</div>
            <div class="ai-bubble">${response.response}</div>
        `;
        messagesContainer.appendChild(aiMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
    } catch (error) {
        typingIndicator.remove();
        showToast('AI Coach is temporarily unavailable', 'error');
    }
}

async function getAIHint() {
    if (!currentQuestionData) return;
    
    const hintBtn = document.getElementById('ai-hint-btn');
    const hintContainer = document.getElementById('ai-hint-container');
    
    hintBtn.disabled = true;
    hintBtn.textContent = '🤔 Thinking...';
    
    try {
        const response = await apiCall('/ai/hint', {
            method: 'POST',
            body: JSON.stringify({
                question: currentQuestionData.question,
                options: currentQuestionData.options,
                difficulty: currentQuestionData.difficulty,
                topic: currentQuestionData.topic
            })
        });
        
        hintContainer.innerHTML = `
            <h4>💡 AI Hint:</h4>
            <p>${response.hint}</p>
        `;
        hintContainer.classList.remove('hidden');
        hintBtn.textContent = '✓ Hint Received';
        
    } catch (error) {
        showToast('Failed to get hint', 'error');
        hintBtn.disabled = false;
        hintBtn.textContent = '💡 Ask AI for Help';
    }
}

async function getProgressAnalysis() {
    try {
        const response = await apiCall('/ai/analyze-progress');
        
        const messagesContainer = document.getElementById('ai-chat-messages');
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message ai-bot';
        aiMessage.innerHTML = `
            <div class="ai-avatar">🤖</div>
            <div class="ai-bubble">
                <strong>📊 Your Progress Analysis:</strong><br><br>
                ${response.analysis}
            </div>
        `;
        messagesContainer.appendChild(aiMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
    } catch (error) {
        showToast('Failed to analyze progress', 'error');
    }
}

function toggleAIChat() {
    const chatPanel = document.getElementById('ai-chat-panel');
    const chatToggle = document.getElementById('ai-chat-toggle');
    
    isAIChatOpen = !isAIChatOpen;
    
    if (isAIChatOpen) {
        chatPanel.classList.remove('hidden');
        chatToggle.style.display = 'none';
    } else {
        chatPanel.classList.add('hidden');
        chatToggle.style.display = 'flex';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved auth token
    if (loadAuthToken()) {
        loadDashboard();
    } else {
        document.getElementById('loading-screen').classList.add('hidden');
        showScreen('auth-screen');
    }
    
    // Auth form switches
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('register-form').classList.add('active');
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').classList.remove('active');
        document.getElementById('login-form').classList.add('active');
    });
    
    // Login form
    document.getElementById('login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await login(email, password);
    });
    
    // Register form
    document.getElementById('register').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        await register(username, email, password);
    });
    
    // Logout button
    document.getElementById('header-logout').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    document.getElementById('header-logout-level').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Profile dropdown toggles
    document.getElementById('profile-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown('profile-menu');
    });
    
    document.getElementById('profile-btn-level').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown('profile-menu-level');
    });
    
    // AI Insights dropdown toggles
    document.getElementById('ai-insights-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown('ai-insights-menu');
    });
    
    document.getElementById('ai-insights-btn-level').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown('ai-insights-menu-level');
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        closeAllDropdowns();
    });
    
    // View Profile links
    document.getElementById('view-profile').addEventListener('click', (e) => {
        e.preventDefault();
        loadProfileScreen();
    });
    
    document.getElementById('view-profile-level').addEventListener('click', (e) => {
        e.preventDefault();
        loadProfileScreen();
    });
    
    // Back to dashboard from profile
    document.getElementById('back-to-dashboard-from-profile').addEventListener('click', () => {
        loadDashboard();
    });
    
    // Profile Picture Upload
    document.getElementById('change-profile-picture').addEventListener('click', () => {
        document.getElementById('profile-picture-input').click();
    });
    
    document.getElementById('profile-picture-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await uploadProfilePicture(file);
        }
    });
    
    // AI Insights modal actions (from dashboard)
    document.getElementById('header-analyze-weak-topics').addEventListener('click', (e) => {
        e.preventDefault();
        openAIInsightsModal('weak-topics');
    });
    
    document.getElementById('header-generate-learning-path').addEventListener('click', (e) => {
        e.preventDefault();
        openAIInsightsModal('learning-path');
    });
    
    // AI Insights modal actions (from level screen)
    document.getElementById('level-analyze-weak-topics').addEventListener('click', (e) => {
        e.preventDefault();
        openAIInsightsModal('weak-topics');
    });
    
    document.getElementById('level-generate-learning-path').addEventListener('click', (e) => {
        e.preventDefault();
        openAIInsightsModal('learning-path');
    });
    
    // Close AI modal
    document.getElementById('close-ai-modal').addEventListener('click', () => {
        document.getElementById('ai-insights-modal').classList.add('hidden');
    });
    
    // Back to dashboard buttons
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
        loadDashboard();
    });
    
    document.getElementById('back-to-dashboard-complete').addEventListener('click', () => {
        loadDashboard();
    });
    
    // Share achievement button
    document.getElementById('share-achievement').addEventListener('click', shareLevelCompletion);
    
    // Start quiz button
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    
    // Submit answer button
    document.getElementById('submit-answer-btn').addEventListener('click', submitAnswer);
    
    // Next question button
    document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
    
    // AI Chat event listeners
    document.getElementById('ai-chat-toggle').addEventListener('click', toggleAIChat);
    
    document.getElementById('ai-chat-close').addEventListener('click', toggleAIChat);
    
    document.getElementById('ai-chat-send').addEventListener('click', () => {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        if (message) {
            sendAIMessage(message);
            input.value = '';
        }
    });
    
    document.getElementById('ai-chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = e.target.value.trim();
            if (message) {
                sendAIMessage(message);
                e.target.value = '';
            }
        }
    });
    
    // AI quick action buttons
    document.querySelectorAll('.ai-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'progress') {
                getProgressAnalysis();
            } else if (action === 'tips') {
                sendAIMessage('Give me some study tips for improving my financial literacy', true);
            }
        });
    });
    
    // AI hint button
    document.getElementById('ai-hint-btn').addEventListener('click', getAIHint);
    
    // Scenario event listeners
    document.getElementById('start-scenario-btn').addEventListener('click', startScenario);
    document.getElementById('submit-scenario-answer').addEventListener('click', submitScenarioAnswer);
    document.getElementById('back-from-scenario').addEventListener('click', () => {
        loadDashboard();
    });
    document.getElementById('back-to-dashboard-from-complete').addEventListener('click', () => {
        loadDashboard();
    });
    document.getElementById('replay-scenario-btn').addEventListener('click', replayScenario);
    document.getElementById('continue-scenario-btn').addEventListener('click', continueAfterExplanation);
    document.getElementById('close-scenario-explanation').addEventListener('click', continueAfterExplanation);
});

// Make functions available globally
window.openLevel = openLevel;
window.selectOption = selectOption;
window.openScenario = openScenario;
window.selectScenarioOption = selectScenarioOption;

// ===== DROPDOWN MANAGEMENT =====

function toggleDropdown(menuId) {
    const menu = document.getElementById(menuId);
    const isShown = menu.classList.contains('show');
    
    // Close all dropdowns first
    closeAllDropdowns();
    
    // Toggle the clicked one
    if (!isShown) {
        menu.classList.add('show');
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
}

// ===== PROFILE SCREEN =====

async function loadProfileScreen() {
    try {
        showScreen('profile-screen');
        const userData = await apiCall('/user/profile');
        const levelsData = await apiCall('/game/levels');
        
        // Update basic profile info
        document.getElementById('profile-username').textContent = userData.username;
        document.getElementById('profile-email').textContent = userData.email;
        document.getElementById('profile-balance').textContent = userData.virtualBalance;
        document.getElementById('profile-points').textContent = userData.totalPoints;
        document.getElementById('profile-completed').textContent = userData.completedLevels.length;
        document.getElementById('profile-streak').textContent = userData.streak;
        
        // Update profile picture
        updateProfilePicture(userData.profilePicture);
        
        // Render charts
        renderProfileCharts(userData, levelsData);
        
        // Render level statistics table
        renderLevelStatsTable(userData, levelsData);
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile', 'error');
    }
}

function renderProfileCharts(userData, levelsData) {
    try {
        const completedLevelStats = userData.completedLevelStats || [];
        
        console.log('📊 Rendering charts with completedLevelStats:', completedLevelStats);
        
        // Prepare data for charts
        const levelNames = [];
        const accuracies = [];
        const questionCounts = [];
        
        // Use completedLevelStats for permanent statistics
        completedLevelStats.forEach(stats => {
            if (stats.questionsAnswered > 0) {
                levelNames.push(`Level ${stats.levelNumber}`);
                accuracies.push(stats.accuracy.toFixed(1));
                questionCounts.push(stats.questionsAnswered);
            }
        });
        
        // If no data, show empty state
        if (levelNames.length === 0) {
            const chartsGrid = document.querySelector('.charts-grid');
            if (chartsGrid) {
                chartsGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #6b7280;">Start playing levels to see your performance charts!</p>';
            }
            return;
        }
        
        // Destroy existing charts if they exist
        if (window.accuracyChart) window.accuracyChart.destroy();
        if (window.questionsChart) window.questionsChart.destroy();
        
        // Check if Chart is defined
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }
        
        // Accuracy Chart (Bar Chart)
        const accuracyCanvas = document.getElementById('accuracy-chart');
        if (!accuracyCanvas) {
            console.error('accuracy-chart canvas not found');
            return;
        }
        const accuracyCtx = accuracyCanvas.getContext('2d');
        window.accuracyChart = new Chart(accuracyCtx, {
            type: 'bar',
            data: {
                labels: levelNames,
                datasets: [{
                    label: 'Accuracy %',
                    data: accuracies,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Questions Chart (Pie Chart)
        const questionsCanvas = document.getElementById('questions-chart');
        if (!questionsCanvas) {
            console.error('questions-chart canvas not found');
            return;
        }
        const questionsCtx = questionsCanvas.getContext('2d');
        window.questionsChart = new Chart(questionsCtx, {
            type: 'pie',
            data: {
                labels: levelNames,
                datasets: [{
                    data: questionCounts,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
                        'rgba(168, 85, 247, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering profile charts:', error);
    }
}

function renderLevelStatsTable(userData, levelsData) {
    const tableContainer = document.getElementById('level-stats-table');
    const completedLevelStats = userData.completedLevelStats || [];
    const levelProgress = userData.levelProgress || []; // Current attempt in progress
    
    console.log('📊 Rendering level stats table');
    console.log('Completed stats:', completedLevelStats);
    console.log('Current progress:', levelProgress);
    
    let html = `
        <div class="level-stat-row header">
            <div>Level</div>
            <div>Topic</div>
            <div>Questions</div>
            <div>Accuracy</div>
            <div>Status</div>
        </div>
    `;
    
    levelsData.forEach(level => {
        // Check for permanent statistics first
        const stats = completedLevelStats.find(cls => cls.levelNumber === level.levelNumber);
        // Check for current in-progress attempt
        const progress = levelProgress.find(lp => lp.levelNumber === level.levelNumber);
        
        let questionsAnswered, correctAnswers, accuracy;
        
        if (stats) {
            // Use saved statistics from completed attempts
            questionsAnswered = stats.questionsAnswered;
            correctAnswers = stats.correctAnswers;
            accuracy = stats.accuracy.toFixed(1);
        } else if (progress) {
            // Use current in-progress data
            questionsAnswered = progress.questionsAnswered?.length || 0;
            correctAnswers = progress.correctAnswers || 0;
            accuracy = questionsAnswered > 0 ? ((correctAnswers / questionsAnswered) * 100).toFixed(1) : 0;
        } else {
            // No data yet
            questionsAnswered = 0;
            correctAnswers = 0;
            accuracy = 0;
        }
        
        const isCompleted = level.isCompleted;
        const accuracyClass = accuracy >= 70 ? 'high' : accuracy >= 50 ? 'medium' : 'low';
        
        console.log(`Level ${level.levelNumber} (${level.title}):`, {
            questionsAnswered,
            correctAnswers,
            accuracy: accuracy + '%',
            isCompleted,
            hasStats: !!stats,
            hasProgress: !!progress
        });
        
        html += `
            <div class="level-stat-row">
                <div class="level-stat-icon">${level.icon}</div>
                <div><strong>${level.title}</strong></div>
                <div>${questionsAnswered} / 15</div>
                <div class="level-stat-accuracy ${accuracyClass}">${accuracy}%</div>
                <div>${isCompleted ? '✅ Completed' + (stats && stats.attemptsCount > 1 ? ` (x${stats.attemptsCount})` : '') : questionsAnswered > 0 ? '🔄 In Progress' : '🔒 Not Started'}</div>
            </div>
        `;
    });
    
    tableContainer.innerHTML = html;
}

// ===== PROFILE PICTURE MANAGEMENT =====

async function uploadProfilePicture(file) {
    try {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be less than 5MB', 'error');
            return;
        }
        
        // Validate file type
        if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
            showToast('Only JPG, PNG, and GIF images are allowed', 'error');
            return;
        }
        
        console.log('Uploading file:', file.name, file.type, file.size);
        console.log('Auth token:', authToken ? 'exists' : 'missing');
        
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        const response = await fetch(`${API_URL}/user/upload-profile-picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        
        updateProfilePicture(data.profilePicture);
        showToast('Profile picture updated successfully! 📸', 'success');
        
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        showToast(error.message || 'Failed to upload profile picture', 'error');
    }
}

function updateProfilePicture(profilePicturePath) {
    // Update profile page avatar
    const profileImg = document.getElementById('profile-avatar-img');
    const profileDefault = document.getElementById('profile-avatar-default');
    
    // Update header avatar
    const headerImg = document.getElementById('header-profile-img');
    const headerDefault = document.getElementById('header-profile-default');
    
    if (profilePicturePath) {
        // Show images, hide defaults
        profileImg.src = profilePicturePath;
        profileImg.style.display = 'block';
        profileDefault.style.display = 'none';
        
        headerImg.src = profilePicturePath;
        headerImg.style.display = 'block';
        headerDefault.style.display = 'none';
    } else {
        // Show defaults, hide images
        profileImg.style.display = 'none';
        profileDefault.style.display = 'flex';
        
        headerImg.style.display = 'none';
        headerDefault.style.display = 'flex';
    }
}

// ===== AI INSIGHTS MODAL =====

function openAIInsightsModal(type) {
    const modal = document.getElementById('ai-insights-modal');
    const modalBody = document.getElementById('ai-modal-body');
    const modalTitle = document.getElementById('ai-modal-title');
    
    if (type === 'weak-topics') {
        modalTitle.textContent = '📉 Topics to Improve';
        modalBody.innerHTML = '<div class="loading-spinner-small"></div>';
        modal.classList.remove('hidden');
        analyzeWeakTopicsModal();
    } else if (type === 'learning-path') {
        modalTitle.textContent = '🎯 Personalized Learning Path';
        modalBody.innerHTML = '<div class="loading-spinner-small"></div>';
        modal.classList.remove('hidden');
        generateLearningPathModal();
    }
}

// ===== NEW AI FEATURES =====

// Analyze weak topics (for modal)
async function analyzeWeakTopicsModal() {
    const modalBody = document.getElementById('ai-modal-body');
    
    try {
        const response = await apiCall('/ai/weak-topics');
        const weakTopics = response.weakTopics || [];
        
        if (weakTopics.length === 0) {
            modalBody.innerHTML = '<p class="no-data">Great job! No weak areas detected yet. Keep practicing!</p>';
        } else {
            let html = '<div class="weak-topics-list">';
            weakTopics.forEach(topic => {
                html += `
                    <div class="weak-topic-item">
                        <div class="weak-topic-header">
                            <h4>${topic.topic}</h4>
                            <span class="accuracy-badge ${topic.accuracy < 50 ? 'low' : topic.accuracy < 70 ? 'medium' : 'high'}">${topic.accuracy}% accuracy</span>
                        </div>
                        <div class="weak-topic-suggestion">${topic.suggestion}</div>
                        ${topic.detailedAnalysis ? `<div class="weak-topic-analysis">${topic.detailedAnalysis}</div>` : ''}
                        <div class="weak-topic-stats">
                            <span>📝 ${topic.questionsAttempted} questions attempted</span>
                            <span>✅ ${topic.correctAnswers} correct</span>
                            <span>❌ ${topic.questionsAttempted - topic.correctAnswers} to improve</span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            modalBody.innerHTML = html;
        }
    } catch (error) {
        console.error('Error analyzing weak topics:', error);
        modalBody.innerHTML = '<p class="error-text">Failed to analyze topics. Please try again.</p>';
    }
}

// Generate learning path (for modal)
async function generateLearningPathModal() {
    const modalBody = document.getElementById('ai-modal-body');
    
    try {
        const response = await apiCall('/ai/learning-path');
        const learningPath = response.learningPath || [];
        
        if (learningPath.length === 0) {
            modalBody.innerHTML = '<p class="no-data">Complete some levels to get personalized recommendations!</p>';
        } else {
            let html = '<div class="learning-path-list">';
            learningPath.forEach((step, index) => {
                html += `
                    <div class="learning-path-step">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <h4>${step.level}</h4>
                            <p>${step.recommendation}</p>
                            <div class="step-priority priority-${step.priority.toLowerCase()}">
                                ${step.priority} Priority
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            modalBody.innerHTML = html;
        }
    } catch (error) {
        console.error('Error generating learning path:', error);
        modalBody.innerHTML = '<p class="error-text">Failed to generate learning path. Please try again.</p>';
    }
}

// Legacy functions (kept for compatibility but now use modal)
async function analyzeWeakTopics() {
    openAIInsightsModal('weak-topics');
}

async function generateLearningPath() {
    openAIInsightsModal('learning-path');
}

// Get motivational message  
async function getMotivation() {
    const textElement = document.getElementById('motivation-text');
    
    textElement.textContent = 'Loading...';
    
    try {
        const response = await apiCall('/ai/motivation');
        textElement.textContent = response.motivation || 'Keep going! You\'re doing great! 🚀';
        playCoinSound();
    } catch (error) {
        textElement.textContent = 'Keep learning and growing! Every question brings you closer to financial freedom!';
    }
}

// Variable to track question start time
let questionStartTime = null;
// ========================================
// REAL-LIFE SCENARIOS SECTION
// ========================================

let currentScenario = null;
let currentScenarioQuestion = null;
let selectedScenarioOption = null;

// Load and display scenarios on dashboard
async function loadScenarios() {
    try {
        const response = await apiCall('/scenarios');
        
        if (!response.unlocked) {
            // Scenarios not yet unlocked
            document.getElementById('scenarios-section').classList.add('hidden');
            return;
        }
        
        // Show scenarios section
        document.getElementById('scenarios-section').classList.remove('hidden');
        
        const scenariosGrid = document.getElementById('scenarios-grid');
        scenariosGrid.innerHTML = response.scenarios.map(scenario => {
            const statusIcon = scenario.isCompleted ? '✅' : 
                              scenario.isUnlocked ? '🔓' : '🔒';
            const cardClass = scenario.isCompleted ? 'completed' : 
                             scenario.isUnlocked ? '' : 'locked';
            
            let progressBadge = '';
            if (scenario.isCompleted) {
                progressBadge = `<span class="scenario-complete-badge">✅ Completed</span>`;
            } else if (scenario.currentQuestion > 1) {
                progressBadge = `<span class="scenario-progress-badge">In Progress: ${scenario.currentQuestion}/${scenario.totalQuestions}</span>`;
            }
            
            return `
                <div class="scenario-card ${cardClass}" 
                     ${scenario.isUnlocked ? `onclick="openScenario(${scenario.scenarioNumber})"` : ''}>
                    <div class="scenario-header">
                        <span class="scenario-number">Scenario ${scenario.scenarioNumber}</span>
                        <span class="scenario-status">${statusIcon}</span>
                    </div>
                    <div class="scenario-icon">${scenario.icon}</div>
                    <h3 class="scenario-title">${scenario.title}</h3>
                    <p class="scenario-description">${scenario.description}</p>
                    <div class="scenario-meta">
                        <span class="scenario-questions">📊 ${scenario.totalQuestions} Questions</span>
                        ${progressBadge}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading scenarios:', error);
    }
}

// Open scenario detail
async function openScenario(scenarioNumber) {
    document.getElementById('loading-screen').classList.remove('hidden');
    
    try {
        console.log('📂 Opening scenario:', scenarioNumber);
        
        // Refresh user data to ensure we have latest info
        if (!currentUser) {
            const userData = await apiCall('/user/profile');
            currentUser = userData;
        }
        
        const scenarioData = await apiCall(`/scenarios/${scenarioNumber}`);
        console.log('✅ Scenario data loaded:', scenarioData);
        currentScenario = scenarioData;
        
        // Update user stats in navbar
        document.getElementById('scenario-balance').textContent = currentUser.virtualBalance || 0;
        document.getElementById('scenario-points').textContent = currentUser.totalPoints || 0;
        
        displayScenarioIntro();
        showScreen('scenario-detail-screen');
    } catch (error) {
        console.error('❌ Error loading scenario:', error);
        showToast('Failed to load scenario: ' + error.message, 'error');
    } finally {
        document.getElementById('loading-screen').classList.add('hidden');
    }
}

// Display scenario introduction
function displayScenarioIntro() {
    document.getElementById('scenario-icon-large').textContent = currentScenario.icon || '🎯';
    document.getElementById('scenario-title').textContent = currentScenario.title;
    document.getElementById('scenario-description').textContent = currentScenario.description;
    document.getElementById('scenario-total-questions').textContent = currentScenario.totalQuestions;
    
    // Update start button
    const startBtn = document.getElementById('start-scenario-btn');
    if (currentScenario.currentQuestion > 1) {
        startBtn.textContent = `Resume (Question ${currentScenario.currentQuestion}/${currentScenario.totalQuestions}) 🚀`;
    } else {
        startBtn.textContent = 'Start Scenario 🚀';
    }
    
    // Show intro, hide quiz and complete
    document.getElementById('scenario-intro').classList.remove('hidden');
    document.getElementById('scenario-quiz-container').classList.add('hidden');
    document.getElementById('scenario-complete-container').classList.add('hidden');
}

// Start scenario quiz
async function startScenario() {
    document.getElementById('scenario-intro').classList.add('hidden');
    document.getElementById('scenario-quiz-container').classList.remove('hidden');
    
    // Load the current question
    await loadScenarioQuestion(currentScenario.currentQuestion);
}

// Load a specific scenario question
async function loadScenarioQuestion(questionNumber) {
    document.getElementById('loading-screen').classList.remove('hidden');
    selectedScenarioOption = null;
    
    try {
        console.log('📝 Loading scenario question:', currentScenario.scenarioNumber, 'question:', questionNumber);
        
        const questionData = await apiCall(
            `/scenarios/${currentScenario.scenarioNumber}/question/${questionNumber}`
        );
        
        console.log('✅ Question data received:', questionData);
        currentScenarioQuestion = questionData;
        
        // Update progress
        document.getElementById('scenario-current-question').textContent = questionNumber;
        document.getElementById('scenario-total-qs').textContent = currentScenario.totalQuestions;
        const progressPercent = (questionNumber / currentScenario.totalQuestions) * 100;
        document.getElementById('scenario-progress-fill').style.width = progressPercent + '%';
        
        // Display situation and context
        document.getElementById('scenario-situation').textContent = questionData.situation;
        document.getElementById('scenario-money-context').textContent = questionData.virtualMoneyContext;
        document.getElementById('scenario-question').textContent = questionData.question;
        
        // Display options
        const optionsHtml = questionData.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            return `
                <div class="scenario-option" onclick="selectScenarioOption(${index})">
                    <div class="option-letter">${letter}</div>
                    <div class="option-text">${option}</div>
                </div>
            `;
        }).join('');
        
        document.getElementById('scenario-options').innerHTML = optionsHtml;
        document.getElementById('submit-scenario-answer').disabled = true;
    } catch (error) {
        console.error('❌ Error loading question:', error);
        showToast('Failed to load question: ' + error.message, 'error');
    } finally {
        document.getElementById('loading-screen').classList.add('hidden');
    }
}

// Select scenario option
function selectScenarioOption(index) {
    selectedScenarioOption = index;
    
    // Update UI
    document.querySelectorAll('.scenario-option').forEach((opt, i) => {
        if (i === index) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    document.getElementById('submit-scenario-answer').disabled = false;
}

// Submit scenario answer
async function submitScenarioAnswer() {
    if (selectedScenarioOption === null) {
        showToast('Please select an option first!', 'warning');
        return;
    }
    
    console.log('📤 Submitting answer:', {
        scenarioNumber: currentScenario.scenarioNumber,
        questionNumber: currentScenarioQuestion.questionNumber,
        userAnswer: selectedScenarioOption
    });
    
    document.getElementById('loading-screen').classList.remove('hidden');
    
    try {
        const response = await apiCall(`/scenarios/${currentScenario.scenarioNumber}/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionNumber: currentScenarioQuestion.questionNumber,
                userAnswer: selectedScenarioOption
            })
        });
        
        console.log('✅ Answer response:', response);
        
        // Update user points
        currentUser.totalPoints = response.totalPoints;
        document.getElementById('scenario-points').textContent = response.totalPoints;
        document.getElementById('points').textContent = response.totalPoints;
        
        if (response.isCorrect) {
            // Correct answer - show feedback and continue
            playCheerSound();
            showToast(`✅ Correct! +${response.pointsChange} points`, 'success');
            
            // Wait a bit, then load next question or complete
            setTimeout(() => {
                if (response.isScenarioComplete) {
                    displayScenarioComplete(response.progress);
                } else {
                    loadScenarioQuestion(response.currentQuestion);
                }
            }, 1500);
        } else {
            // Wrong answer - show explanation
            playErrorSound();
            showToast(`❌ Wrong! ${response.pointsChange} points`, 'error');
            
            // Show explanation modal
            document.getElementById('scenario-explanation-text').innerHTML = `
                <div style="background: #fef2f2; padding: 15px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #ef4444;">
                    <strong style="color: #991b1b;">Your answer was incorrect.</strong>
                    <p style="color: #7f1d1d; margin-top: 8px;">Points deducted: ${response.pointsChange}</p>
                </div>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; border-left: 4px solid #22c55e;">
                    <h4 style="color: #166534; margin-bottom: 10px;">💡 Why this matters:</h4>
                    <p style="color: #15803d; line-height: 1.7;">${response.explanation}</p>
                </div>
                ${response.nextQuestionContext ? `
                <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin-top: 15px; border-left: 4px solid #f59e0b;">
                    <h4 style="color: #92400e; margin-bottom: 10px;">📖 Story continues...</h4>
                    <p style="color: #78350f; line-height: 1.7;">${response.nextQuestionContext}</p>
                </div>
                ` : ''}
            `;
            
            // Store response for later
            window.pendingScenarioResponse = response;
            document.getElementById('scenario-explanation-modal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('❌ Error submitting answer:', error);
        console.error('Error details:', error.message);
        showToast('Failed to submit answer: ' + error.message, 'error');
    } finally {
        document.getElementById('loading-screen').classList.add('hidden');
    }
}

// Continue after explanation
function continueAfterExplanation() {
    document.getElementById('scenario-explanation-modal').classList.add('hidden');
    
    const response = window.pendingScenarioResponse;
    if (response) {
        if (response.isScenarioComplete) {
            displayScenarioComplete(response.progress);
        } else {
            loadScenarioQuestion(response.currentQuestion);
        }
        window.pendingScenarioResponse = null;
    }
}

// Display scenario completion
function displayScenarioComplete(progress) {
    document.getElementById('scenario-quiz-container').classList.add('hidden');
    document.getElementById('scenario-complete-container').classList.remove('hidden');
    
    document.getElementById('scenario-final-correct').textContent = progress.correctAnswers;
    document.getElementById('scenario-final-wrong').textContent = progress.wrongAnswers;
    document.getElementById('scenario-final-points').textContent = progress.totalPointsEarned;
    document.getElementById('scenario-final-lost').textContent = progress.totalPointsLost;
    
    createCoinSplash();
    playCheerSound();
}

// Replay scenario
async function replayScenario() {
    if (!confirm('This will reset your progress in this scenario. Continue?')) return;
    
    document.getElementById('loading-screen').classList.remove('hidden');
    
    try {
        await apiCall(`/scenarios/${currentScenario.scenarioNumber}/reset`, {
            method: 'POST'
        });
        
        // Reload the scenario
        await openScenario(currentScenario.scenarioNumber);
        showToast('Scenario reset! Good luck! 🚀', 'success');
    } catch (error) {
        console.error('Error resetting scenario:', error);
        showToast('Failed to reset scenario', 'error');
    } finally {
        document.getElementById('loading-screen').classList.add('hidden');
    }
}