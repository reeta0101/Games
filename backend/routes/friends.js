import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get friends and friend requests for a user
// GET /api/friends/:username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() })
      .populate('friends', 'name username')
      .populate('friendRequests', 'name username');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      friends: user.friends,
      friendRequests: user.friendRequests,
    });
  } catch (err) {
    console.error('Get friends error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Search users by username (for adding friends)
// GET /api/friends/search?query=xxx&currentUsername=yyy
router.get('/search/users', async (req, res) => {
  try {
    const { query, currentUsername } = req.query;
    if (!query || query.length < 3) {
      return res.json([]);
    }

    // Find users matching query but exclude the current user
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      username: { $ne: currentUsername.toLowerCase() }
    })
    .select('name username')
    .limit(10);

    res.json(users);
  } catch (err) {
    console.error('Search users error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Send a friend request
// POST /api/friends/request
router.post('/request', async (req, res) => {
  try {
    const { senderUsername, targetUsername } = req.body;

    if (!senderUsername || !targetUsername) {
      return res.status(400).json({ error: 'Sender and target usernames are required.' });
    }

    if (senderUsername.toLowerCase() === targetUsername.toLowerCase()) {
      return res.status(400).json({ error: 'You cannot send a friend request to yourself.' });
    }

    const sender = await User.findOne({ username: senderUsername.toLowerCase() });
    const target = await User.findOne({ username: targetUsername.toLowerCase() });

    if (!sender || !target) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if they are already friends
    if (target.friends.includes(sender._id)) {
      return res.status(400).json({ error: 'You are already friends.' });
    }

    // Check if request already exists
    if (target.friendRequests.includes(sender._id)) {
      return res.status(400).json({ error: 'Friend request already sent.' });
    }

    // Add to target's friendRequests
    target.friendRequests.push(sender._id);
    await target.save();

    res.json({ message: 'Friend request sent successfully.' });
  } catch (err) {
    console.error('Send request error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Accept a friend request
// POST /api/friends/accept
router.post('/accept', async (req, res) => {
  try {
    const { currentUsername, requesterUsername } = req.body;

    const current = await User.findOne({ username: currentUsername.toLowerCase() });
    const requester = await User.findOne({ username: requesterUsername.toLowerCase() });

    if (!current || !requester) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if request exists
    if (!current.friendRequests.includes(requester._id)) {
      return res.status(400).json({ error: 'No friend request found.' });
    }

    // Remove from requests, add to friends (for both)
    current.friendRequests = current.friendRequests.filter(id => id.toString() !== requester._id.toString());
    
    if (!current.friends.includes(requester._id)) {
      current.friends.push(requester._id);
    }
    
    // If current user had sent a request to requester, remove it
    requester.friendRequests = requester.friendRequests.filter(id => id.toString() !== current._id.toString());
    
    if (!requester.friends.includes(current._id)) {
      requester.friends.push(current._id);
    }

    await current.save();
    await requester.save();

    res.json({ message: 'Friend request accepted.' });
  } catch (err) {
    console.error('Accept request error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Reject a friend request
// POST /api/friends/reject
router.post('/reject', async (req, res) => {
  try {
    const { currentUsername, requesterUsername } = req.body;

    const current = await User.findOne({ username: currentUsername.toLowerCase() });
    const requester = await User.findOne({ username: requesterUsername.toLowerCase() });

    if (!current || !requester) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Remove from requests
    current.friendRequests = current.friendRequests.filter(id => id.toString() !== requester._id.toString());
    await current.save();

    res.json({ message: 'Friend request rejected.' });
  } catch (err) {
    console.error('Reject request error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

export default router;
