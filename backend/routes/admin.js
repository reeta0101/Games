import express from 'express';
import User from '../models/User.js';
import AdminSettings from '../models/AdminSettings.js';
import Feedback from '../models/Feedback.js';
import Score from '../models/Score.js';
import ActiveVisitor from '../models/ActiveVisitor.js';
import QuestionVote from '../models/QuestionVote.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

const JWT_SECRET = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('FATAL: JWT_SECRET env variable is not set.');
    process.exit(1);
  }
  return secret;
};

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username !== 'study_games_admin' && username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const adminSetting = await AdminSettings.findOne();
    if (!adminSetting) {
      return res.status(500).json({ error: 'Admin settings not initialized' });
    }

    const isMatch = await adminSetting.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET(), { expiresIn: '1d' });
    res.json({ token, name: 'Administrator' });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Forbidden: Admin access only.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET());
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' });
  }
};

router.use(adminAuth);

// POST /api/admin/change-password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match.' });
    }

    const adminSetting = await AdminSettings.findOne();
    if (!adminSetting) {
      return res.status(500).json({ error: 'Admin settings not initialized' });
    }

    const isMatch = await adminSetting.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    adminSetting.passwordHash = await bcrypt.hash(newPassword, salt);
    await adminSetting.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

// GET /api/admin/users — fetch all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ users });
  } catch (err) {
    console.error('Fetch users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// DELETE /api/admin/users/:id — delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: `User "${user.name}" deleted successfully.` });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// GET /api/admin/stats — platform stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySignups = await User.countDocuments({
      createdAt: { $gte: todayStart },
    });

    const uniqueScorers = await Score.distinct('name');
    const registeredNames = await User.distinct('name');
    const guestPlayers = uniqueScorers.filter(name => !registeredNames.includes(name)).length;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsers = await ActiveVisitor.countDocuments({
      lastActive: { $gte: fiveMinutesAgo }
    });

    res.json({
      totalUsers,
      todaySignups,
      guestPlayers,
      activeUsers,
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// GET /api/admin/feedback
router.get('/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find({}).sort({ createdAt: -1 });
    res.json({ feedback });
  } catch (err) {
    console.error('Fetch feedback error:', err.message);
    res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});

// DELETE /api/admin/feedback/:id
router.delete('/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found.' });
    }
    res.json({ message: 'Feedback deleted successfully.' });
  } catch (err) {
    console.error('Delete feedback error:', err.message);
    res.status(500).json({ error: 'Failed to delete feedback.' });
  }
});

// GET /api/admin/votes — aggregated question vote summary
router.get('/votes', async (req, res) => {
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
      { $sort: { totalVotes: -1 } },
      { $limit: 200 }
    ]);
    res.json({ votes: summary });
  } catch (err) {
    console.error('Admin votes error:', err.message);
    res.status(500).json({ error: 'Failed to fetch votes.' });
  }
});

export default router;
