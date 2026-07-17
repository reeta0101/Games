import express from 'express';
import QuestionVote from '../models/QuestionVote.js';

const router = express.Router();

// POST /api/votes — submit or update a vote
router.post('/', async (req, res) => {
  try {
    const { questionId, subject, difficulty, questionText, vote, userIdentifier } = req.body;

    if (!questionId || !vote || !['up', 'down'].includes(vote)) {
      return res.status(400).json({ error: 'questionId and vote (up/down) are required' });
    }

    const uid = userIdentifier || 'anonymous';

    // Upsert: if same user voted on same question, update their vote
    const result = await QuestionVote.findOneAndUpdate(
      { questionId, userIdentifier: uid },
      {
        questionId,
        subject: subject || 'unknown',
        difficulty: difficulty || 'unknown',
        questionText: (questionText || '').slice(0, 150),
        vote,
        userIdentifier: uid,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Return updated counts for this question
    const [upCount, downCount] = await Promise.all([
      QuestionVote.countDocuments({ questionId, vote: 'up' }),
      QuestionVote.countDocuments({ questionId, vote: 'down' }),
    ]);

    res.json({ success: true, vote: result, upCount, downCount });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to save vote' });
  }
});

// GET /api/votes/question/:questionId — get vote counts for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userIdentifier } = req.query;

    const [upCount, downCount] = await Promise.all([
      QuestionVote.countDocuments({ questionId, vote: 'up' }),
      QuestionVote.countDocuments({ questionId, vote: 'down' }),
    ]);

    let myVote = null;
    if (userIdentifier) {
      const existing = await QuestionVote.findOne({ questionId, userIdentifier });
      myVote = existing?.vote || null;
    }

    res.json({ upCount, downCount, myVote });
  } catch (err) {
    console.error('Get vote counts error:', err);
    res.status(500).json({ error: 'Failed to get votes' });
  }
});

// GET /api/votes/summary — all questions sorted by vote counts (admin)
router.get('/summary', async (req, res) => {
  try {
    const summary = await QuestionVote.aggregate([
      {
        $group: {
          _id: '$questionId',
          subject: { $first: '$subject' },
          difficulty: { $first: '$difficulty' },
          questionText: { $first: '$questionText' },
          upVotes: { $sum: { $cond: [{ $eq: ['$vote', 'up'] }, 1, 0] } },
          downVotes: { $sum: { $cond: [{ $eq: ['$vote', 'down'] }, 1, 0] } },
          totalVotes: { $sum: 1 },
          lastVoted: { $max: '$createdAt' },
        }
      },
      { $sort: { totalVotes: -1, downVotes: -1 } },
      { $limit: 100 }
    ]);

    res.json({ summary });
  } catch (err) {
    console.error('Vote summary error:', err);
    res.status(500).json({ error: 'Failed to fetch vote summary' });
  }
});

export default router;
