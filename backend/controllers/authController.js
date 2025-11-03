const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if admin code is correct
    const isAdmin = adminCode === process.env.ADMIN_PASSWORD;

    // Validate admin registration
    if (isAdmin) {
      // Additional validation for admin accounts
      if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
        return res.status(400).json({ 
          message: 'Admin password must be at least 8 characters long and include uppercase, lowercase, number, and special character' 
        });
      }
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      isAdmin,
    });

    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      message: isAdmin ? 'Admin registered successfully' : 'User registered successfully',
      token,
      user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log('Login attempt:', { email, isAdmin: user?.isAdmin });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    console.log('User authenticated:', { 
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin 
    });

    const token = generateToken(user);
    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
