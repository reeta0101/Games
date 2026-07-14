import express from 'express';
import ActiveVisitor from '../models/ActiveVisitor.js';

const router = express.Router();

// POST /api/stats/ping — Heartbeat to track active users
router.post('/ping', async (req, res) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) {
      return res.status(400).json({ error: 'visitorId is required.' });
    }

    // Upsert the active visitor document
    await ActiveVisitor.findOneAndUpdate(
      { visitorId },
      { lastActive: Date.now() },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Ping error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
