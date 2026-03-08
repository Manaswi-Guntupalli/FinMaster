const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');
const scenarioRoutes = require('./routes/scenarios');
const blogRoutes = require('./routes/blog');
const snakeGameRoutes = require('./routes/snakegame');
const quizRushRoutes = require('./routes/quizrush');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/quizrush', quizRushRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/snakegame', snakeGameRoutes);

// Serve frontend (only for non-API routes)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
// Socket.IO for multiplayer games
const MultiplayerGame = require('./models/MultiplayerGame');

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  // Join a game room
  socket.on('join-room', async ({ roomCode, userId }) => {
    socket.join(roomCode);
    console.log(`👤 User ${userId} joined room ${roomCode}`);
    
    // Notify room that player joined
    const game = await MultiplayerGame.findOne({ roomCode });
    if (game) {
      io.to(roomCode).emit('player-joined', {
        player1: game.player1,
        player2: game.player2,
        status: game.status
      });
    }
  });
  
  // Game started
  socket.on('game-started', ({ roomCode }) => {
    io.to(roomCode).emit('start-game');
  });
  
  // Player answered question
  socket.on('answer-submitted', async ({ roomCode, playerNum, questionIndex, isCorrect, score, timeTaken }) => {
    io.to(roomCode).emit('opponent-answered', {
      playerNum,
      questionIndex,
      isCorrect,
      score,
      timeTaken
    });
  });
  
  // Player eliminated (lost all lives)
  socket.on('player-eliminated', ({ roomCode, playerNum, reason }) => {
    console.log(`💀 Player ${playerNum} eliminated in room ${roomCode}: ${reason}`);
    io.to(roomCode).emit('player-eliminated', {
      playerNum,
      reason
    });
  });
  
  // Next question
  socket.on('next-question', ({ roomCode, questionIndex }) => {
    io.to(roomCode).emit('load-next-question', { questionIndex });
  });
  
  // Game ended
  socket.on('game-ended', async ({ roomCode, results }) => {
    io.to(roomCode).emit('show-results', results);
  });
  
  // Player disconnected
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

server.listen(PORT, HOST, () => {
  console.log(`🚀 FinMaster server running successfully!`);
  console.log(`📱 On this computer: http://localhost:${PORT}`);
  console.log(`📱 On your phone: http://10.74.138.197:${PORT}`);
  console.log(`🎮 Multiplayer ready with Socket.IO`);
  console.log(`📚 Ready to master finance!`);
});
