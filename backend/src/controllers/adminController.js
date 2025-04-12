const User = require('../models/User');
const Admin = require('../models/Admin');

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    res.json({
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin account
    if (user.email === 'admin@erapp.com') {
      return res.status(403).json({ message: 'Cannot delete admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
}; 