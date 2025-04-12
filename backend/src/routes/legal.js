const express = require('express');
const router = express.Router();
const { trackUnaddedTerm, getUnaddedTerms, ignoreTerm, linkTerm, getLegalSections } = require('../controllers/legalController');
const { protect } = require('../middleware/authMiddleware');

// Track unadded term (public endpoint)
router.post('/unadded-terms', trackUnaddedTerm);

// Get all unadded terms (admin only)
router.get('/unadded-terms', protect, getUnaddedTerms);

// Ignore term (admin only)
router.post('/unadded-terms/:id/ignore', protect, ignoreTerm);

// Link term to existing case (admin only)
router.post('/unadded-terms/:id/link', protect, linkTerm);

// Get all legal sections (public endpoint)
router.get('/sections', getLegalSections);

module.exports = router; 