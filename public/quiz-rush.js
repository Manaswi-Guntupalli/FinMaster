const API_URL = `${window.location.origin}/api`;
let authToken = localStorage.getItem('finmaster_token');
let isGuest = false;
let socket = null;

let gameState = {
    mode: null,
    gameId: null,
    roomCode: null,
    isHost: false,
    isBotMatch: false,
    botProfile: null,
    player1: { username: '', avatar: '', score: 0, correctAnswers: 0, totalAnswers: 0, averageTime: 0 },
    player2: { username: '', avatar: '', score: 0, correctAnswers: 0, totalAnswers: 0, averageTime: 0 },
    questions: [],
    currentQuestionIndex: 0,
    timeLeft: 30,
    timerInterval: null,
    lives: 3,
    comboCount: 0,
    powerupsUsed: { time: false, fifty: true, skip: false },
    isAnswering: false,
    questionStartTime: null,
    lastBotStatus: ''
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    loadUserProfile();
    connectSocket();
});

function checkAuth() {
    const guestName = sessionStorage.getItem('guestName');
    const gameId = sessionStorage.getItem('gameId');
    const roomCode = sessionStorage.getItem('roomCode');

    if (guestName && gameId && roomCode) {
        isGuest = true;
        gameState.mode = 'multiplayer';
        gameState.isHost = false;
        gameState.gameId = gameId;
        gameState.roomCode = roomCode;
        gameState.player2.username = guestName;

        setTimeout(() => {
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

    if (!authToken) {
        window.location.href = '/index.html';
    }
}

async function loadUserProfile() {
    if (isGuest) {
        gameState.player2.username = sessionStorage.getItem('guestName');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
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
        if (isGuest && gameState.roomCode) {
            socket.emit('join-room', {
                roomCode: gameState.roomCode,
                userId: sessionStorage.getItem('guestName')
            });
        }
    });

    socket.on('player-joined', (data) => {
        if (gameState.mode === 'multiplayer' && gameState.isHost) {
            gameState.player2 = {
                ...gameState.player2,
                ...data.player2,
                score: 0,
                correctAnswers: 0,
                totalAnswers: 0,
                averageTime: 0
            };
            updateWaitingRoom();

            if (data.status === 'ready') {
                showToast('Player 2 joined! Starting game...', 'success');
                setTimeout(() => startMultiplayerGame(), 1800);
            }
        }
    });

    socket.on('start-game', async () => {
        if (!gameState.isHost) {
            try {
                const response = await fetch(`${API_URL}/quizrush/start-game/${gameState.gameId}`, {
                    method: 'POST'
                });
                const data = await response.json();
                hydrateGameFromPayload(data, false);
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
        if (gameState.mode !== 'multiplayer') {
            return;
        }

        if (data.playerNum === 1) {
            gameState.player1.score = data.score;
            if (data.isCorrect) {
                gameState.player1.correctAnswers += 1;
            }
            gameState.player1.totalAnswers += 1;
        } else {
            gameState.player2.score = data.score;
            if (data.isCorrect) {
                gameState.player2.correctAnswers += 1;
            }
            gameState.player2.totalAnswers += 1;
        }

        updateScoreDisplay();
        if (data.isCorrect) {
            showToast('Opponent answered correctly!', 'success');
        }
    });

    socket.on('player-eliminated', () => {
        showToast('Opponent eliminated! You win!', 'success');
        setTimeout(() => endGame(), 1600);
    });

    socket.on('show-results', (results) => {
        showResults(results);
    });
}

function setupEventListeners() {
    document.getElementById('single-player-btn').addEventListener('click', startSinglePlayer);
    document.getElementById('multiplayer-btn').addEventListener('click', createMultiplayerRoom);
    document.getElementById('show-leaderboard').addEventListener('click', showLeaderboard);

    document.getElementById('back-from-waiting').addEventListener('click', () => showScreen('mode-selection'));
    document.getElementById('copy-room-link').addEventListener('click', copyRoomLink);

    document.querySelectorAll('.option-btn').forEach(button => {
        button.addEventListener('click', () => selectAnswer(parseInt(button.dataset.index, 10)));
    });

    document.getElementById('powerup-time')?.addEventListener('click', () => usePowerup('time'));
    document.getElementById('powerup-fifty')?.addEventListener('click', () => usePowerup('fifty'));
    document.getElementById('powerup-skip')?.addEventListener('click', () => usePowerup('skip'));

    document.getElementById('play-again-btn').addEventListener('click', () => {
        resetGame();
        showScreen('mode-selection');
    });
    document.getElementById('view-leaderboard-result').addEventListener('click', showLeaderboard);
    document.getElementById('back-home-result').addEventListener('click', () => {
        window.location.href = '/index.html';
    });

    document.getElementById('share-twitter').addEventListener('click', shareOnTwitter);
    document.getElementById('share-whatsapp').addEventListener('click', shareOnWhatsApp);
    document.getElementById('share-copy').addEventListener('click', copyResults);

    document.getElementById('close-leaderboard').addEventListener('click', hideLeaderboard);
    document.getElementById('close-leaderboard-btn').addEventListener('click', hideLeaderboard);

    document.getElementById('back-to-home').addEventListener('click', () => {
        window.location.href = '/index.html';
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function hydrateGameFromPayload(data, isBotMatch) {
    gameState.isBotMatch = isBotMatch;
    gameState.questions = data.questions || [];
    gameState.botProfile = data.botProfile || null;

    if (data.gameId) {
        gameState.gameId = data.gameId;
    }
    if (data.roomCode) {
        gameState.roomCode = data.roomCode;
    }
    if (data.player1) {
        gameState.player1 = {
            username: data.player1.username,
            avatar: data.player1.avatar,
            score: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            averageTime: data.player1.averageTime || 0
        };
    }
    if (data.player2) {
        gameState.player2 = {
            username: data.player2.username,
            avatar: data.player2.avatar,
            score: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            averageTime: data.player2.averageTime || 0
        };
        updateOpponentStatus(data.player2.statusMessage || (isBotMatch ? 'Adaptive AI is calibrating...' : 'Ready'));
    }
}

async function startSinglePlayer() {
    gameState.mode = 'single';
    gameState.isHost = false;
    gameState.isBotMatch = true;
    document.getElementById('powerups-container').style.display = 'flex';
    document.getElementById('powerup-fifty').disabled = true;

    try {
        const response = await fetch(`${API_URL}/quizrush/start-ai-match`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ botMode: 'adaptive' })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to start AI match');
        }

        hydrateGameFromPayload(data, true);
        showToast('Adaptive AI duel ready. It will match your pace.', 'success');
        showScreen('game-screen');
        initializeGame();
        loadQuestion();
    } catch (error) {
        console.error('Error starting AI match:', error);
        showToast(error.message || 'Failed to start AI match', 'error');
    }
}

async function createMultiplayerRoom() {
    gameState.mode = 'multiplayer';
    gameState.isHost = true;
    gameState.isBotMatch = false;

    try {
        const response = await fetch(`${API_URL}/quizrush/create-room`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gameMode: 'quiz-rush' })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create room');
        }

        gameState.roomCode = data.roomCode;
        gameState.gameId = data.gameId;

        document.getElementById('qr-code-img').src = data.qrCode;
        document.getElementById('room-code-display').textContent = data.roomCode;
        document.getElementById('p1-name-waiting').textContent = gameState.player1.username;

        if (gameState.player1.avatar) {
            document.getElementById('p1-avatar-waiting').src = gameState.player1.avatar;
            document.getElementById('p1-avatar-waiting').style.display = 'block';
        }

        socket.emit('join-room', { roomCode: data.roomCode, userId: gameState.player1.username });
        showScreen('waiting-room');
    } catch (error) {
        console.error('Error creating room:', error);
        showToast(error.message || 'Failed to create room', 'error');
    }
}

function updateWaitingRoom() {
    const slot = document.getElementById('p2-slot-waiting');
    slot.classList.remove('empty');
    slot.classList.add('filled');
    slot.innerHTML = `
        <img class="player-avatar" src="${gameState.player2.avatar || ''}" alt="" style="${gameState.player2.avatar ? '' : 'display: none'}">
        <div class="player-name">${gameState.player2.username}</div>
        <div class="status-badge ready">Ready</div>
    `;
}

async function startMultiplayerGame() {
    try {
        const response = await fetch(`${API_URL}/quizrush/start-game/${gameState.gameId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to start multiplayer game');
        }

        hydrateGameFromPayload(data, false);
        socket.emit('game-started', { roomCode: gameState.roomCode });
        showScreen('game-screen');
        initializeGame();
        loadQuestion();
    } catch (error) {
        console.error('Error starting game:', error);
        showToast(error.message || 'Failed to start game', 'error');
    }
}

function copyRoomLink() {
    const link = `${window.location.origin}/join.html?room=${gameState.roomCode}`;
    navigator.clipboard.writeText(link);
    showToast('Room link copied!', 'success');
}

function initializeGame() {
    gameState.currentQuestionIndex = 0;
    gameState.player1.score = 0;
    gameState.player1.correctAnswers = 0;
    gameState.player1.totalAnswers = 0;
    gameState.player1.averageTime = 0;
    gameState.player2.score = 0;
    gameState.player2.correctAnswers = 0;
    gameState.player2.totalAnswers = 0;
    gameState.player2.averageTime = 0;
    gameState.lives = 3;
    gameState.comboCount = 0;
    gameState.powerupsUsed = { time: false, fifty: true, skip: false };
    gameState.lastBotStatus = gameState.isBotMatch ? 'Adaptive AI is calibrating...' : '';
    updateUI();
}

function updateUI() {
    document.getElementById('p1-name').textContent = gameState.player1.username;
    document.getElementById('p2-name').textContent = gameState.player2.username;

    setAvatar('p1-avatar', gameState.player1.avatar);
    setAvatar('p2-avatar', gameState.player2.avatar);
    updateOpponentStatus(gameState.lastBotStatus || (gameState.isBotMatch ? 'Adaptive AI active' : 'Ready'));
    updateScoreDisplay();
}

function setAvatar(elementId, avatar) {
    const element = document.getElementById(elementId);
    if (!avatar) {
        element.style.display = 'none';
        return;
    }

    element.src = avatar;
    element.style.display = 'block';
}

function updateOpponentStatus(message) {
    const status = document.getElementById('p2-status');
    if (!status) {
        return;
    }

    status.textContent = message || (gameState.isBotMatch ? 'Adaptive AI active' : 'Ready');
}

function updateScoreDisplay() {
    document.getElementById('p1-score').textContent = gameState.player1.score;
    document.getElementById('p2-score').textContent = gameState.player2.score;
    document.getElementById('p1-combo').textContent = `×${Math.floor(gameState.comboCount) + 1}`;
    document.getElementById('p2-combo').textContent = `×${Math.max(1, gameState.player2.correctAnswers)}`;
}

function loadQuestion() {
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
        endGame();
        return;
    }

    const question = gameState.questions[gameState.currentQuestionIndex];
    if (!question) {
        showToast('Error loading question', 'error');
        return;
    }

    document.getElementById('question-counter').textContent = `Question ${gameState.currentQuestionIndex + 1}/${gameState.questions.length}`;
    document.getElementById('category-badge').textContent = `${question.category || 'Finance'} • ${question.difficulty || 'medium'}`;
    document.getElementById('question-text').textContent = question.question;

    document.querySelectorAll('.option-btn').forEach((button, index) => {
        button.textContent = question.options[index];
        button.disabled = false;
        button.className = 'option-btn';
        button.blur();
    });

    gameState.timeLeft = 30;
    gameState.questionStartTime = Date.now();
    gameState.isAnswering = false;
    startTimer();
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    updateTimerDisplay();

    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft -= 1;
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

    if (gameState.timeLeft <= 5) {
        circle.style.stroke = '#ff6350';
    } else if (gameState.timeLeft <= 10) {
        circle.style.stroke = '#ffed4e';
    } else {
        circle.style.stroke = '#ffd700';
    }
}

async function selectAnswer(selectedIndex) {
    if (gameState.isAnswering) {
        return;
    }

    gameState.isAnswering = true;
    clearInterval(gameState.timerInterval);
    const timeTaken = Math.floor((Date.now() - gameState.questionStartTime) / 1000);
    document.querySelectorAll('.option-btn').forEach(button => {
        button.disabled = true;
    });

    if (gameState.mode === 'single') {
        await submitSinglePlayerAnswer(selectedIndex, timeTaken);
    } else {
        await submitMultiplayerAnswer(selectedIndex, timeTaken);
    }
}

async function submitSinglePlayerAnswer(selectedIndex, timeTaken) {
    const question = gameState.questions[gameState.currentQuestionIndex];

    try {
        const response = await fetch(`${API_URL}/quizrush/submit-answer`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameId: gameState.gameId,
                questionId: question.questionId,
                selectedAnswer: selectedIndex,
                timeTaken,
                isGuest: false
            })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit answer');
        }

        showAnswerFeedback(selectedIndex, result.correctAnswer, result.correct);
        gameState.player1.totalAnswers += 1;
        gameState.player1.averageTime = result.averageTime || gameState.player1.averageTime;

        if (result.correct) {
            gameState.comboCount = result.comboCount;
            gameState.player1.correctAnswers += 1;
            gameState.player1.score = result.newScore;
            showToast(`Correct! +${result.pointsEarned} points`, 'success');
        } else {
            gameState.lives -= 1;
            gameState.comboCount = 0;
            updateLivesDisplay();
            showToast('Wrong answer! -1 life', 'error');
            if (gameState.lives <= 0) {
                setTimeout(() => endGame(), 1400);
                return;
            }
        }

        updateScoreDisplay();

        if (result.botTurn) {
            updateOpponentStatus(`AI thinking... ${Math.round(result.botTurn.delayMs / 1000)}s`);
            const animationDelay = Math.min(result.botTurn.delayMs, 5000);
            setTimeout(() => {
                applyBotTurn(result.botTurn);
                setTimeout(() => nextQuestion(), 1200);
            }, animationDelay);
        } else {
            setTimeout(() => nextQuestion(), 1200);
        }
    } catch (error) {
        console.error('Error submitting single-player answer:', error);
        gameState.isAnswering = false;
        document.querySelectorAll('.option-btn').forEach(button => {
            button.disabled = false;
            button.className = 'option-btn';
        });
        startTimer();
        showToast(error.message || 'Failed to submit answer', 'error');
    }
}

function applyBotTurn(botTurn) {
    gameState.player2.totalAnswers += 1;
    gameState.player2.averageTime = botTurn.averageTime || gameState.player2.averageTime;
    if (botTurn.isCorrect) {
        gameState.player2.correctAnswers += 1;
        gameState.player2.score += botTurn.pointsEarned;
        showToast(`${gameState.player2.username}: ${botTurn.reaction} +${botTurn.pointsEarned} points`, 'success');
    } else {
        showToast(`${gameState.player2.username}: ${botTurn.reaction}`, 'info');
    }
    gameState.lastBotStatus = botTurn.statusMessage;
    updateOpponentStatus(botTurn.statusMessage);
    updateScoreDisplay();
}

async function submitMultiplayerAnswer(selectedIndex, timeTaken) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken && !isGuest) {
            headers.Authorization = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_URL}/quizrush/submit-answer`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                gameId: gameState.gameId,
                questionId: gameState.questions[gameState.currentQuestionIndex].questionId,
                selectedAnswer: selectedIndex,
                timeTaken,
                isGuest,
                playerName: isGuest ? sessionStorage.getItem('guestName') : null
            })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit answer');
        }

        showAnswerFeedback(selectedIndex, result.correctAnswer, result.correct);

        const currentPlayer = isGuest ? gameState.player2 : gameState.player1;
        currentPlayer.totalAnswers += 1;
        currentPlayer.averageTime = result.averageTime || currentPlayer.averageTime;

        if (result.correct) {
            gameState.comboCount = result.comboCount;
            currentPlayer.score = result.newScore;
            currentPlayer.correctAnswers += 1;
            showToast(`Correct! +${result.pointsEarned} points`, 'success');
        } else {
            gameState.lives -= 1;
            gameState.comboCount = 0;
            updateLivesDisplay();
            showToast('Wrong answer! -1 life', 'error');

            if (gameState.lives <= 0) {
                socket.emit('player-eliminated', {
                    roomCode: gameState.roomCode,
                    playerNum: isGuest ? 2 : 1,
                    reason: 'lives-lost'
                });
                setTimeout(() => endGame(), 1400);
                return;
            }
        }

        updateScoreDisplay();

        socket.emit('answer-submitted', {
            roomCode: gameState.roomCode,
            playerNum: isGuest ? 2 : 1,
            questionIndex: gameState.currentQuestionIndex,
            isCorrect: result.correct,
            score: result.newScore,
            timeTaken,
            pointsEarned: result.pointsEarned
        });

        setTimeout(() => nextQuestion(), 1500);
    } catch (error) {
        console.error('Error submitting multiplayer answer:', error);
        gameState.isAnswering = false;
        document.querySelectorAll('.option-btn').forEach(button => {
            button.disabled = false;
            button.className = 'option-btn';
        });
        startTimer();
        showToast(error.message || 'Failed to submit answer', 'error');
    }
}

function showAnswerFeedback(selectedIndex, correctAnswer, isCorrect) {
    const buttons = document.querySelectorAll('.option-btn');
    if (buttons[correctAnswer]) {
        buttons[correctAnswer].classList.add('correct');
    }
    if (!isCorrect && selectedIndex >= 0 && buttons[selectedIndex]) {
        buttons[selectedIndex].classList.add('wrong');
    }
}

async function handleTimeout() {
    showToast('Time is up!', 'error');
    if (gameState.mode === 'single') {
        await submitSinglePlayerAnswer(-1, 30);
    } else {
        await submitMultiplayerAnswer(-1, 30);
    }
}

function nextQuestion() {
    gameState.currentQuestionIndex += 1;
    loadQuestion();
}

function updateLivesDisplay() {
    document.querySelectorAll('.heart').forEach((heart, index) => {
        if (index >= gameState.lives) {
            heart.classList.add('lost');
        } else {
            heart.classList.remove('lost');
        }
    });
}

function usePowerup(type) {
    if (gameState.powerupsUsed[type]) {
        return;
    }

    gameState.powerupsUsed[type] = true;
    document.getElementById(`powerup-${type}`).disabled = true;

    if (type === 'time') {
        gameState.timeLeft = Math.min(gameState.timeLeft + 15, 30);
        updateTimerDisplay();
        showToast('+15 seconds!', 'success');
        return;
    }

    if (type === 'skip') {
        clearInterval(gameState.timerInterval);
        showToast('Question skipped!', 'success');
        setTimeout(() => nextQuestion(), 700);
        return;
    }

    showToast('50/50 is disabled in adaptive AI mode to preserve the challenge.', 'info');
}

async function endGame() {
    clearInterval(gameState.timerInterval);

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken && !isGuest) {
            headers.Authorization = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_URL}/quizrush/end-game/${gameState.gameId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                isGuest,
                playerName: isGuest ? sessionStorage.getItem('guestName') : null
            })
        });
        const results = await response.json();

        if (!response.ok) {
            throw new Error(results.message || 'Failed to end game');
        }

        if (gameState.mode === 'multiplayer') {
            socket.emit('game-ended', { roomCode: gameState.roomCode, results });
        }
        showResults(results);
    } catch (error) {
        console.error('Error ending game:', error);
        showToast(error.message || 'Failed to finish the match', 'error');
    }
}

function showResults(results) {
    const won = results.winner === 'player1';
    document.getElementById('result-title').textContent = won ? 'Victory!' : results.winner === 'tie' ? 'Tie Game!' : 'Defeat';
    document.getElementById('result-subtitle').textContent = won
        ? 'You outplayed the challenge.'
        : results.winner === 'tie'
            ? 'That was incredibly close.'
            : 'The AI edged this round.';

    setAvatar('p1-result-avatar', gameState.player1.avatar);
    setAvatar('p2-result-avatar', gameState.player2.avatar);

    document.getElementById('p1-result-name').textContent = gameState.player1.username;
    document.getElementById('p1-final-score').textContent = results.player1Score;
    document.getElementById('p1-correct').textContent = `${results.player1Stats.correct}/${results.player1Stats.total}`;
    document.getElementById('p1-accuracy').textContent = `${results.player1Stats.accuracy}%`;
    document.getElementById('p1-avg-time').textContent = `${results.player1Stats.averageTime || 0}s`;

    document.getElementById('p2-result-name').textContent = gameState.player2.username;
    document.getElementById('p2-final-score').textContent = results.player2Score;
    document.getElementById('p2-correct').textContent = `${results.player2Stats.correct}/${results.player2Stats.total}`;
    document.getElementById('p2-accuracy').textContent = `${results.player2Stats.accuracy}%`;
    document.getElementById('p2-avg-time').textContent = `${results.player2Stats.averageTime || 0}s`;

    showScreen('results-screen');
}

function shareOnTwitter() {
    const accuracy = gameState.player1.totalAnswers
        ? Math.round((gameState.player1.correctAnswers / gameState.player1.totalAnswers) * 100)
        : 0;
    const text = `I just played Quiz Rush on FinMaster. Score: ${gameState.player1.score} points. Accuracy: ${accuracy}%.`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}

function shareOnWhatsApp() {
    const accuracy = gameState.player1.totalAnswers
        ? Math.round((gameState.player1.correctAnswers / gameState.player1.totalAnswers) * 100)
        : 0;
    const text = `Quiz Rush on FinMaster. Score: ${gameState.player1.score}. Accuracy: ${accuracy}%. Can you beat me?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyResults() {
    const text = `${gameState.player1.username}: ${gameState.player1.score} points\n${gameState.player2.username}: ${gameState.player2.score} points`;
    navigator.clipboard.writeText(text);
    showToast('Results copied!', 'success');
}

async function showLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/quizrush/leaderboard`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const leaderboard = await response.json();

        if (!response.ok) {
            throw new Error(leaderboard.message || 'Failed to load leaderboard');
        }

        const container = document.getElementById('leaderboard-list');
        container.innerHTML = '';

        if (!leaderboard.length) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No games played yet.</p>';
        } else {
            leaderboard.forEach((entry, index) => {
                const row = document.createElement('div');
                row.className = 'leaderboard-entry';
                const rankDisplay = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
                row.innerHTML = `
                    <div class="rank">${rankDisplay}</div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 5px; color: #333;">${entry.username}</h4>
                        <p style="color: #666; font-size: 14px;">Accuracy: ${entry.accuracy}%</p>
                    </div>
                    <div class="score-display">${entry.score}</div>
                `;
                container.appendChild(row);
            });
        }

        document.getElementById('leaderboard-modal').classList.add('active');
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showToast(error.message || 'Failed to load leaderboard', 'error');
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
        isBotMatch: false,
        botProfile: null,
        player1: { username: gameState.player1.username, avatar: gameState.player1.avatar, score: 0, correctAnswers: 0, totalAnswers: 0, averageTime: 0 },
        player2: { username: '', avatar: '', score: 0, correctAnswers: 0, totalAnswers: 0, averageTime: 0 },
        questions: [],
        currentQuestionIndex: 0,
        timeLeft: 30,
        timerInterval: null,
        lives: 3,
        comboCount: 0,
        powerupsUsed: { time: false, fifty: true, skip: false },
        isAnswering: false,
        questionStartTime: null,
        lastBotStatus: ''
    };

    document.querySelectorAll('.powerup-btn').forEach(button => {
        button.disabled = false;
    });
    document.getElementById('powerup-fifty').disabled = true;
    updateLivesDisplay();
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}