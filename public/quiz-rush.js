// Quiz Rush Game Logic
const API_URL = `${window.location.origin}/api`;
let authToken = localStorage.getItem('finmaster_token');
let isGuest = false;
let socket = null;

// Game State
let gameState = {
    mode: null, // 'single' or 'multiplayer'
    gameId: null,
    roomCode: null,
    isHost: false,
    player1: { username: '', avatar: '', score: 0, correctAnswers: 0, totalAnswers: 0 },
    player2: { username: '', avatar: '', score: 0, correctAnswers: 0, totalAnswers: 0 },
    questions: [],
    currentQuestionIndex: 0,
    timeLeft: 30,
    timerInterval: null,
    lives: 3,
    comboCount: 0,
    powerupsUsed: { time: false, fifty: false, skip: false },
    isAnswering: false,
    questionStartTime: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    loadUserProfile();
    connectSocket();
});

function checkAuth() {
    // Check if guest session exists
    const guestName = sessionStorage.getItem('guestName');
    const gameId = sessionStorage.getItem('gameId');
    const roomCode = sessionStorage.getItem('roomCode');
    
    if (guestName && gameId && roomCode) {
        // Guest mode - joining from QR code
        isGuest = true;
        gameState.mode = 'multiplayer';
        gameState.isHost = false;
        gameState.gameId = gameId;
        gameState.roomCode = roomCode;
        gameState.player2.username = guestName;
        
        // Show waiting screen for guest
        setTimeout(() => {
            showScreen('mode-selection');
            const modeScreen = document.getElementById('mode-selection');
            modeScreen.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h2 style="color: white; margin-bottom: 20px;">Joined as ${guestName}! 🎮</h2>
                    <h3 style="color: #a78bfa; margin-bottom: 30px;">Room: ${roomCode}</h3>
                    <div class="loading-spinner" style="margin: 30px auto; width: 60px; height: 60px; border: 4px solid #a78bfa; border-top: 4px solid #fbbf24; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p style="color: #9ca3af; font-size: 18px;">Waiting for host to start the game...</p>
                </div>
            `;
        }, 500);
        
        return;
    }
    
    // Regular user - must be logged in
    if (!authToken) {
        window.location.href = '/index.html';
    }
}

async function loadUserProfile() {
    if (isGuest) {
        // Guest user - use session data
        gameState.player2.username = sessionStorage.getItem('guestName');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const userData = await response.json();
        
        gameState.player1.username = userData.username;
        gameState.player1.avatar = userData.profilePicture || '';
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function connectSocket() {
    socket = io(window.location.origin);
    
    socket.on('connect', () => {
        console.log('Connected to Socket.IO');
        
        // If guest, auto-join the room when socket connects
        if (isGuest && gameState.roomCode) {
            console.log('Guest auto-joining room:', gameState.roomCode);
            socket.emit('join-room', { 
                roomCode: gameState.roomCode, 
                userId: sessionStorage.getItem('guestName') 
            });
        }
    });
    
    socket.on('player-joined', (data) => {
        if (gameState.mode === 'multiplayer' && gameState.isHost) {
            gameState.player2 = data.player2;
            updateWaitingRoom();
            
            if (data.status === 'ready') {
                showToast('Player 2 joined! Starting game...', 'success');
                setTimeout(() => startMultiplayerGame(), 2000);
            }
        }
    });
    
    socket.on('start-game', async () => {
        console.log('Received start-game event. isHost:', gameState.isHost, 'isGuest:', isGuest);
        
        if (!gameState.isHost) {
            // Guest player - fetch questions from server
            try {
                console.log('Guest player fetching questions for gameId:', gameState.gameId);
                const response = await fetch(`${API_URL}/quizrush/start-game/${gameState.gameId}`, {
                    method: 'POST'
                });
                
                const data = await response.json();
                console.log('Guest received questions:', data.questions.length);
                gameState.questions = data.questions;
                
                // Set player data from server response
                if (data.player1) {
                    gameState.player1 = {
                        username: data.player1.username,
                        avatar: data.player1.avatar,
                        score: 0,
                        correctAnswers: 0,
                        totalAnswers: 0
                    };
                }
                if (data.player2) {
                    gameState.player2 = {
                        username: data.player2.username,
                        avatar: data.player2.avatar,
                        score: 0,
                        correctAnswers: 0,
                        totalAnswers: 0
                    };
                }
                
                showScreen('game-screen');
                initializeGame();
                loadQuestion();
            } catch (error) {
                console.error('Error loading questions:', error);
                showToast('Failed to load questions', 'error');
            }
        }
    });
    
    socket.on('opponent-answered', (data) => {
        if (data.playerNum === 1) {
            gameState.player1.score = data.score;
        } else {
            gameState.player2.score = data.score;
        }
        updateScoreDisplay();
        
        if (data.isCorrect) {
            showToast(`Opponent answered correctly! +${data.pointsEarned}pts`, 'success');
        }
    });
    
    socket.on('player-eliminated', (data) => {
        // Opponent lost all lives - you win!
        showToast('🎉 Opponent eliminated! You win!', 'success');
        setTimeout(() => endGame(), 2000);
    });
    
    socket.on('show-results', (results) => {
        showResults(results);
    });
}

function setupEventListeners() {
    // Mode selection
    document.getElementById('single-player-btn').addEventListener('click', startSinglePlayer);
    document.getElementById('multiplayer-btn').addEventListener('click', createMultiplayerRoom);
    document.getElementById('show-leaderboard').addEventListener('click', showLeaderboard);
    
    // Waiting room
    document.getElementById('back-from-waiting').addEventListener('click', () => showScreen('mode-selection'));
    document.getElementById('copy-room-link').addEventListener('click', copyRoomLink);
    
    // Game
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
    });
    
    // Power-ups
    document.getElementById('powerup-time')?.addEventListener('click', () => usePowerup('time'));
    document.getElementById('powerup-fifty')?.addEventListener('click', () => usePowerup('fifty'));
    document.getElementById('powerup-skip')?.addEventListener('click', () => usePowerup('skip'));
    
    // Results
    document.getElementById('play-again-btn').addEventListener('click', () => {
        resetGame();
        showScreen('mode-selection');
    });
    document.getElementById('view-leaderboard-result').addEventListener('click', showLeaderboard);
    document.getElementById('back-home-result').addEventListener('click', () => {
        window.location.href = '/index.html';
    });
    
    // Share
    document.getElementById('share-twitter').addEventListener('click', shareOnTwitter);
    document.getElementById('share-whatsapp').addEventListener('click', shareOnWhatsApp);
    document.getElementById('share-copy').addEventListener('click', copyResults);
    
    // Leaderboard
    document.getElementById('close-leaderboard').addEventListener('click', hideLeaderboard);
    document.getElementById('close-leaderboard-btn').addEventListener('click', hideLeaderboard);
    
    // Back to home
    document.getElementById('back-to-home').addEventListener('click', () => {
        window.location.href = '/index.html';
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Single Player Mode
async function startSinglePlayer() {
    gameState.mode = 'single';
    gameState.player2.username = 'Computer AI';
    gameState.player2.avatar = '';
    
    document.getElementById('powerups-container').style.display = 'flex';
    
    // Load questions
    try {
        const response = await fetch(`${API_URL}/game/questions?level=1&limit=10`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const questions = await response.json();
        gameState.questions = questions;
        
        showScreen('game-screen');
        initializeGame();
        loadQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        showToast('Failed to load questions', 'error');
    }
}

// Multiplayer Mode
async function createMultiplayerRoom() {
    gameState.mode = 'multiplayer';
    gameState.isHost = true;
    
    try {
        const response = await fetch(`${API_URL}/quizrush/create-room`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gameMode: 'quiz-rush' })
        });
        
        const data = await response.json();
        gameState.roomCode = data.roomCode;
        gameState.gameId = data.gameId;
        
        // Display QR code and room info
        document.getElementById('qr-code-img').src = data.qrCode;
        document.getElementById('room-code-display').textContent = data.roomCode;
        document.getElementById('p1-name-waiting').textContent = gameState.player1.username;
        
        if (gameState.player1.avatar) {
            document.getElementById('p1-avatar-waiting').src = gameState.player1.avatar;
            document.getElementById('p1-avatar-waiting').style.display = 'block';
        }
        
        // Join socket room
        socket.emit('join-room', { roomCode: data.roomCode, userId: gameState.player1.username });
        
        showScreen('waiting-room');
    } catch (error) {
        console.error('Error creating room:', error);
        showToast('Failed to create room', 'error');
    }
}

function updateWaitingRoom() {
    const p2Slot = document.getElementById('p2-slot-waiting');
    p2Slot.classList.remove('empty');
    p2Slot.classList.add('filled');
    p2Slot.innerHTML = `
        <img class="player-avatar" src="${gameState.player2.avatar || ''}" alt="" style="${gameState.player2.avatar ? '' : 'display: none'}">
        <div class="player-name">${gameState.player2.username}</div>
        <div class="status-badge ready">Ready</div>
    `;
}

async function startMultiplayerGame() {
    try {
        console.log('Starting multiplayer game...', gameState.gameId);
        
        const response = await fetch(`${API_URL}/quizrush/start-game/${gameState.gameId}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received questions:', data.questions);
        
        if (!data.questions || data.questions.length === 0) {
            throw new Error('No questions received from server');
        }
        
        gameState.questions = data.questions;
        
        // Set player data from server
        if (data.player1) {
            gameState.player1 = {
                username: data.player1.username,
                avatar: data.player1.avatar,
                score: 0,
                correctAnswers: 0,
                totalAnswers: 0
            };
        }
        if (data.player2) {
            gameState.player2 = {
                username: data.player2.username,
                avatar: data.player2.avatar,
                score: 0,
                correctAnswers: 0,
                totalAnswers: 0
            };
        }
        
        socket.emit('game-started', { roomCode: gameState.roomCode });
        
        showScreen('game-screen');
        initializeGame();
        loadQuestion();
    } catch (error) {
        console.error('Error starting game:', error);
        showToast('Failed to start game: ' + error.message, 'error');
    }
}

function copyRoomLink() {
    const link = `${window.location.origin}/join.html?room=${gameState.roomCode}`;
    navigator.clipboard.writeText(link);
    showToast('Room link copied!', 'success');
}

// Game Logic
function initializeGame() {
    gameState.currentQuestionIndex = 0;
    gameState.player1.score = 0;
    gameState.player1.correctAnswers = 0;
    gameState.player1.totalAnswers = 0;
    gameState.player2.score = 0;
    gameState.player2.correctAnswers = 0;
    gameState.player2.totalAnswers = 0;
    gameState.lives = 3;
    gameState.comboCount = 0;
    
    updateUI();
}

function updateUI() {
    // Update player names and avatars
    document.getElementById('p1-name').textContent = gameState.player1.username;
    document.getElementById('p2-name').textContent = gameState.player2.username;
    
    if (gameState.player1.avatar) {
        document.getElementById('p1-avatar').src = gameState.player1.avatar;
    }
    if (gameState.player2.avatar) {
        document.getElementById('p2-avatar').src = gameState.player2.avatar;
    }
    
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById('p1-score').textContent = gameState.player1.score;
    document.getElementById('p2-score').textContent = gameState.player2.score;
    document.getElementById('p1-combo').textContent = `×${Math.floor(gameState.comboCount) + 1}`;
}

function loadQuestion() {
    console.log('Loading question:', gameState.currentQuestionIndex, 'Total questions:', gameState.questions?.length);
    
    if (!gameState.questions || gameState.questions.length === 0) {
        console.error('No questions available!');
        showToast('Error: No questions loaded', 'error');
        return;
    }
    
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
        console.log('All questions completed, ending game');
        endGame();
        return;
    }
    
    const question = gameState.questions[gameState.currentQuestionIndex];
    console.log('Current question:', question);
    
    if (!question) {
        console.error('Question is undefined at index:', gameState.currentQuestionIndex);
        showToast('Error loading question', 'error');
        return;
    }
    
    // Update UI
    document.getElementById('question-counter').textContent = 
        `Question ${gameState.currentQuestionIndex + 1}/${gameState.questions.length}`;
    document.getElementById('category-badge').textContent = question.category || 'Finance';
    document.getElementById('question-text').textContent = question.question;
    
    // Load options
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, index) => {
        btn.textContent = question.options[index];
        btn.disabled = false;
        btn.className = 'option-btn';
        btn.blur(); // Remove focus state
    });
    
    // Start timer
    gameState.timeLeft = 30;
    gameState.questionStartTime = Date.now();
    gameState.isAnswering = false;
    startTimer();
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            if (!gameState.isAnswering) {
                handleTimeout();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timer-text').textContent = gameState.timeLeft;
    const circle = document.getElementById('timer-circle');
    const offset = 283 - (283 * gameState.timeLeft / 30);
    circle.style.strokeDashoffset = offset;
    
    // Change color when time is running out
    if (gameState.timeLeft <= 5) {
        circle.style.stroke = '#ff6350';
    } else if (gameState.timeLeft <= 10) {
        circle.style.stroke = '#ffed4e';
    } else {
        circle.style.stroke = '#ffd700';
    }
}

async function selectAnswer(selectedIndex) {
    if (gameState.isAnswering) return;
    
    gameState.isAnswering = true;
    clearInterval(gameState.timerInterval);
    
    const timeTaken = Math.floor((Date.now() - gameState.questionStartTime) / 1000);
    
    // Disable all options
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
    
    if (gameState.mode === 'single') {
        await handleSinglePlayerAnswer(selectedIndex, timeTaken);
    } else {
        await handleMultiplayerAnswer(selectedIndex, timeTaken);
    }
}

async function handleSinglePlayerAnswer(selectedIndex, timeTaken) {
    const question = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = question.correctAnswer === selectedIndex;
    
    // Show correct/wrong
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns[question.correctAnswer].classList.add('correct');
    if (!isCorrect) {
        optionBtns[selectedIndex].classList.add('wrong');
    }
    
    // Calculate points
    let pointsEarned = 0;
    if (isCorrect) {
        const timeBonus = timeTaken < 10 ? 50 : 0;
        const comboMultiplier = 1 + (gameState.comboCount * 0.1);
        pointsEarned = Math.floor((100 * comboMultiplier) + timeBonus);
        
        gameState.player1.score += pointsEarned;
        gameState.player1.correctAnswers++;
        gameState.comboCount++;
        
        showToast(`Correct! +${pointsEarned} points`, 'success');
    } else {
        gameState.lives--;
        gameState.comboCount = 0;
        updateLivesDisplay();
        
        showToast('Wrong answer! -1 life', 'error');
        
        if (gameState.lives <= 0) {
            setTimeout(() => endGame(), 2000);
            return;
        }
    }
    
    gameState.player1.totalAnswers++;
    updateScoreDisplay();
    
    // Computer's turn (70% accuracy)
    setTimeout(() => {
        const computerCorrect = Math.random() < 0.7;
        if (computerCorrect) {
            const compPoints = Math.floor(100 * (1 + Math.random() * 0.5));
            gameState.player2.score += compPoints;
            gameState.player2.correctAnswers++;
        }
        gameState.player2.totalAnswers++;
        updateScoreDisplay();
        
        setTimeout(() => nextQuestion(), 1000);
    }, 1500);
}

async function handleMultiplayerAnswer(selectedIndex, timeTaken) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken && !isGuest) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${API_URL}/quizrush/submit-answer`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                gameId: gameState.gameId,
                questionId: gameState.questions[gameState.currentQuestionIndex].questionId,
                selectedAnswer: selectedIndex,
                timeTaken,
                isGuest: isGuest,
                playerName: isGuest ? sessionStorage.getItem('guestName') : null
            })
        });
        
        const result = await response.json();
        
        // Show correct/wrong
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns[result.correctAnswer].classList.add('correct');
        if (!result.correct) {
            optionBtns[selectedIndex].classList.add('wrong');
        }
        
        // Determine which player this is (guest is player2, host is player1)
        const currentPlayer = isGuest ? gameState.player2 : gameState.player1;
        
        if (result.correct) {
            gameState.comboCount = result.comboCount;
            currentPlayer.score = result.newScore;
            currentPlayer.correctAnswers++;
            showToast(`Correct! +${result.pointsEarned} points`, 'success');
        } else {
            gameState.lives--;
            gameState.comboCount = 0;
            updateLivesDisplay();
            showToast('Wrong answer! -1 life', 'error');
            
            // Check if player lost all lives
            if (gameState.lives <= 0) {
                showToast('💔 All lives lost! Game Over!', 'error');
                
                // Notify opponent that game ended due to lives lost
                socket.emit('player-eliminated', {
                    roomCode: gameState.roomCode,
                    playerNum: isGuest ? 2 : 1,
                    reason: 'lives-lost'
                });
                
                setTimeout(() => endGame(), 2000);
                return;
            }
        }
        
        currentPlayer.totalAnswers++;
        updateScoreDisplay();
        
        // Notify opponent (send correct player number)
        socket.emit('answer-submitted', {
            roomCode: gameState.roomCode,
            playerNum: isGuest ? 2 : 1,
            questionIndex: gameState.currentQuestionIndex,
            isCorrect: result.correct,
            score: result.newScore,
            timeTaken,
            pointsEarned: result.pointsEarned
        });
        
        setTimeout(() => nextQuestion(), 2000);
    } catch (error) {
        console.error('Error submitting answer:', error);
        showToast('Failed to submit answer', 'error');
    }
}

function handleTimeout() {
    showToast('Time\'s up!', 'error');
    gameState.lives--;
    gameState.comboCount = 0;
    gameState.player1.totalAnswers++;
    updateLivesDisplay();
    
    if (gameState.lives <= 0) {
        setTimeout(() => endGame(), 2000);
        return;
    }
    
    setTimeout(() => nextQuestion(), 2000);
}

function nextQuestion() {
    gameState.currentQuestionIndex++;
    loadQuestion();
}

function updateLivesDisplay() {
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index >= gameState.lives) {
            heart.classList.add('lost');
        } else {
            heart.classList.remove('lost');
        }
    });
}

// Power-ups (Single Player Only)
function usePowerup(type) {
    if (gameState.powerupsUsed[type]) return;
    
    gameState.powerupsUsed[type] = true;
    document.getElementById(`powerup-${type}`).disabled = true;
    
    if (type === 'time') {
        gameState.timeLeft = Math.min(gameState.timeLeft + 15, 30);
        showToast('+15 seconds!', 'success');
    } else if (type === 'fifty') {
        const question = gameState.questions[gameState.currentQuestionIndex];
        const optionBtns = document.querySelectorAll('.option-btn');
        let removed = 0;
        
        optionBtns.forEach((btn, index) => {
            if (index !== question.correctAnswer && removed < 2) {
                btn.disabled = true;
                btn.style.opacity = '0.3';
                removed++;
            }
        });
        
        showToast('50/50 used!', 'success');
    } else if (type === 'skip') {
        clearInterval(gameState.timerInterval);
        showToast('Question skipped!', 'success');
        setTimeout(() => nextQuestion(), 1000);
    }
}

// End Game
async function endGame() {
    clearInterval(gameState.timerInterval);
    
    if (gameState.mode === 'multiplayer') {
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (authToken && !isGuest) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            
            const response = await fetch(`${API_URL}/quizrush/end-game/${gameState.gameId}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    isGuest: isGuest,
                    playerName: isGuest ? sessionStorage.getItem('guestName') : null
                })
            });
            
            const results = await response.json();
            
            socket.emit('game-ended', { roomCode: gameState.roomCode, results });
            showResults(results);
        } catch (error) {
            console.error('Error ending game:', error);
        }
    } else {
        // Calculate single player results
        const results = {
            winner: gameState.player1.score > gameState.player2.score ? 'player1' : 'player2',
            player1Score: gameState.player1.score,
            player2Score: gameState.player2.score,
            player1Stats: {
                correct: gameState.player1.correctAnswers,
                total: gameState.player1.totalAnswers,
                accuracy: Math.round((gameState.player1.correctAnswers / gameState.player1.totalAnswers) * 100)
            },
            player2Stats: {
                correct: gameState.player2.correctAnswers,
                total: gameState.player2.totalAnswers,
                accuracy: Math.round((gameState.player2.correctAnswers / gameState.player2.totalAnswers) * 100)
            }
        };
        
        showResults(results);
    }
}

function showResults(results) {
    // Update results screen
    const won = results.winner === 'player1';
    
    document.getElementById('result-title').textContent = won ? '🏆 Victory!' : results.winner === 'tie' ? '🤝 Tie Game!' : '😔 Defeat';
    document.getElementById('result-subtitle').textContent = won ? 'You crushed it!' : results.winner === 'tie' ? 'Evenly matched!' : 'Better luck next time!';
    
    // Player 1
    if (gameState.player1.avatar) {
        document.getElementById('p1-result-avatar').src = gameState.player1.avatar;
    }
    document.getElementById('p1-result-name').textContent = gameState.player1.username;
    document.getElementById('p1-final-score').textContent = results.player1Score;
    document.getElementById('p1-correct').textContent = `${results.player1Stats.correct}/${results.player1Stats.total}`;
    document.getElementById('p1-accuracy').textContent = `${results.player1Stats.accuracy}%`;
    
    // Player 2
    if (gameState.player2.avatar) {
        document.getElementById('p2-result-avatar').src = gameState.player2.avatar;
    }
    document.getElementById('p2-result-name').textContent = gameState.player2.username;
    document.getElementById('p2-final-score').textContent = results.player2Score;
    document.getElementById('p2-correct').textContent = `${results.player2Stats.correct}/${results.player2Stats.total}`;
    document.getElementById('p2-accuracy').textContent = `${results.player2Stats.accuracy}%`;
    
    showScreen('results-screen');
}

// Social Sharing
function shareOnTwitter() {
    const won = gameState.player1.score > gameState.player2.score;
    const text = `I just ${won ? 'won' : 'played'} Quiz Rush on FinMaster! 🎯\n\n` +
                 `My Score: ${gameState.player1.score} points\n` +
                 `Accuracy: ${Math.round((gameState.player1.correctAnswers / gameState.player1.totalAnswers) * 100)}%\n\n` +
                 `Can you beat me? #FinMaster #FinancialLiteracy`;
    
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}

function shareOnWhatsApp() {
    const won = gameState.player1.score > gameState.player2.score;
    const text = `🎯 Quiz Rush - FinMaster\n\n` +
                 `${won ? '🏆 I won!' : 'Game Complete!'}\n` +
                 `Score: ${gameState.player1.score} points\n` +
                 `Accuracy: ${Math.round((gameState.player1.correctAnswers / gameState.player1.totalAnswers) * 100)}%\n\n` +
                 `Challenge me at FinMaster!`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyResults() {
    const text = `Quiz Rush Results\n\n` +
                 `${gameState.player1.username}: ${gameState.player1.score} points\n` +
                 `${gameState.player2.username}: ${gameState.player2.score} points\n\n` +
                 `Play at FinMaster!`;
    
    navigator.clipboard.writeText(text);
    showToast('Results copied!', 'success');
}

// Leaderboard
async function showLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/quizrush/leaderboard`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const leaderboard = await response.json();
        
        const listContainer = document.getElementById('leaderboard-list');
        listContainer.innerHTML = '';
        
        if (leaderboard.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No games played yet!</p>';
        } else {
            leaderboard.forEach((entry, index) => {
                const div = document.createElement('div');
                div.className = 'leaderboard-entry';
                
                const rankClass = index < 3 ? `rank-${index + 1}` : '';
                const rankDisplay = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
                
                div.innerHTML = `
                    <div class="rank ${rankClass}">${rankDisplay}</div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 5px; color: #333;">${entry.username}</h4>
                        <p style="color: #666; font-size: 14px;">Accuracy: ${entry.accuracy}%</p>
                    </div>
                    <div class="score-display">${entry.score}</div>
                `;
                
                listContainer.appendChild(div);
            });
        }
        
        document.getElementById('leaderboard-modal').classList.add('active');
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showToast('Failed to load leaderboard', 'error');
    }
}

function hideLeaderboard() {
    document.getElementById('leaderboard-modal').classList.remove('active');
}

function resetGame() {
    clearInterval(gameState.timerInterval);
    gameState = {
        mode: null,
        gameId: null,
        roomCode: null,
        isHost: false,
        player1: { username: gameState.player1.username, avatar: gameState.player1.avatar, score: 0, correctAnswers: 0, totalAnswers: 0 },
        player2: { username: '', avatar: '', score: 0, correctAnswers: 0, totalAnswers: 0 },
        questions: [],
        currentQuestionIndex: 0,
        timeLeft: 30,
        timerInterval: null,
        lives: 3,
        comboCount: 0,
        powerupsUsed: { time: false, fifty: false, skip: false },
        isAnswering: false,
        questionStartTime: null
    };
    
    // Reset power-ups
    document.querySelectorAll('.powerup-btn').forEach(btn => btn.disabled = false);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
