import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import AdminSettings from './models/AdminSettings.js';
import User from './models/User.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for now
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'https://games-frontend-ju7y.onrender.com'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow any origin for now to prevent CORS issues
    callback(null, origin || '*');
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('MongoDB connected successfully');

      console.log('MongoDB connected');
      // Seed default admin password if none exists
      const adminSetting = await AdminSettings.findOne();
      if (!adminSetting) {
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
        const passwordHash = await bcrypt.hash(defaultPassword, salt);
        await AdminSettings.create({ passwordHash });
        console.log('Seeded default admin password.');
      }
    })
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      console.error('MongoDB connection error full:', JSON.stringify(err, null, 2));
    });
} else {
  console.warn('MONGODB_URI not set - skipping database connection');
}

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import scoreRoutes from './routes/score.js';
import feedbackRoutes from './routes/feedback.js';
import statsRoutes from './routes/stats.js';
import friendsRoutes from './routes/friends.js';



// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/friends', friendsRoutes);

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend connected successfully!',
    dbState: mongoose.connection.readyState, // 0=disconnected,1=connected,2=connecting,3=disconnecting
    hasMongoUri: !!process.env.MONGODB_URI,
  });
});

// Socket.io Lobby Logic
const lobbies = {}; // In-memory store: { roomId: { players: [], settings: {} } }
const onlineUsers = {}; // Map of username (lowercase) -> socket.id

io.on('connection', (socket) => {
  // Global online tracking
  socket.on('user_online', ({ username }) => {
    if (username) {
      onlineUsers[username.toLowerCase()] = socket.id;
      // We could broadcast to friends here, but for simplicity we will just let LobbyPage request status
    }
  });

  socket.on('check_online_status', ({ friendsList }, callback) => {
    const statusMap = {};
    friendsList.forEach(friend => {
      statusMap[friend] = !!onlineUsers[friend.toLowerCase()];
    });
    if (callback) callback(statusMap);
  });

  socket.on('send_challenge', ({ targetUsername, fromUsername, fromName, roomId }, callback) => {
    const targetSocketId = onlineUsers[targetUsername.toLowerCase()];
    if (targetSocketId) {
      io.to(targetSocketId).emit('receive_challenge', {
        fromUsername,
        fromName,
        roomId
      });
      if (callback) callback({ success: true });
    } else {
      if (callback) callback({ error: 'User is offline' });
    }
  });

  socket.on('join_lobby', async ({ roomId, user }, callback) => {
    socket.join(roomId);
    let isNewRoom = false;
    if (!lobbies[roomId]) {
      lobbies[roomId] = { players: [], settings: null };
      isNewRoom = true;
    }
    
    // Authorization Check: If the room has a leader, check if the joining user is a friend
    const leader = lobbies[roomId].players.find(p => p.isLeader);
    if (leader && leader.username !== user.username) {
      try {
        const dbLeader = await User.findOne({ username: leader.username.toLowerCase() });
        const dbGuest = await User.findOne({ username: user.username.toLowerCase() });
        
        if (!dbLeader || !dbGuest || !dbLeader.friends.includes(dbGuest._id)) {
          socket.leave(roomId);
          if (callback) callback({ error: `You must be friends with ${leader.name} to join this lobby.` });
          return;
        }
      } catch (err) {
        console.error("Lobby join auth error:", err);
        socket.leave(roomId);
        if (callback) callback({ error: 'Server error verifying friends.' });
        return;
      }
    }

    // Check if user already exists
    const existing = lobbies[roomId].players.find(p => p.username === user.username);
    if (!existing) {
      lobbies[roomId].players.push({ 
        ...user, 
        ready: false, 
        isLeader: lobbies[roomId].players.length === 0, 
        socketId: socket.id,
        finished: false,
        finalScore: 0,
        correct: 0,
        wrong: 0
      });
    } else {
      existing.socketId = socket.id;
      // Reset if rejoining before game starts
      if (lobbies[roomId].status !== 'playing') {
        existing.finished = false;
        existing.finalScore = 0;
        existing.correct = 0;
        existing.wrong = 0;
      }
    }
    io.to(roomId).emit('lobby_state', lobbies[roomId]);
    
    const isMeLeader = lobbies[roomId].players.find(p => p.username === user.username)?.isLeader;
    
    if (callback) callback({ success: true, isLeader: isMeLeader, isNewRoom });
  });

  socket.on('toggle_ready', ({ roomId, username, readyState }) => {
    if (lobbies[roomId]) {
      const player = lobbies[roomId].players.find(p => p.username === username);
      if (player) {
        player.ready = readyState;
        io.to(roomId).emit('lobby_state', lobbies[roomId]);
      }
    }
  });

  socket.on('leave_lobby', ({ roomId, username }) => {
    if (lobbies[roomId]) {
      socket.leave(roomId);
      lobbies[roomId].players = lobbies[roomId].players.filter(p => p.username !== username);
      
      if (lobbies[roomId].players.length === 0) {
        delete lobbies[roomId];
      } else {
        // If leader left, make the next person leader
        if (!lobbies[roomId].players.some(p => p.isLeader)) {
          lobbies[roomId].players[0].isLeader = true;
        }
        io.to(roomId).emit('lobby_state', lobbies[roomId]);
      }
    }
  });

  socket.on('update_settings', ({ roomId, settings }) => {
    if (lobbies[roomId]) {
      lobbies[roomId].settings = settings;
      io.to(roomId).emit('lobby_state', lobbies[roomId]);
    }
  });

  socket.on('start_game', ({ roomId }) => {
    if (lobbies[roomId]) {
      lobbies[roomId].status = 'playing';
      // Use syncStartTime for visual client timer (clock skew might make it visually off, but server enforces end)
      const syncStartTime = Date.now() + 2000;
      lobbies[roomId].settings = { ...lobbies[roomId].settings, syncStartTime };
      
      // Reset players
      lobbies[roomId].players.forEach(p => {
        p.finished = false;
        p.finalScore = 0;
        p.correct = 0;
        p.wrong = 0;
        p.ready = false; // Reset ready state for the next rematch
      });
      io.to(roomId).emit('game_started', lobbies[roomId].settings);

      // Server enforces the end of Time Attack matches
      const { challengeMode, timeLimit } = lobbies[roomId].settings;
      if (challengeMode === 'time_attack' && timeLimit > 0) {
        // Add 2 seconds for the sync delay
        setTimeout(() => {
          if (lobbies[roomId] && lobbies[roomId].status === 'playing') {
            io.to(roomId).emit('game_over', { reason: 'timeout' });
          }
        }, (timeLimit * 1000) + 2000);
      }
    }
  });

  socket.on('submit_score', ({ roomId, username, score, correct, wrong, status }) => {
    if (lobbies[roomId]) {
      const p = lobbies[roomId].players.find(p => p.username === username);
      if (p) {
        p.finalScore = score;
        p.correct = correct;
        p.wrong = wrong;
        if (status === 'finished') {
          p.finished = true;
        }
        
        // Check if all players are finished
        const allFinished = lobbies[roomId].players.every(player => player.finished);
        if (allFinished) {
          lobbies[roomId].status = 'finished';
        }

        io.to(roomId).emit('lobby_state', lobbies[roomId]);
      }
    }
  });

  socket.on('disconnect', () => {
    // Remove from online tracking
    const username = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
    if (username) {
      delete onlineUsers[username];
    }
    
    // Optionally clean up disconnected players from lobbies if needed
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});