const pool = require('../config/database');

// Create event
const createEvent = async (userId, title, description, startTime, endTime, color = '#667eea') => {
  try {
    const result = await pool.query(
      `INSERT INTO events (user_id, title, description, start_time, end_time, color) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, title, description, startTime, endTime, color]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to create event: ${err.message}`);
  }
};

// Get all events for a user (with optional date range)
const getEventsByUser = async (userId, startDate = null, endDate = null) => {
  try {
    let query = 'SELECT * FROM events WHERE user_id = $1';
    const params = [userId];

    if (startDate && endDate) {
      query += ' AND start_time >= $2 AND end_time <= $3';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY start_time ASC';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    throw new Error(`Failed to get events: ${err.message}`);
  }
};

// Get single event by ID
const getEventById = async (eventId, userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND user_id = $2',
      [eventId, userId]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to get event: ${err.message}`);
  }
};

// Update event
const updateEvent = async (eventId, userId, updates) => {
  try {
    const { title, description, startTime, endTime, color } = updates;

    const result = await pool.query(
      `UPDATE events 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           color = COALESCE($5, color),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, description, startTime, endTime, color, eventId, userId]
    );

    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to update event: ${err.message}`);
  }
};

// Delete event
const deleteEvent = async (eventId, userId) => {
  try {
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *',
      [eventId, userId]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to delete event: ${err.message}`);
  }
};

// Get events for a specific day
const getEventsByDay = async (userId, date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await pool.query(
      `SELECT * FROM events 
       WHERE user_id = $1 AND start_time >= $2 AND start_time <= $3
       ORDER BY start_time ASC`,
      [userId, startOfDay.toISOString(), endOfDay.toISOString()]
    );
    return result.rows;
  } catch (err) {
    throw new Error(`Failed to get events for day: ${err.message}`);
  }
};

// Get events for a specific month
const getEventsByMonth = async (userId, year, month) => {
  try {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const result = await pool.query(
      `SELECT * FROM events 
       WHERE user_id = $1 AND start_time >= $2 AND start_time <= $3
       ORDER BY start_time ASC`,
      [userId, startOfMonth.toISOString(), endOfMonth.toISOString()]
    );
    return result.rows;
  } catch (err) {
    throw new Error(`Failed to get events for month: ${err.message}`);
  }
};

module.exports = {
  createEvent,
  getEventsByUser,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByDay,
  getEventsByMonth,
};
