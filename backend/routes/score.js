import express from 'express';
import mongoose from 'mongoose';
import Score from '../models/Score.js';

const router = express.Router();

// POST /api/score — Save or update a high score
router.post('/', async (req, res) => {
  try {
    const { name, mode, difficulty, score, questions } = req.body;

    if (!name || !mode || !difficulty || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Upsert logic: only update if new score is higher
    const existingScore = await Score.findOne({ name, mode, difficulty });

    if (!existingScore) {
      const newScore = new Score({ name, mode, difficulty, score, questions });
      await newScore.save();
      return res.status(201).json({ message: 'Score saved.', score: newScore });
    }

    if (score > existingScore.score) {
      existingScore.score = score;
      existingScore.questions = questions || existingScore.questions;
      await existingScore.save();
      return res.status(200).json({ message: 'High score updated!', score: existingScore });
    }

    return res.status(200).json({ message: 'Score not higher than personal best.', score: existingScore });
  } catch (err) {
    console.error('Save score error:', err.message);
    res.status(500).json({ error: 'Failed to save score.' });
  }
});

// GET /api/score/leaderboard/:mode/:difficulty — Get top 20 scores
router.get('/leaderboard/:mode/:difficulty', async (req, res) => {
  try {
    const { mode, difficulty } = req.params;
    const limit = parseInt(req.query.limit, 10) || 20;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.', scores: [] });
    }

    const allScores = await Score.find({ mode, difficulty });
    
    // Sort in memory to avoid Cosmos DB index errors
    allScores.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    });
    
    const topScores = allScores.slice(0, limit);

    res.json({ scores: topScores });
  } catch (err) {
    console.error('Fetch leaderboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// GET /api/score/personal/:name — Get all personal bests for a user
router.get('/personal/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const scores = await Score.find({ name });
    
    // Format into an object mapping `${mode}__${difficulty}` to score
    const highScores = {};
    scores.forEach(s => {
      highScores[`${s.mode}__${s.difficulty}`] = s.score;
    });

    res.json({ highScores });
  } catch (err) {
    console.error('Fetch personal scores error:', err.message);
    res.status(500).json({ error: 'Failed to fetch personal scores.' });
  }
});

export default router;
