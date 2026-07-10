import express from 'express';
import User from '../models/User.js';
import AdminSettings from '../models/AdminSettings.js';
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
    if (username !== 'admin') {
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
