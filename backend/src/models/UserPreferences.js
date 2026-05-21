const pool = require('../config/database');

// Get user preferences
const getUserPreferences = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (err) {
    throw new Error(`Failed to get user preferences: ${err.message}`);
  }
};

// Create default user preferences
const createDefaultPreferences = async (userId) => {
  try {
    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, theme_primary_color, theme_secondary_color, theme_font, chatbot_icon, notifications_enabled, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, '#667eea', '#764ba2', 'Poppins', '🤖', true, 'en']
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to create user preferences: ${err.message}`);
  }
};

// Update user preferences
const updateUserPreferences = async (userId, updates) => {
  try {
    const { theme_primary_color, theme_secondary_color, theme_font, chatbot_icon, notifications_enabled, language } = updates;

    const result = await pool.query(
      `UPDATE user_preferences
       SET theme_primary_color = COALESCE($1, theme_primary_color),
           theme_secondary_color = COALESCE($2, theme_secondary_color),
           theme_font = COALESCE($3, theme_font),
           chatbot_icon = COALESCE($4, chatbot_icon),
           notifications_enabled = COALESCE($5, notifications_enabled),
           language = COALESCE($6, language),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7
       RETURNING *`,
      [theme_primary_color, theme_secondary_color, theme_font, chatbot_icon, notifications_enabled, language, userId]
    );

    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to update user preferences: ${err.message}`);
  }
};

// Update onboarding completed flag
const updateOnboardingCompleted = async (userId) => {
  try {
    const result = await pool.query(
      `UPDATE user_preferences
       SET onboarding_completed = true, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [userId]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to update onboarding status: ${err.message}`);
  }
};

module.exports = {
  getUserPreferences,
  createDefaultPreferences,
  updateUserPreferences,
  updateOnboardingCompleted,
};
