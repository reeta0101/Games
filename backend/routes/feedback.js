import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, name, userId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const newFeedback = new Feedback({
      message,
      name: name || 'Anonymous',
      userId: userId || null
    });

    await newFeedback.save();
    res.status(201).json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

export default router;
