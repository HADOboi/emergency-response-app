const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Get dashboard statistics
router.get('/stats', protect, getStats);

// Get all users
router.get('/users', protect, getAllUsers);

// Delete a user
router.delete('/users/:id', protect, deleteUser);

module.exports = router; 