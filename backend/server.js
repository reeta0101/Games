import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import AdminSettings from './models/AdminSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
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



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});