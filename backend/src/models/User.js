const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Get user by email
const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

// Get user by username
const getUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};

// Get user by ID
const getUserById = async (id) => {
  const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

// Create new user
const createUser = async (username, email, password) => {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    // Create default user preferences
    const userId = result.rows[0].id;
    await pool.query(
      'INSERT INTO user_preferences (user_id) VALUES ($1)',
      [userId]
    );

    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to create user: ${err.message}`);
  }
};

// Verify password
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Update user password
const updateUserPassword = async (userId, newPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email',
      [hashedPassword, userId]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to update password: ${err.message}`);
  }
};

module.exports = {
  getUserByEmail,
  getUserByUsername,
  getUserById,
  createUser,
  verifyPassword,
  updateUserPassword,
};
