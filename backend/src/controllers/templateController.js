const {
  createTemplate,
  getTemplatesByUser,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getDefaultTemplates,
} = require('../models/EventTemplate');

// Get all templates (user + default)
const getTemplatesHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    const userTemplates = await getTemplatesByUser(userId);
    const defaultTemplates = getDefaultTemplates();
    
    return res.status(200).json({
      userTemplates,
      defaultTemplates,
      all: [...defaultTemplates, ...userTemplates],
    });
  } catch (err) {
    console.error('Get templates error:', err);
    return res.status(500).json({ error: 'Failed to fetch templates.' });
  }
};

// Get user templates only
const getUserTemplatesHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    const templates = await getTemplatesByUser(userId);
    return res.status(200).json({ templates });
  } catch (err) {
    console.error('Get user templates error:', err);
    return res.status(500).json({ error: 'Failed to fetch user templates.' });
  }
};

// Get default templates
const getDefaultTemplatesHandler = async (req, res) => {
  try {
    const templates = getDefaultTemplates();
    return res.status(200).json({ templates });
  } catch (err) {
    console.error('Get default templates error:', err);
    return res.status(500).json({ error: 'Failed to fetch default templates.' });
  }
};

// Create template
const createTemplateHandler = async (req, res) => {
  const userId = req.user.userId;
  const { name, title, description, color, duration } = req.body;

  if (!name || !title) {
    return res.status(400).json({ error: 'Template name and event title are required.' });
  }

  try {
    const template = await createTemplate(userId, name, title, description || '', color || '#667eea', duration || 60);
    return res.status(201).json({ message: 'Template created successfully.', template });
  } catch (err) {
    console.error('Create template error:', err);
    return res.status(500).json({ error: 'Failed to create template.' });
  }
};

// Get single template
const getTemplateHandler = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const template = await getTemplateById(parseInt(id), userId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }
    return res.status(200).json({ template });
  } catch (err) {
    console.error('Get template error:', err);
    return res.status(500).json({ error: 'Failed to fetch template.' });
  }
};

// Update template
const updateTemplateHandler = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const updates = req.body;

  try {
    const template = await getTemplateById(parseInt(id), userId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    const updatedTemplate = await updateTemplate(parseInt(id), userId, updates);
    return res.status(200).json({ message: 'Template updated successfully.', template: updatedTemplate });
  } catch (err) {
    console.error('Update template error:', err);
    return res.status(500).json({ error: 'Failed to update template.' });
  }
};

// Delete template
const deleteTemplateHandler = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const template = await getTemplateById(parseInt(id), userId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    await deleteTemplate(parseInt(id), userId);
    return res.status(200).json({ message: 'Template deleted successfully.' });
  } catch (err) {
    console.error('Delete template error:', err);
    return res.status(500).json({ error: 'Failed to delete template.' });
  }
};

module.exports = {
  getTemplatesHandler,
  getUserTemplatesHandler,
  getDefaultTemplatesHandler,
  createTemplateHandler,
  getTemplateHandler,
  updateTemplateHandler,
  deleteTemplateHandler,
};
