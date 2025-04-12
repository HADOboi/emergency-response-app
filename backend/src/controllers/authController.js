const User = require('../models/User');
const { Admin } = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name
    });

    // Generate token
    const token = generateToken(user._id, 'user');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'user',
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user or admin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // First try to find admin
    let admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await admin.comparePassword(password);
      if (isMatch) {
        const token = generateToken(admin._id, 'admin');
        return res.json({
          _id: admin._id,
          email: admin.email,
          name: 'Admin',
          role: 'admin',
          token
        });
      }
    }

    // If not admin, try to find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, 'user');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'user',
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 