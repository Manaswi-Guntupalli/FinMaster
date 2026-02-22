// API Configuration
const API_URL = 'http://localhost:3000/api';

// State Management
let currentUser = null;
let authToken = null;
let currentLevel = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let totalPointsEarned = 0;
let totalCoinsEarned = 0;
let isAIChatOpen = false;
let currentQuestionData = null;

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
            'Content-Type': 'application/json'
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
        showScreen('dashboard-screen');
        
        // Load AI insights
        setTimeout(() => {
            if (userData.totalPoints > 0) {
                loadInitialMotivation();
            }
        }, 1000);
    } catch (error) {
        showToast('Failed to load dashboard', 'error');
        logout();
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

function updateDashboardUI(userData, levels) {
    // Update user info
    document.getElementById('username').textContent = userData.username;
    document.getElementById('balance').textContent = userData.virtualBalance;
    document.getElementById('points').textContent = userData.totalPoints;
    document.getElementById('completed-levels').textContent = userData.completedLevels.length;
    document.getElementById('streak').textContent = userData.streak;
    
    // Update navbar stats
    document.getElementById('nav-balance').textContent = userData.virtualBalance;
    document.getElementById('nav-points').textContent = userData.totalPoints;
    document.getElementById('nav-streak').textContent = userData.streak;
    
    // Update achievements
    const achievementsList = document.getElementById('achievements-list');
    if (userData.achievements && userData.achievements.length > 0) {
        achievementsList.innerHTML = userData.achievements.map(achievement => `
            <div class="achievement-badge">
                <span>🏆</span>
                <span>${achievement.name}</span>
            </div>
        `).join('');
    } else {
        achievementsList.innerHTML = '<p class="no-achievements">Complete levels to earn achievements!</p>';
    }
    
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
    
    try {
        const levelData = await apiCall(`/game/levels/${levelNumber}`);
        currentLevel = levelData.level;
        currentQuestions = levelData.questions;
        currentQuestionIndex = 0;
        correctAnswersCount = 0;
        totalPointsEarned = 0;
        totalCoinsEarned = 0;
        
        displayLevelIntro();
        showScreen('level-detail-screen');
        
        // Update navbar stats
        document.getElementById('nav-balance-level').textContent = currentUser.virtualBalance;
        document.getElementById('nav-points-level').textContent = currentUser.totalPoints;
    } catch (error) {
        showToast('Failed to load level', 'error');
    } finally {
        document.getElementById('loading-screen').classList.add('hidden');
    }
}

function displayLevelIntro() {
    document.getElementById('level-icon-large').textContent = currentLevel.icon;
    document.getElementById('level-title').textContent = currentLevel.title;
    document.getElementById('level-introduction').textContent = currentLevel.introduction;
    
    // Show intro, hide quiz and complete
    document.querySelector('.level-intro').classList.remove('hidden');
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('level-complete-container').classList.add('hidden');
}

function startQuiz() {
    document.querySelector('.level-intro').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('total-questions').textContent = currentQuestions.length;
    
    displayQuestion();
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    currentQuestionData = question; // Store for AI hints
    
    // Track question start time
    questionStartTime = Date.now();
    
    // Update progress
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    
    // Display question
    document.getElementById('question-text').textContent = question.question;
    
    // Reset AI hint
    const hintBtn = document.getElementById('ai-hint-btn');
    const hintContainer = document.getElementById('ai-hint-container');
    hintBtn.disabled = false;
    hintBtn.textContent = '💡 Ask AI for Help';
    hintContainer.classList.add('hidden');
    
    // Display options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = question.options.map((option, index) => `
        <div class="option" data-index="${index}" onclick="selectOption(${index}, '${question._id}')">
            ${option}
        </div>
    `).join('');
    
    // Hide feedback
    document.getElementById('feedback-container').classList.add('hidden');
}

async function selectOption(selectedIndex, questionId) {
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
                questionId: questionId,
                selectedAnswer: selectedIndex,
                timeSpent: timeSpent
            })
        });
        
        // Update user balance and points
        currentUser.virtualBalance = result.newBalance;
        currentUser.totalPoints = result.newPoints;
        currentUser.streak = result.streak;
        
        // Update navbar
        document.getElementById('nav-balance-level').textContent = result.newBalance;
        document.getElementById('nav-points-level').textContent = result.newPoints;
        
        // Visual feedback
        const selectedOption = options[selectedIndex];
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
        
        // Show feedback
        setTimeout(() => {
            displayFeedback(result);
        }, 800);
        
    } catch (error) {
        showToast('Failed to submit answer', 'error');
        // Re-enable options on error
        options.forEach(opt => {
            opt.classList.remove('disabled');
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
        </div>
    `;
    
    feedbackContainer.classList.remove('hidden');
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
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
        `${correctAnswersCount}/${currentQuestions.length}`;
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
                difficulty: currentQuestionData.difficulty
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
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Back to dashboard buttons
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
        loadDashboard();
    });
    
    document.getElementById('back-to-dashboard-complete').addEventListener('click', () => {
        loadDashboard();
    });
    
    // Start quiz button
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    
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
    
    // New AI features event listeners
    document.getElementById('analyze-weak-topics-btn').addEventListener('click', analyzeWeakTopics);
    document.getElementById('generate-learning-path-btn').addEventListener('click', generateLearningPath);
    document.getElementById('refresh-motivation-btn').addEventListener('click', getMotivation);
});

// Make functions available globally
window.openLevel = openLevel;
window.selectOption = selectOption;

// ===== NEW AI FEATURES =====

// Analyze weak topics
async function analyzeWeakTopics() {
    const btn = document.getElementById('analyze-weak-topics-btn');
    const listContainer = document.getElementById('weak-topics-list');
    
    btn.disabled = true;
    btn.textContent = 'Analyzing...';
    listContainer.innerHTML = '<div class="loading-spinner-small"></div>';
    
    try {
        const response = await apiCall('/ai/weak-topics');
        const weakTopics = response.weakTopics || [];
        
        if (weakTopics.length === 0) {
            listContainer.innerHTML = '<p class="no-data">Great job! No weak areas detected yet. Keep practicing!</p>';
        } else {
            listContainer.innerHTML = weakTopics.map(topic => `
                <div class="weak-topic-item">
                    <div class="weak-topic-header">
                        <span class="weak-topic-name">${topic.topic}</span>
                        <span class="weak-topic-score">Weakness: ${Math.round(topic.weaknessScore)}%</span>
                    </div>
                    <div class="weak-topic-category">${topic.category}</div>
                    <div class="weak-topic-suggestions">
                        <strong>Suggestions:</strong>
                        <ul>
                            ${(topic.suggestions || topic.improvementSuggestions || []).map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('');
        }
        
        showToast('Weak topics analyzed successfully!', 'success');
    } catch (error) {
        listContainer.innerHTML = '<p class="error-text">Failed to analyze weak topics. Please try again.</p>';
        showToast('Failed to analyze weak topics', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Refresh';
    }
}

// Generate learning path
async function generateLearningPath() {
    const btn = document.getElementById('generate-learning-path-btn');
    const listContainer = document.getElementById('learning-path-list');
    
    btn.disabled = true;
    btn.textContent = 'Generating...';
    listContainer.innerHTML = '<div class="loading-spinner-small"></div>';
    
    try {
        const response = await apiCall('/ai/learning-path');
        const learningPath = response.learningPath || [];
        
        if (learningPath.length === 0) {
            listContainer.innerHTML = '<p class="no-data">Complete some levels to get personalized recommendations!</p>';
        } else {
            listContainer.innerHTML = learningPath.map((item, index) => `
                <div class="learning-path-item priority-${Math.min(item.priority, 10)}">
                    <div class="learning-path-number">${index + 1}</div>
                    <div class="learning-path-content">
                        <div class="learning-path-header">
                            <span class="learning-path-topic">${item.topic}</span>
                            <span class="learning-path-priority">Priority: ${item.priority}/10</span>
                        </div>
                        <div class="learning-path-category">${item.category}</div>
                        <p class="learning-path-reason">${item.reason || 'Recommended for your growth'}</p>
                        ${item.estimatedDays ? `<span class="learning-path-time">⏱️ ~${item.estimatedDays} days</span>` : ''}
                        ${item.resources ? `
                            <div class="learning-path-resources">
                                <strong>Resources:</strong>
                                <ul>
                                    ${item.resources.map(r => `<li>${r}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }
        
        showToast('Learning path generated!', 'success');
    } catch (error) {
        listContainer.innerHTML = '<p class="error-text">Failed to generate learning path. Please try again.</p>';
        showToast('Failed to generate learning path', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Refresh';
    }
}

// Get motivational message
async function getMotivation() {
    const btn = document.getElementById('refresh-motivation-btn');
    const textElement = document.getElementById('motivation-text');
    
    btn.disabled = true;
    textElement.textContent = 'Loading...';
    
    try {
        const response = await apiCall('/ai/motivation');
        textElement.textContent = response.motivation || 'Keep going! You\'re doing great! 🚀';
        playCoinSound();
    } catch (error) {
        textElement.textContent = 'Keep learning and growing! Every question brings you closer to financial freedom!';
    } finally {
        btn.disabled = false;
    }
}

// Variable to track question start time
let questionStartTime = null;
