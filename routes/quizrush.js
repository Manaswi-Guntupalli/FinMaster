const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const MultiplayerGame = require('../models/MultiplayerGame');
const authMiddleware = require('../middleware/auth');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

// Generate unique room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create multiplayer room
router.post('/create-room', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        // Generate unique room code
        let roomCode;
        let isUnique = false;
        while (!isUnique) {
            roomCode = generateRoomCode();
            const existing = await MultiplayerGame.findOne({ roomCode, status: { $ne: 'finished' } });
            if (!existing) isUnique = true;
        }
        
        // Create game room
        const game = new MultiplayerGame({
            roomCode,
            gameMode: req.body.gameMode || 'quiz-rush',
            player1: {
                userId: user._id,
                username: user.username,
                avatar: user.profilePicture || null
            },
            status: 'waiting'
        });
        
        await game.save();
        
        // Generate QR code with hotspot IP for phone access
        const joinUrl = `http://10.74.138.197:3000/join.html?room=${roomCode}`;
        const qrCodeData = await QRCode.toDataURL(joinUrl);
        
        res.json({
            roomCode,
            gameId: game._id,
            qrCode: qrCodeData,
            joinUrl
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Failed to create room' });
    }
});

// Join multiplayer room
router.post('/join-room', authMiddleware, async (req, res) => {
    try {
        const { roomCode } = req.body;
        const user = await User.findById(req.userId);
        
        const game = await MultiplayerGame.findOne({ roomCode, status: 'waiting' });
        
        if (!game) {
            return res.status(404).json({ message: 'Room not found or already started' });
        }
        
        if (game.player1.userId.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'You cannot join your own room' });
        }
        
        // Add player 2
        game.player2 = {
            userId: user._id,
            username: user.username,
            avatar: user.profilePicture || null
        };
        game.status = 'ready';
        
        await game.save();
        
        res.json({
            gameId: game._id,
            player1: game.player1.username,
            player2: game.player2.username
        });
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ message: 'Failed to join room' });
    }
});
// Join multiplayer room as GUEST (no authentication required)
router.post('/join-room-guest', async (req, res) => {
    try {
        const { roomCode, playerName } = req.body;
        
        if (!playerName || !roomCode) {
            return res.status(400).json({ message: 'Room code and player name are required' });
        }
        
        const game = await MultiplayerGame.findOne({ roomCode, status: 'waiting' });
        
        if (!game) {
            return res.status(404).json({ message: 'Room not found or already started' });
        }
        
        // Add player 2 as guest
        game.player2 = {
            userId: null, // Guest has no user ID
            username: playerName,
            avatar: null
        };
        game.status = 'ready';
        
        await game.save();
        
        res.json({
            gameId: game._id,
            player1: game.player1.username,
            player2: game.player2.username
        });
    } catch (error) {
        console.error('Error joining room as guest:', error);
        res.status(500).json({ message: 'Failed to join room' });
    }
});
// Get game questions (called when game starts)
router.post('/start-game/:gameId', async (req, res) => {
    try {
        console.log('Start game called for:', req.params.gameId);
        
        const game = await MultiplayerGame.findById(req.params.gameId);
        
        if (!game) {
            console.log('Game not found:', req.params.gameId);
            return res.status(404).json({ message: 'Game not found' });
        }
        
        console.log('Game found:', game.roomCode, 'Status:', game.status);
        
        let questionsForClient;
        
        // If questions already exist (host already started), return those
        if (game.questions && game.questions.length > 0) {
            console.log('Questions already exist, returning stored questions');
            // Fetch the full question details
            const questionIds = game.questions.map(q => q.questionId);
            const questions = await Question.find({ _id: { $in: questionIds } });
            
            // Return questions in the same order as stored
            questionsForClient = game.questions.map(storedQ => {
                const fullQ = questions.find(q => q._id.toString() === storedQ.questionId);
                return {
                    questionId: storedQ.questionId,
                    question: fullQ.question,
                    options: fullQ.options,
                    category: storedQ.category
                };
            });
        } else {
            console.log('Generating new questions...');
            // First time - generate new questions
            const questions = await Question.aggregate([
                { $match: { levelNumber: { $lte: 5 } } }, // Easy to medium questions
                { $sample: { size: 10 } }
            ]);
            
            console.log('Found', questions.length, 'questions');
            
            if (questions.length === 0) {
                return res.status(500).json({ message: 'No questions available in database' });
            }
            
            // Store questions in game
            game.questions = questions.map(q => ({
                questionId: q._id.toString(),
                category: q.category,
                difficulty: q.difficulty,
                correctAnswer: q.correctAnswer
            }));
            game.status = 'playing';
            game.startTime = new Date();
            
            await game.save();
            console.log('Questions saved to game');
            
            // Send questions without correct answers
            questionsForClient = questions.map(q => ({
                questionId: q._id.toString(),
                question: q.question,
                options: q.options,
                category: q.category
            }));
        }
        
        console.log('Sending', questionsForClient.length, 'questions to client');
        
        // Also send player information for multiplayer setup
        const gameData = {
            questions: questionsForClient,
            player1: {
                userId: game.player1.userId,
                username: game.player1.username,
                avatar: game.player1.avatar
            },
            player2: {
                userId: game.player2.userId,
                username: game.player2.username,
                avatar: game.player2.avatar
            },
            roomCode: game.roomCode
        };
        
        res.json(gameData);
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ message: 'Failed to start game', error: error.message });
    }
});

// Submit answer
router.post('/submit-answer', async (req, res) => {
    try {
        const { gameId, questionId, selectedAnswer, timeTaken, isGuest, playerName } = req.body;
        const game = await MultiplayerGame.findById(gameId);
        
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        
        // Determine which player is submitting
        let isPlayer1;
        if (isGuest) {
            // Guest is always player 2
            isPlayer1 = false;
        } else {
            // Extract token from headers if present
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ message: 'No authorization header' });
            }
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            isPlayer1 = game.player1.userId.toString() === decoded.userId;
        }
        
        const player = isPlayer1 ? game.player1 : game.player2;
        
        // Find the question
        const questionData = game.questions.find(q => q.questionId === questionId);
        const isCorrect = questionData && questionData.correctAnswer === selectedAnswer;
        
        // Calculate points
        let pointsEarned = 0;
        if (isCorrect) {
            const timeBonus = timeTaken < 10 ? 50 : 0;
            const comboMultiplier = 1 + (player.correctAnswers * 0.1);
            pointsEarned = Math.floor((100 * comboMultiplier) + timeBonus);
            player.correctAnswers++;
            player.score += pointsEarned;
        }
        
        // Record answer
        player.answers.push({
            questionId,
            selectedAnswer,
            isCorrect,
            timeTaken,
            pointsEarned
        });
        player.totalAnswers++;
        
        await game.save();
        
        res.json({
            correct: isCorrect,
            correctAnswer: questionData.correctAnswer,
            pointsEarned,
            newScore: player.score,
            comboCount: player.correctAnswers
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ message: 'Failed to submit answer' });
    }
});

// End game and calculate winner
router.post('/end-game/:gameId', async (req, res) => {
    try {
        const game = await MultiplayerGame.findById(req.params.gameId);
        
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        
        game.status = 'finished';
        game.endTime = new Date();
        
        // Determine winner
        if (game.player1.score > game.player2.score) {
            game.winnerId = game.player1.userId;
        } else if (game.player2.score > game.player1.score) {
            game.winnerId = game.player2.userId;
        }
        
        // Award points to user accounts (skip guests)
        const bonusPoints = 50; // Participation bonus
        const winnerBonus = 100;
        
        // Always award points to player1 (host is always authenticated)
        await User.findByIdAndUpdate(game.player1.userId, {
            $inc: { points: bonusPoints + (game.winnerId?.toString() === game.player1.userId.toString() ? winnerBonus : 0) }
        });
        
        // Only award points to player2 if they're not a guest
        if (game.player2.userId) {
            await User.findByIdAndUpdate(game.player2.userId, {
                $inc: { points: bonusPoints + (game.winnerId?.toString() === game.player2.userId.toString() ? winnerBonus : 0) }
            });
        }
        
        await game.save();
        
        res.json({
            winner: game.winnerId ? (game.winnerId.toString() === game.player1.userId.toString() ? 'player1' : 'player2') : 'tie',
            player1Score: game.player1.score,
            player2Score: game.player2.score,
            player1Stats: {
                correct: game.player1.correctAnswers,
                total: game.player1.totalAnswers,
                accuracy: game.player1.totalAnswers > 0 ? Math.round((game.player1.correctAnswers / game.player1.totalAnswers) * 100) : 0
            },
            player2Stats: {
                correct: game.player2.correctAnswers,
                total: game.player2.totalAnswers,
                accuracy: game.player2.totalAnswers > 0 ? Math.round((game.player2.correctAnswers / game.player2.totalAnswers) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Error ending game:', error);
        res.status(500).json({ message: 'Failed to end game' });
    }
});

// Get game status (for polling)
router.get('/game-status/:gameId', authMiddleware, async (req, res) => {
    try {
        const game = await MultiplayerGame.findById(req.params.gameId);
        
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        
        res.json({
            status: game.status,
            player1: {
                username: game.player1.username,
                avatar: game.player1.avatar,
                score: game.player1.score,
                correctAnswers: game.player1.correctAnswers
            },
            player2: game.player2.userId ? {
                username: game.player2.username,
                avatar: game.player2.avatar,
                score: game.player2.score,
                correctAnswers: game.player2.correctAnswers
            } : null
        });
    } catch (error) {
        console.error('Error getting game status:', error);
        res.status(500).json({ message: 'Failed to get game status' });
    }
});

// Leaderboard - Top multiplayer scores
router.get('/leaderboard', authMiddleware, async (req, res) => {
    try {
        const games = await MultiplayerGame.find({ status: 'finished' })
            .sort({ 'player1.score': -1 })
            .limit(50)
            .populate('player1.userId', 'username profilePicture')
            .populate('player2.userId', 'username profilePicture');
        
        const leaderboard = [];
        games.forEach(game => {
            if (game.player1.score > 0) {
                leaderboard.push({
                    username: game.player1.username,
                    avatar: game.player1.avatar,
                    score: game.player1.score,
                    accuracy: game.player1.totalAnswers > 0 ? Math.round((game.player1.correctAnswers / game.player1.totalAnswers) * 100) : 0,
                    date: game.endTime || game.createdAt
                });
            }
            if (game.player2.userId && game.player2.score > 0) {
                leaderboard.push({
                    username: game.player2.username,
                    avatar: game.player2.avatar,
                    score: game.player2.score,
                    accuracy: game.player2.totalAnswers > 0 ? Math.round((game.player2.correctAnswers / game.player2.totalAnswers) * 100) : 0,
                    date: game.endTime || game.createdAt
                });
            }
        });
        
        // Sort by score and limit to top 20
        leaderboard.sort((a, b) => b.score - a.score);
        
        res.json(leaderboard.slice(0, 20));
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ message: 'Failed to get leaderboard' });
    }
});

module.exports = router;
