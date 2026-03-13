const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const MultiplayerGame = require('../models/MultiplayerGame');
const authMiddleware = require('../middleware/auth');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const {
    buildAdaptiveQuestionSet,
    createBotProfile,
    simulateAdaptiveBotTurn,
    calculateAverageAnswerTime
} = require('../services/adaptiveEngine');
const { getDifficultyReward } = require('../services/rewardEngine');

function generateRoomCode(prefix = '') {
    return `${prefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

async function generateUniqueRoomCode(prefix = '') {
    let roomCode;
    let isUnique = false;

    while (!isUnique) {
        roomCode = generateRoomCode(prefix);
        const existing = await MultiplayerGame.findOne({ roomCode, status: { $ne: 'finished' } });
        if (!existing) {
            isUnique = true;
        }
    }

    return roomCode;
}

function serializeQuestion(question) {
    return {
        questionId: question._id ? question._id.toString() : question.questionId,
        question: question.question,
        options: question.options,
        category: question.category,
        topic: question.topic,
        difficulty: question.difficulty
    };
}

function serializeStoredQuestion(question) {
    return {
        questionId: question.questionId,
        question: question.question,
        options: question.options,
        category: question.category,
        topic: question.topic,
        difficulty: question.difficulty
    };
}

function calculatePoints(player, isCorrect, timeTaken, difficulty) {
    if (!isCorrect) {
        return 0;
    }

    const reward = getDifficultyReward(difficulty);
    const basePoints = reward.points * 5;
    const timeBonus = timeTaken < 10 ? 50 : 0;
    const comboMultiplier = 1 + ((player.correctAnswers || 0) * 0.1);
    return Math.floor((basePoints * comboMultiplier) + timeBonus);
}

async function resolvePlayerContext(game, req, isGuest) {
    if (isGuest) {
        return { isPlayer1: false, player: game.player2 };
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new Error('No authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isPlayer1 = game.player1.userId.toString() === decoded.userId;

    return {
        isPlayer1,
        player: isPlayer1 ? game.player1 : game.player2
    };
}

function buildPlayerResponse(player) {
    return {
        userId: player.userId,
        username: player.username,
        avatar: player.avatar,
        isBot: !!player.isBot,
        statusMessage: player.statusMessage,
        averageTime: player.averageTime || 0
    };
}

router.post('/create-room', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const roomCode = await generateUniqueRoomCode();

        const game = new MultiplayerGame({
            roomCode,
            gameMode: req.body.gameMode || 'quiz-rush',
            player1: {
                userId: user._id,
                username: user.username,
                avatar: user.profilePicture || null,
                isBot: false,
                statusMessage: 'Ready to host',
                averageTime: 0
            },
            status: 'waiting'
        });

        await game.save();

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

router.post('/start-ai-match', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const botMode = req.body.botMode || 'adaptive';
        const roomCode = await generateUniqueRoomCode('AI');
        const questionBank = await Question.find({ levelNumber: { $lte: 7 } });

        if (questionBank.length < 10) {
            return res.status(500).json({ message: 'Not enough questions available for Quiz Rush' });
        }

        const selectedQuestions = buildAdaptiveQuestionSet(questionBank, user, 10);
        const botProfile = createBotProfile(user, botMode);

        const game = new MultiplayerGame({
            roomCode,
            gameMode: 'quiz-rush',
            player1: {
                userId: user._id,
                username: user.username,
                avatar: user.profilePicture || null,
                isBot: false,
                statusMessage: 'Opening strong',
                averageTime: 0
            },
            player2: {
                userId: null,
                username: botProfile.displayName,
                avatar: null,
                isBot: true,
                statusMessage: 'Analyzing your pace',
                averageTime: 0
            },
            botProfile,
            questions: selectedQuestions.map(question => ({
                questionId: question._id.toString(),
                category: question.category,
                topic: question.topic,
                difficulty: question.difficulty,
                correctAnswer: question.correctAnswer,
                question: question.question,
                options: question.options
            })),
            status: 'playing',
            startTime: new Date()
        });

        await game.save();

        res.json({
            mode: 'single',
            gameId: game._id,
            roomCode,
            questions: selectedQuestions.map(serializeQuestion),
            player1: buildPlayerResponse(game.player1),
            player2: buildPlayerResponse(game.player2),
            botProfile
        });
    } catch (error) {
        console.error('Error starting AI match:', error);
        res.status(500).json({ message: 'Failed to start AI match' });
    }
});

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

        game.player2 = {
            userId: user._id,
            username: user.username,
            avatar: user.profilePicture || null,
            isBot: false,
            statusMessage: 'Ready',
            averageTime: 0
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

        game.player2 = {
            userId: null,
            username: playerName,
            avatar: null,
            isBot: false,
            statusMessage: 'Guest ready',
            averageTime: 0
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

router.post('/start-game/:gameId', async (req, res) => {
    try {
        const game = await MultiplayerGame.findById(req.params.gameId);

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        let questionsForClient;

        if (game.questions && game.questions.length > 0 && game.questions.every(question => question.question && question.options?.length)) {
            questionsForClient = game.questions.map(serializeStoredQuestion);
        } else if (game.questions && game.questions.length > 0) {
            const questionIds = game.questions.map(question => question.questionId);
            const questions = await Question.find({ _id: { $in: questionIds } });
            questionsForClient = game.questions.map(storedQuestion => {
                const fullQuestion = questions.find(question => question._id.toString() === storedQuestion.questionId);
                return {
                    questionId: storedQuestion.questionId,
                    question: fullQuestion.question,
                    options: fullQuestion.options,
                    category: storedQuestion.category,
                    topic: storedQuestion.topic,
                    difficulty: storedQuestion.difficulty
                };
            });
        } else {
            const questions = await Question.aggregate([
                { $match: { levelNumber: { $lte: 5 } } },
                { $sample: { size: 10 } }
            ]);

            if (!questions.length) {
                return res.status(500).json({ message: 'No questions available in database' });
            }

            game.questions = questions.map(question => ({
                questionId: question._id.toString(),
                category: question.category,
                topic: question.topic,
                difficulty: question.difficulty,
                correctAnswer: question.correctAnswer,
                question: question.question,
                options: question.options
            }));
            game.status = 'playing';
            game.startTime = new Date();
            await game.save();

            questionsForClient = questions.map(serializeQuestion);
        }

        res.json({
            questions: questionsForClient,
            player1: buildPlayerResponse(game.player1),
            player2: buildPlayerResponse(game.player2),
            roomCode: game.roomCode,
            botProfile: game.botProfile || null
        });
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ message: 'Failed to start game', error: error.message });
    }
});

router.post('/submit-answer', async (req, res) => {
    try {
        const { gameId, questionId, selectedAnswer, timeTaken, isGuest } = req.body;
        const game = await MultiplayerGame.findById(gameId);

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const { isPlayer1, player } = await resolvePlayerContext(game, req, isGuest);
        if (player.answers.some(answer => answer.questionId === questionId)) {
            return res.status(400).json({ message: 'Question already answered' });
        }

        const questionData = game.questions.find(question => question.questionId === questionId);
        const isCorrect = questionData && questionData.correctAnswer === selectedAnswer;
        const pointsEarned = calculatePoints(player, isCorrect, timeTaken, questionData.difficulty);

        if (isCorrect) {
            player.correctAnswers += 1;
            player.score += pointsEarned;
        }

        player.answers.push({
            questionId,
            selectedAnswer,
            isCorrect,
            timeTaken,
            pointsEarned
        });
        player.totalAnswers += 1;
        player.averageTime = calculateAverageAnswerTime(player);

        let botTurn = null;
        if (game.player2.isBot && isPlayer1) {
            const user = await User.findById(game.player1.userId);
            botTurn = simulateAdaptiveBotTurn({
                game,
                question: {
                    ...questionData,
                    optionCount: questionData.options?.length || 4
                },
                user
            });

            if (botTurn.isCorrect) {
                game.player2.correctAnswers += 1;
                game.player2.score += botTurn.pointsEarned;
            }

            game.player2.answers.push({
                questionId,
                selectedAnswer: botTurn.selectedAnswer,
                isCorrect: botTurn.isCorrect,
                timeTaken: botTurn.timeTaken,
                pointsEarned: botTurn.pointsEarned
            });
            game.player2.totalAnswers += 1;
            game.player2.averageTime = botTurn.averageTime;
            game.player2.statusMessage = botTurn.statusMessage;
            game.botProfile.lastReaction = botTurn.reaction;
            game.botProfile.lastStatus = botTurn.statusMessage;
        }

        await game.save();

        res.json({
            correct: isCorrect,
            correctAnswer: questionData.correctAnswer,
            pointsEarned,
            newScore: player.score,
            comboCount: player.correctAnswers,
            averageTime: player.averageTime,
            botTurn,
            opponentStatus: game.player2.statusMessage || null
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ message: error.message || 'Failed to submit answer' });
    }
});

router.post('/end-game/:gameId', async (req, res) => {
    try {
        const game = await MultiplayerGame.findById(req.params.gameId);

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        game.status = 'finished';
        game.endTime = new Date();

        let winner = 'tie';
        if (game.player1.score > game.player2.score) {
            winner = 'player1';
            game.winnerId = game.player1.userId;
        } else if (game.player2.score > game.player1.score) {
            winner = 'player2';
            game.winnerId = game.player2.userId || undefined;
        }

        const bonusPoints = 50;
        const winnerBonus = 100;

        if (game.player1.userId) {
            await User.findByIdAndUpdate(game.player1.userId, {
                $inc: {
                    totalPoints: bonusPoints + (winner === 'player1' ? winnerBonus : 0)
                }
            });
        }

        if (game.player2.userId && !game.player2.isBot) {
            await User.findByIdAndUpdate(game.player2.userId, {
                $inc: {
                    totalPoints: bonusPoints + (winner === 'player2' ? winnerBonus : 0)
                }
            });
        }

        await game.save();

        res.json({
            winner,
            player1Score: game.player1.score,
            player2Score: game.player2.score,
            player1Stats: {
                correct: game.player1.correctAnswers,
                total: game.player1.totalAnswers,
                accuracy: game.player1.totalAnswers > 0 ? Math.round((game.player1.correctAnswers / game.player1.totalAnswers) * 100) : 0,
                averageTime: calculateAverageAnswerTime(game.player1)
            },
            player2Stats: {
                correct: game.player2.correctAnswers,
                total: game.player2.totalAnswers,
                accuracy: game.player2.totalAnswers > 0 ? Math.round((game.player2.correctAnswers / game.player2.totalAnswers) * 100) : 0,
                averageTime: calculateAverageAnswerTime(game.player2)
            },
            opponentStatus: game.player2.statusMessage || null
        });
    } catch (error) {
        console.error('Error ending game:', error);
        res.status(500).json({ message: 'Failed to end game' });
    }
});

router.get('/game-status/:gameId', authMiddleware, async (req, res) => {
    try {
        const game = await MultiplayerGame.findById(req.params.gameId);

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({
            status: game.status,
            player1: buildPlayerResponse(game.player1),
            player2: game.player2 ? buildPlayerResponse(game.player2) : null,
            botProfile: game.botProfile || null
        });
    } catch (error) {
        console.error('Error getting game status:', error);
        res.status(500).json({ message: 'Failed to get game status' });
    }
});

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
            if (game.player2.userId && !game.player2.isBot && game.player2.score > 0) {
                leaderboard.push({
                    username: game.player2.username,
                    avatar: game.player2.avatar,
                    score: game.player2.score,
                    accuracy: game.player2.totalAnswers > 0 ? Math.round((game.player2.correctAnswers / game.player2.totalAnswers) * 100) : 0,
                    date: game.endTime || game.createdAt
                });
            }
        });

        leaderboard.sort((a, b) => b.score - a.score);

        res.json(leaderboard.slice(0, 20));
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ message: 'Failed to get leaderboard' });
    }
});

module.exports = router;