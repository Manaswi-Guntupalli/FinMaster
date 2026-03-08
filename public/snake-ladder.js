// Snake & Ladder Game Logic
const API_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('finmaster_token');

// Game State
let gameState = {
    boardConfig: null,
    playerPosition: 0,
    computerPosition: 0,
    playerScore: 1000,
    computerScore: 1000,
    playerQuestionsCorrect: 0,
    playerQuestionsTotal: 0,
    computerQuestionsCorrect: 0,
    computerQuestionsTotal: 0,
    snakesHit: 0,
    laddersClimbed: 0,
    currentTurn: 'player',
    gameStartTime: null,
    isGameOver: false,
    currentQuestion: null,
    playerName: '',
    ageGroup: '18-24',
    currentDiceRoll: 0
};

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadBoardConfig();
    setupEventListeners();
    loadUserProfile();
});

function checkAuth() {
    if (!authToken) {
        window.location.href = '/index.html';
    }
}

async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const userData = await response.json();
        
        // Update player avatar in score panel
        if (userData.profilePicture) {
            document.getElementById('player-avatar-img').src = userData.profilePicture;
            document.getElementById('player-avatar-img').style.display = 'block';
            document.getElementById('player-avatar-default').style.display = 'none';
        }
        
        gameState.playerName = userData.username;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadBoardConfig() {
    try {
        const response = await fetch(`${API_URL}/snakegame/board-config`);
        gameState.boardConfig = await response.json();
        createBoard();
    } catch (error) {
        console.error('Error loading board config:', error);
        showToast('Failed to load game board', 'error');
    }
}

function createBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    // Create 100 squares (10x10 grid), numbered from bottom-left
    for (let row = 9; row >= 0; row--) {
        for (let col = 0; col < 10; col++) {
            let squareNum;
            // Zigzag pattern
            if (row % 2 === 1) {
                squareNum = (9 - row) * 10 + (9 - col) + 1;
            } else {
                squareNum = (9 - row) * 10 + col + 1;
            }
            
            const square = document.createElement('div');
            square.className = 'board-square';
            square.id = `square-${squareNum}`;
            square.setAttribute('data-square', squareNum);
            
            // Add special styling
            if (squareNum === 100) {
                square.classList.add('finish-square');
                square.innerHTML = `<div class="square-number">${squareNum}</div><div class="square-icon">🏆</div>`;
            } else if (gameState.boardConfig.checkpoints.includes(squareNum)) {
                square.classList.add('checkpoint-square');
                square.innerHTML = `<div class="square-number">${squareNum}</div><div class="square-icon">📚</div>`;
            } else if (gameState.boardConfig.snakes[squareNum]) {
                square.classList.add('snake-square');
                square.innerHTML = `<div class="square-number">${squareNum}</div><div class="square-icon">🐍</div>`;
            } else if (gameState.boardConfig.ladders[squareNum]) {
                square.classList.add('ladder-square');
                square.innerHTML = `<div class="square-number">${squareNum}</div><div class="square-icon">🪜</div>`;
            } else {
                square.innerHTML = `<div class="square-number">${squareNum}</div>`;
            }
            
            board.appendChild(square);
        }
    }
}

function setupEventListeners() {
    // Welcome modal
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('view-leaderboard-btn').addEventListener('click', () => showLeaderboard());
    
    // Game controls
    document.getElementById('roll-dice-btn').addEventListener('click', rollDice);
    
    // Navigation
    document.getElementById('back-to-home').addEventListener('click', () => {
        window.location.href = '/index.html';
    });
    
    // Result modal
    document.getElementById('play-again-btn').addEventListener('click', resetGame);
    document.getElementById('view-leaderboard-result-btn').addEventListener('click', () => showLeaderboard());
    document.getElementById('back-home-btn').addEventListener('click', () => {
        window.location.href = '/index.html';
    });
    
    // Share buttons
    document.getElementById('share-twitter').addEventListener('click', shareOnTwitter);
    document.getElementById('share-whatsapp').addEventListener('click', shareOnWhatsApp);
    document.getElementById('copy-result').addEventListener('click', copyResult);
    
    // Leaderboard
    document.getElementById('close-leaderboard').addEventListener('click', hideLeaderboard);
    document.getElementById('close-leaderboard-btn').addEventListener('click', hideLeaderboard);
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            loadLeaderboard(e.target.getAttribute('data-tab'));
        });
    });
}

function startGame() {
    // Get player details
    const nickname = document.getElementById('player-nickname').value.trim();
    gameState.playerName = nickname || gameState.playerName;
    gameState.ageGroup = document.getElementById('player-age').value;
    
    // Update display
    document.getElementById('player-name-display').textContent = gameState.playerName;
    
    // Hide welcome modal and show game
    document.getElementById('welcome-modal').classList.remove('active');
    document.getElementById('game-container').classList.remove('hidden');
    
    // Initialize game
    gameState.gameStartTime = Date.now();
    gameState.isGameOver = false;
    updateUI();
}

async function rollDice() {
    if (gameState.isGameOver || gameState.currentTurn !== 'player') return;
    
    // Disable roll button
    const rollBtn = document.getElementById('roll-dice-btn');
    rollBtn.disabled = true;
    
    // Animate dice
    const dice = document.getElementById('dice');
    dice.classList.add('rolling');
    
    // Roll dice (1-6)
    const diceValue = Math.floor(Math.random() * 6) + 1;
    gameState.currentDiceRoll = diceValue;
    
    setTimeout(() => {
        dice.classList.remove('rolling');
        dice.querySelector('.dice-face').textContent = diceValue;
        
        // Move player
        movePlayer(diceValue);
    }, 500);
}

async function movePlayer(steps) {
    const newPosition = Math.min(gameState.playerPosition + steps, 100);
    
    // Animate movement
    await animateMovement('player', gameState.playerPosition, newPosition);
    gameState.playerPosition = newPosition;
    
    // Check for snakes/ladders
    await checkSpecialSquare('player', newPosition);
    
    // Update UI
    updateUI();
    
    // Check if reached 100
    if (gameState.playerPosition >= 100) {
        endGame(true);
        return;
    }
    
    // Check if on checkpoint
    if (gameState.boardConfig.checkpoints.includes(gameState.playerPosition)) {
        gameState.playerScore += 25; // Checkpoint bonus
        await askQuestion('player');
    } else {
        // Computer's turn
        setTimeout(() => computerTurn(), 1500);
    }
}

async function animateMovement(player, from, to) {
    // Remove existing tokens
    document.querySelectorAll(`.player-token-${player}`).forEach(t => t.remove());
    
    // Add token to new position
    if (to > 0) {
        const square = document.getElementById(`square-${to}`);
        const token = document.createElement('div');
        token.className = `player-token player-token-${player}`;
        token.textContent = player === 'player' ? '👤' : '🤖';
        square.appendChild(token);
    }
    
    return new Promise(resolve => setTimeout(resolve, 300));
}

async function checkSpecialSquare(player, position) {
    const snakes = gameState.boardConfig.snakes;
    const ladders = gameState.boardConfig.ladders;
    
    if (snakes[position]) {
        // Hit a snake
        const newPos = snakes[position];
        showMessage(`${player === 'player' ? 'You' : 'Computer'} hit a snake! 🐍 Going down to ${newPos}`);
        
        if (player === 'player') {
            gameState.playerScore -= 20;
            gameState.snakesHit++;
        } else {
            gameState.computerScore -= 20;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        await animateMovement(player, position, newPos);
        
        if (player === 'player') {
            gameState.playerPosition = newPos;
        } else {
            gameState.computerPosition = newPos;
        }
    } else if (ladders[position]) {
        // Climbed a ladder
        const newPos = ladders[position];
        showMessage(`${player === 'player' ? 'You' : 'Computer'} found a ladder! 🪜 Climbing to ${newPos}`);
        
        if (player === 'player') {
            gameState.playerScore += 30;
            gameState.laddersClimbed++;
        } else {
            gameState.computerScore += 30;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        await animateMovement(player, position, newPos);
        
        if (player === 'player') {
            gameState.playerPosition = newPos;
        } else {
            gameState.computerPosition = newPos;
        }
    }
}

async function askQuestion(player) {
    try {
        const response = await fetch(`${API_URL}/snakegame/question`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const question = await response.json();
        
        gameState.currentQuestion = question;
        
        // Show question modal
        document.getElementById('question-category').textContent = question.category;
        document.getElementById('question-text').textContent = question.question;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.onclick = () => selectAnswer(index, player);
            optionsContainer.appendChild(btn);
        });
        
        document.getElementById('question-modal').classList.add('active');
    } catch (error) {
        console.error('Error loading question:', error);
        // Continue game even if question fails
        if (player === 'player') {
            setTimeout(() => computerTurn(), 500);
        } else {
            enablePlayerTurn();
        }
    }
}

async function selectAnswer(selectedIndex, player) {
    try {
        const response = await fetch(`${API_URL}/snakegame/check-answer`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                questionId: gameState.currentQuestion.questionId,
                selectedAnswer: selectedIndex
            })
        });
        
       const result = await response.json();
        
        // Update UI to show correct/wrong
        const options = document.querySelectorAll('.option-btn');
        options.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === result.correctAnswer) {
                btn.classList.add('correct');
            } else if (idx === selectedIndex && !result.correct) {
                btn.classList.add('wrong');
            }
        });
        
        // Update score and stats
        if (player === 'player') {
            gameState.playerQuestionsTotal++;
            if (result.correct) {
                gameState.playerQuestionsCorrect++;
                gameState.playerScore += 100;
                showToast('Correct! +100 points', 'success');
            } else {
                gameState.playerScore -= 50;
                showToast('Wrong! -50 points', 'error');
            }
        }
        
        // Close modal after delay
        setTimeout(() => {
            document.getElementById('question-modal').classList.remove('active');
            updateUI();
            
            if (player === 'player') {
                setTimeout(() => computerTurn(), 1000);
            } else {
                enablePlayerTurn();
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error checking answer:', error);
        document.getElementById('question-modal').classList.remove('active');
        
        if (player === 'player') {
            setTimeout(() => computerTurn(), 500);
        } else {
            enablePlayerTurn();
        }
    }
}

async function computerTurn() {
    gameState.currentTurn = 'computer';
    showMessage('Computer is rolling...');
    document.getElementById('turn-indicator').textContent = "Computer's Turn";
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Computer rolls dice
    const diceValue = Math.floor(Math.random() * 6) + 1;
    const dice = document.getElementById('dice');
    dice.querySelector('.dice-face').textContent = diceValue;
    
    showMessage(`Computer rolled ${diceValue}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Move computer
    const newPosition = Math.min(gameState.computerPosition + diceValue, 100);
    await animateMovement('computer', gameState.computerPosition, newPosition);
    gameState.computerPosition = newPosition;
    
    // Check for snakes/ladders
    await checkSpecialSquare('computer', newPosition);
    updateUI();
    
    // Check if computer won
    if (gameState.computerPosition >= 100) {
        endGame(false);
        return;
    }
    
    // Computer answers question at checkpoint
    if (gameState.boardConfig.checkpoints.includes(gameState.computerPosition)) {
        gameState.computerScore += 25;
        gameState.computerQuestionsTotal++;
        
        // Computer answers correctly 70% of the time
        if (Math.random() < 0.7) {
            gameState.computerQuestionsCorrect++;
            gameState.computerScore += 100;
            showMessage('Computer answered correctly! +100 points');
        } else {
            gameState.computerScore -= 50;
            showMessage('Computer answered incorrectly! -50 points');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    updateUI();
    enablePlayerTurn();
}

function enablePlayerTurn() {
    gameState.currentTurn = 'player';
    document.getElementById('turn-indicator').textContent = "Your Turn";
    document.getElementById('roll-dice-btn').disabled = false;
    showMessage('Your turn! Roll the dice');
}

function updateUI() {
    // Update positions
    document.getElementById('player-position').textContent = gameState.playerPosition;
    document.getElementById('computer-position').textContent = gameState.computerPosition;
    
    // Update scores
    document.getElementById('player-score').textContent = gameState.playerScore;
    document.getElementById('computer-score').textContent = gameState.computerScore;
    
    // Update questions
    document.getElementById('player-questions').textContent = 
        `${gameState.playerQuestionsCorrect}/${gameState.playerQuestionsTotal}`;
    document.getElementById('computer-questions').textContent = 
        `${gameState.computerQuestionsCorrect}/${gameState.computerQuestionsTotal}`;
}

function showMessage(message) {
    document.getElementById('game-message').textContent = message;
}

async function endGame(playerWon) {
    gameState.isGameOver = true;
    const timeTaken = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    
    // Calculate final scores
    const positionBonus = (gameState.playerPosition - gameState.computerPosition) * 10;
    const finalPlayerScore = gameState.playerScore + positionBonus + (playerWon ? 500 : 0);
    const finalComputerScore = gameState.computerScore - positionBonus + (playerWon ? 0 : 500);
    
    // Update result modal
    document.getElementById('result-title').textContent = playerWon ? '🎉 Victory!' : '😔 Game Over';
    document.getElementById('winner-name').textContent = playerWon ? 'You Won!' : 'Computer Won';
    document.getElementById('player-final-score').textContent = finalPlayerScore;
    document.getElementById('computer-final-score').textContent = finalComputerScore;
    document.getElementById('player-final-position').textContent = `Position: ${gameState.playerPosition}`;
    document.getElementById('computer-final-position').textContent = `Position: ${gameState.computerPosition}`;
    document.getElementById('player-final-questions').textContent = 
        `Questions: ${gameState.playerQuestionsCorrect}/${gameState.playerQuestionsTotal}`;
    document.getElementById('computer-final-questions').textContent = 
        `Questions: ${gameState.computerQuestionsCorrect}/${gameState.computerQuestionsTotal}`;
    
    // Update stats
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    document.getElementById('game-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('snakes-hit').textContent = gameState.snakesHit;
    document.getElementById('ladders-climbed').textContent = gameState.laddersClimbed;
    const accuracy = gameState.playerQuestionsTotal > 0 
        ? Math.round((gameState.playerQuestionsCorrect / gameState.playerQuestionsTotal) * 100)
        : 0;
    document.getElementById('accuracy-percent').textContent = `${accuracy}%`;
    
    // Save result to database
    await saveGameResult(finalPlayerScore, playerWon, timeTaken);
    
    // Show result modal
    document.getElementById('result-modal').classList.add('active');
}

async function saveGameResult(finalScore, wonGame, timeTaken) {
    try {
        await fetch(`${API_URL}/snakegame/save-result`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerName: gameState.playerName,
                ageGroup: gameState.ageGroup,
                finalScore: finalScore,
                questionsCorrect: gameState.playerQuestionsCorrect,
                questionsTotal: gameState.playerQuestionsTotal,
                wonGame: wonGame,
                playerPosition: gameState.playerPosition,
                computerPosition: gameState.computerPosition,
                computerScore: gameState.computerScore,
                timeTaken: timeTaken,
                snakesHit: gameState.snakesHit,
                laddersClimbed: gameState.laddersClimbed
            })
        });
    } catch (error) {
        console.error('Error saving game result:', error);
    }
}

function resetGame() {
    // Reset game state
    gameState = {
        ...gameState,
        playerPosition: 0,
        computerPosition: 0,
        playerScore: 1000,
        computerScore: 1000,
        playerQuestionsCorrect: 0,
        playerQuestionsTotal: 0,
        computerQuestionsCorrect: 0,
        computerQuestionsTotal: 0,
        snakesHit: 0,
        laddersClimbed: 0,
        currentTurn: 'player',
        gameStartTime: Date.now(),
        isGameOver: false
    };
    
    // Reset UI
    createBoard();
    updateUI();
    document.getElementById('dice').querySelector('.dice-face').textContent = '?';
    document.getElementById('roll-dice-btn').disabled = false;
    
    // Hide result modal, show game
    document.getElementById('result-modal').classList.remove('active');
    showMessage('Click "Roll Dice" to start your turn!');
}

async function showLeaderboard(type = 'all-time') {
    document.getElementById('leaderboard-modal').classList.add('active');
    await loadLeaderboard(type);
}

function hideLeaderboard() {
    document.getElementById('leaderboard-modal').classList.remove('active');
}

async function loadLeaderboard(type = 'all-time') {
    try {
        const response = await fetch(`${API_URL}/snakegame/leaderboard?type=${type}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const leaderboard = await response.json();
        
        const listContainer = document.getElementById('leaderboard-list');
        listContainer.innerHTML = '';
        
        if (leaderboard.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #6b7280;">No games played yet. Be the first!</p>';
            return;
        }
        
        leaderboard.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'leaderboard-entry';
            
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            
            const date = new Date(entry.playedAt).toLocaleDateString();
            const displayName = entry.playerName || entry.username;
            const winStatus = entry.wonGame ? '🏆' : '';
            
            div.innerHTML = `
                <div class="rank ${rankClass}">${rankEmoji || (index + 1)}</div>
                <div class="player-info">
                    <h4>${displayName} ${winStatus}</h4>
                    <p>${entry.questionsCorrect}/${entry.questionsTotal} correct • ${date}</p>
                </div>
                <div class="score-display">${entry.finalScore}</div>
            `;
            
            listContainer.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showToast('Failed to load leaderboard', 'error');
    }
}

function shareOnTwitter() {
    const finalScore = document.getElementById('player-final-score').textContent;
    const accuracy = document.getElementById('accuracy-percent').textContent;
    const won = document.getElementById('result-title').textContent.includes('Victory');
    
    const text = `I ${won ? 'won' : 'played'} FinMaster Snake & Ladder! 🎲\n\n` +
                 `Score: ${finalScore} points\n` +
                 `Accuracy: ${accuracy}\n` +
                 `Learned about budgeting, investing & more while racing to 100! 💰\n\n` +
                 `Can you beat my score? #FinancialLiteracy #FinMaster`;
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareOnWhatsApp() {
    const finalScore = document.getElementById('player-final-score').textContent;
    const accuracy = document.getElementById('accuracy-percent').textContent;
    const won = document.getElementById('result-title').textContent.includes('Victory');
    
    const text = `🎲 FinMaster Snake & Ladder\n\n` +
                 `${won ? '🏆 Victory!' : 'Game Complete!'}\n` +
                 `Score: ${finalScore} points\n` +
                 `Accuracy: ${accuracy}\n\n` +
                 `Learned financial literacy while having fun! Can you beat my score?`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function copyResult() {
    const finalScore = document.getElementById('player-final-score').textContent;
    const accuracy = document.getElementById('accuracy-percent').textContent;
    const won = document.getElementById('result-title').textContent.includes('Victory');
    const time = document.getElementById('game-time').textContent;
    
    const text = `FinMaster Snake & Ladder Results\n\n` +
                 `Result: ${won ? 'Victory! 🏆' : 'Game Complete'}\n` +
                 `Final Score: ${finalScore} points\n` +
                 `Accuracy: ${accuracy}\n` +
                 `Time: ${time}\n\n` +
                 `Play at FinMaster and learn financial literacy!`;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Result copied to clipboard!', 'success');
    });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
