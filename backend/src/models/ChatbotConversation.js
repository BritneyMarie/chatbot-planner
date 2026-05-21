const pool = require('../config/database');

// Save conversation
const saveConversation = async (userId, userMessage, botResponse, intent = null) => {
  try {
    const result = await pool.query(
      `INSERT INTO chatbot_conversations (user_id, user_message, bot_response, intent, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, userMessage, botResponse, intent]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to save conversation: ${err.message}`);
  }
};

// Get conversation history for user
const getConversationHistory = async (userId, limit = 50, offset = 0) => {
  try {
    const result = await pool.query(
      `SELECT * FROM chatbot_conversations 
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows.reverse(); // Return in ascending order (oldest first)
  } catch (err) {
    throw new Error(`Failed to get conversation history: ${err.message}`);
  }
};

// Get recent conversations (for context window)
const getRecentConversations = async (userId, limit = 10) => {
  try {
    const result = await pool.query(
      `SELECT user_message, bot_response FROM chatbot_conversations 
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows.reverse(); // Oldest first for context
  } catch (err) {
    throw new Error(`Failed to get recent conversations: ${err.message}`);
  }
};

// Clear conversation history
const clearConversationHistory = async (userId) => {
  try {
    await pool.query(
      'DELETE FROM chatbot_conversations WHERE user_id = $1',
      [userId]
    );
    return { success: true };
  } catch (err) {
    throw new Error(`Failed to clear conversation history: ${err.message}`);
  }
};

// Count user conversations
const countUserConversations = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM chatbot_conversations WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  } catch (err) {
    throw new Error(`Failed to count conversations: ${err.message}`);
  }
};

module.exports = {
  saveConversation,
  getConversationHistory,
  getRecentConversations,
  clearConversationHistory,
  countUserConversations,
};
