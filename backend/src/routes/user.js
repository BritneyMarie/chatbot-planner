const express = require('express');
const { 
  getUserPreferencesHandler, 
  updateUserPreferencesHandler,
  completeOnboardingHandler
} = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(verifyToken);

// Get user preferences
router.get('/preferences', getUserPreferencesHandler);

// Update user preferences
router.put('/preferences', updateUserPreferencesHandler);

// Complete onboarding
router.post('/onboarding/complete', completeOnboardingHandler);

module.exports = router;
