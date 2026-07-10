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
app.use(cors());
app.use(express.json());

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    tls: true,
    retryWrites: false,
  })
    .then(async () => {
      console.log('MongoDB connected successfully');

      console.log('MongoDB connected');
      // Seed default admin password if none exists
      const adminSetting = await AdminSettings.findOne();
      if (!adminSetting) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);
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

// Serve frontend static files from dist folder
const distPath = path.join(__dirname, 'dist');
console.log('Serving static files from:', distPath);
app.use(express.static(distPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/score', scoreRoutes);

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend connected successfully!',
    dbState: mongoose.connection.readyState, // 0=disconnected,1=connected,2=connecting,3=disconnecting
    hasMongoUri: !!process.env.MONGODB_URI,
  });
});

// Serve index.html for all other routes (SPA support)
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});