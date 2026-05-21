const express = require('express');
const { register, login, logout, refreshToken } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.post('/refresh', verifyToken, refreshToken);

module.exports = router;
