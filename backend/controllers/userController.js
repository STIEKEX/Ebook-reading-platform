const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// GET USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 'profile.name': name, 'profile.avatar': avatar },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPLOAD PROFILE PICTURE
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profile.avatar && user.profile.avatar.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '..', user.profile.avatar);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new profile picture path
    const profilePicturePath = `/uploads/profiles/${req.file.filename}`;
    user.profile.avatar = profilePicturePath;
    await user.save();

    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: profilePicturePath
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE NAME (Only once per month)
exports.changeName = async (req, res) => {
  try {
    const { newName } = req.body;
    
    if (!newName || newName.trim().length === 0) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has changed name in the last 30 days
    if (user.profile.lastNameChange) {
      const daysSinceLastChange = Math.floor(
        (Date.now() - new Date(user.profile.lastNameChange).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastChange < 30) {
        const daysRemaining = 30 - daysSinceLastChange;
        return res.status(403).json({ 
          message: `You can only change your name once per month. Please wait ${daysRemaining} more day${daysRemaining !== 1 ? 's' : ''}.`,
          canChangeAfter: new Date(new Date(user.profile.lastNameChange).getTime() + (30 * 24 * 60 * 60 * 1000)),
          daysRemaining
        });
      }
    }

    // Update name and record the change date
    user.profile.name = newName.trim();
    user.profile.lastNameChange = new Date();
    await user.save();

    res.json({ 
      message: 'Name updated successfully',
      name: user.profile.name,
      lastNameChange: user.profile.lastNameChange
    });
  } catch (error) {
    console.error('Error changing name:', error);
    res.status(500).json({ message: error.message });
  }
};
