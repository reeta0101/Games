import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Simple admin authentication middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer admin123') {
    return res.status(403).json({ error: 'Forbidden: Admin access only.' });
  }
  next();
};

router.use(adminAuth);

// GET /api/admin/users — fetch all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
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

    res.json({
      totalUsers,
      todaySignups,
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

export default router;
