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

// Create recurring event
const createRecurringEvent = async (userId, title, description, startTime, endTime, color = '#667eea', recurrencePattern = null) => {
  try {
    const result = await pool.query(
      `INSERT INTO events (user_id, title, description, start_time, end_time, color, recurring, recurrence_pattern) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [userId, title, description, startTime, endTime, color, recurrencePattern ? true : false, recurrencePattern]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to create recurring event: ${err.message}`);
  }
};

// Expand recurring events for a date range
const expandRecurringEvents = (baseEvent, startDate, endDate) => {
  const events = [];
  
  if (!baseEvent.recurring || !baseEvent.recurrence_pattern) {
    return [baseEvent];
  }

  const pattern = baseEvent.recurrence_pattern;
  const startBase = new Date(baseEvent.start_time);
  const endBase = new Date(baseEvent.end_time);
  const duration = endBase - startBase;

  let current = new Date(startBase);

  while (current <= new Date(endDate)) {
    if (current >= new Date(startDate)) {
      events.push({
        ...baseEvent,
        start_time: new Date(current).toISOString(),
        end_time: new Date(current.getTime() + duration).toISOString(),
      });
    }

    // Increment based on pattern
    if (pattern === 'daily') {
      current.setDate(current.getDate() + 1);
    } else if (pattern === 'weekly') {
      current.setDate(current.getDate() + 7);
    } else if (pattern === 'biweekly') {
      current.setDate(current.getDate() + 14);
    } else if (pattern === 'monthly') {
      current.setMonth(current.getMonth() + 1);
    } else if (pattern === 'yearly') {
      current.setFullYear(current.getFullYear() + 1);
    } else {
      break; // Unknown pattern
    }
  }

  return events;
};

// Get recurring events with expanded instances
const getRecurringEventsByUser = async (userId, startDate, endDate) => {
  try {
    let query = 'SELECT * FROM events WHERE user_id = $1';
    const params = [userId];

    if (startDate && endDate) {
      query += ' AND (start_time >= $2 OR recurring = TRUE)';
      params.push(startDate);
    }

    const result = await pool.query(query, params);
    
    // Expand recurring events
    let allEvents = [];
    for (const event of result.rows) {
      if (event.recurring && startDate && endDate) {
        const expanded = expandRecurringEvents(event, startDate, endDate);
        allEvents = allEvents.concat(expanded);
      } else {
        allEvents.push(event);
      }
    }

    return allEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  } catch (err) {
    throw new Error(`Failed to get recurring events: ${err.message}`);
  }
};

// Search events by title
const searchEvents = async (userId, searchTerm) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE user_id = $1 AND title ILIKE $2
       ORDER BY start_time ASC`,
      [userId, `%${searchTerm}%`]
    );
    return result.rows;
  } catch (err) {
    throw new Error(`Failed to search events: ${err.message}`);
  }
};

// Get events by color
const getEventsByColor = async (userId, color) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE user_id = $1 AND color = $2
       ORDER BY start_time ASC`,
      [userId, color]
    );
    return result.rows;
  } catch (err) {
    throw new Error(`Failed to get events by color: ${err.message}`);
  }
};

// Get events with filtering
const getEventsWithFilter = async (userId, filters = {}) => {
  try {
    let query = 'SELECT * FROM events WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (filters.color) {
      query += ` AND color = $${paramIndex}`;
      params.push(filters.color);
      paramIndex++;
    }

    if (filters.searchTerm) {
      query += ` AND title ILIKE $${paramIndex}`;
      params.push(`%${filters.searchTerm}%`);
      paramIndex++;
    }

    if (filters.startDate) {
      query += ` AND start_time >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND end_time <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters.isRecurring !== undefined) {
      query += ` AND recurring = $${paramIndex}`;
      params.push(filters.isRecurring);
      paramIndex++;
    }

    query += ' ORDER BY start_time ASC';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    throw new Error(`Failed to get filtered events: ${err.message}`);
  }
};

// Update recurring event
const updateRecurringEvent = async (eventId, userId, updates) => {
  try {
    const { title, description, startTime, endTime, color, recurrencePattern } = updates;

    const result = await pool.query(
      `UPDATE events 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           color = COALESCE($5, color),
           recurrence_pattern = COALESCE($6, recurrence_pattern),
           recurring = CASE WHEN $6 IS NOT NULL THEN TRUE ELSE recurring END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, description, startTime, endTime, color, recurrencePattern, eventId, userId]
    );

    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to update recurring event: ${err.message}`);
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
  createRecurringEvent,
  getEventsByUser,
  getRecurringEventsByUser,
  getEventById,
  updateEvent,
  updateRecurringEvent,
  deleteEvent,
  getEventsByDay,
  getEventsByMonth,
  searchEvents,
  getEventsByColor,
  getEventsWithFilter,
  expandRecurringEvents,
};
