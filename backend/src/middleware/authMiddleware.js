const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Admin } = require('../models/Admin');

// Protect routes - verify token
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Check if user is admin
      const admin = await Admin.findById(decoded.id);
      
      if (admin) {
        req.user = admin;
        req.user.role = 'admin';
        next();
      } else {
        // Check if user exists
        const user = await User.findById(decoded.id);
        
        if (user) {
          req.user = user;
          req.user.role = 'user';
          next();
        } else {
          return res.status(401).json({ message: 'User not found' });
        }
      }
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 