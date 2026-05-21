const pool = require('../config/database');

// Create event template
const createTemplate = async (userId, name, title, description, color = '#667eea', duration = 60) => {
  try {
    const result = await pool.query(
      `INSERT INTO event_templates (user_id, template_name, event_title, event_description, event_color, event_duration) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, name, title, description, color, duration]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to create template: ${err.message}`);
  }
};

// Get all templates for user
const getTemplatesByUser = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT * FROM event_templates 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (err) {
    throw new Error(`Failed to get templates: ${err.message}`);
  }
};

// Get single template
const getTemplateById = async (templateId, userId) => {
  try {
    const result = await pool.query(
      `SELECT * FROM event_templates 
       WHERE id = $1 AND user_id = $2`,
      [templateId, userId]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to get template: ${err.message}`);
  }
};

// Update template
const updateTemplate = async (templateId, userId, updates) => {
  try {
    const { name, title, description, color, duration } = updates;

    const result = await pool.query(
      `UPDATE event_templates 
       SET template_name = COALESCE($1, template_name),
           event_title = COALESCE($2, event_title),
           event_description = COALESCE($3, event_description),
           event_color = COALESCE($4, event_color),
           event_duration = COALESCE($5, event_duration),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, title, description, color, duration, templateId, userId]
    );

    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to update template: ${err.message}`);
  }
};

// Delete template
const deleteTemplate = async (templateId, userId) => {
  try {
    const result = await pool.query(
      `DELETE FROM event_templates 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [templateId, userId]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(`Failed to delete template: ${err.message}`);
  }
};

// Get default templates (system-provided)
const getDefaultTemplates = () => {
  return [
    {
      id: 'meeting',
      templateName: 'Meeting',
      eventTitle: 'Meeting',
      eventDescription: '',
      eventColor: '#667eea',
      eventDuration: 60,
    },
    {
      id: 'standup',
      templateName: 'Stand-up',
      eventTitle: 'Daily Stand-up',
      eventDescription: 'Team sync',
      eventColor: '#764ba2',
      eventDuration: 15,
    },
    {
      id: 'lunch',
      templateName: 'Lunch Break',
      eventTitle: 'Lunch Break',
      eventDescription: '',
      eventColor: '#f97316',
      eventDuration: 60,
    },
    {
      id: 'break',
      templateName: 'Coffee Break',
      eventTitle: 'Coffee Break',
      eventDescription: '',
      eventColor: '#8b5cf6',
      eventDuration: 15,
    },
    {
      id: 'task',
      templateName: 'Task',
      eventTitle: 'Task',
      eventDescription: '',
      eventColor: '#06b6d4',
      eventDuration: 120,
    },
    {
      id: 'exercise',
      templateName: 'Exercise',
      eventTitle: 'Workout',
      eventDescription: '',
      eventColor: '#10b981',
      eventDuration: 60,
    },
  ];
};

module.exports = {
  createTemplate,
  getTemplatesByUser,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getDefaultTemplates,
};
