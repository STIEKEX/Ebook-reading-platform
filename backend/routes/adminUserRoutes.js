const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Get all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Update user role (admin only)
router.patch('/:userId/role', authMiddleware, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: { role } },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
});

// Ban/unban user (admin only)
router.patch('/:userId/ban', authMiddleware, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { isBanned } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: { isBanned } },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user ban status', error: error.message });
    }
});

module.exports = router;