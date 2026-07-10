import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken.' });
    }

    const user = new User({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
    });

    await user.save();

    res.status(201).json({
      message: 'Account created successfully.',
      user: user.toJSON(),
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, username, password, loginMethod } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    let user;
    if (loginMethod === 'username') {
      if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
      }
      user = await User.findOne({ username: username.trim().toLowerCase() });
    } else {
      if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
      }
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!user) {
      return res.status(401).json({ error: `Incorrect ${loginMethod === 'username' ? 'username' : 'email'} or password.` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: `Incorrect ${loginMethod === 'username' ? 'username' : 'email'} or password.` });
    }

    res.json({
      message: 'Login successful.',
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

export default router;
