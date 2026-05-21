const { getUserByEmail, getUserByUsername, getUserById, createUser, verifyPassword } = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Register controller
const register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validation
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters.' });
  }

  try {
    // Check if user already exists
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({ error: 'Username already taken.' });
    }

    // Create user
    const newUser = await createUser(username, email, password);

    // Generate JWT token
    const token = generateToken(newUser.id);

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
};

// Login controller
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to login.' });
  }
};

// Logout controller (mostly client-side, but can be used for token blacklisting later)
const logout = async (req, res) => {
  try {
    return res.status(200).json({ message: 'Logout successful.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Failed to logout.' });
  }
};

// Refresh token controller
const refreshToken = async (req, res) => {
  try {
    const { userId } = req.user;

    // Verify user still exists
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Generate new token
    const newToken = generateToken(user.id);

    return res.status(200).json({
      message: 'Token refreshed successfully.',
      token: newToken,
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(500).json({ error: 'Failed to refresh token.' });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
