import api from './api';

// Get all templates (user + default)
export const getTemplates = async () => {
  try {
    const response = await api.get('/templates');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    throw error;
  }
};

// Get user templates only
export const getUserTemplates = async () => {
  try {
    const response = await api.get('/templates/user');
    return response.data.templates;
  } catch (error) {
    console.error('Failed to fetch user templates:', error);
    throw error;
  }
};

// Get default templates
export const getDefaultTemplates = async () => {
  try {
    const response = await api.get('/templates/defaults');
    return response.data.templates;
  } catch (error) {
    console.error('Failed to fetch default templates:', error);
    throw error;
  }
};

// Create template
export const createTemplate = async (templateData) => {
  try {
    const response = await api.post('/templates', templateData);
    return response.data.template;
  } catch (error) {
    console.error('Failed to create template:', error);
    throw error;
  }
};

// Get single template
export const getTemplate = async (id) => {
  try {
    const response = await api.get(`/templates/${id}`);
    return response.data.template;
  } catch (error) {
    console.error('Failed to fetch template:', error);
    throw error;
  }
};

// Update template
export const updateTemplate = async (id, updates) => {
  try {
    const response = await api.put(`/templates/${id}`, updates);
    return response.data.template;
  } catch (error) {
    console.error('Failed to update template:', error);
    throw error;
  }
};

// Delete template
export const deleteTemplate = async (id) => {
  try {
    await api.delete(`/templates/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete template:', error);
    throw error;
  }
};

// Create event from template
export const createEventFromTemplate = (template, startTime) => {
  return {
    title: template.event_title || template.eventTitle,
    description: template.event_description || template.eventDescription || '',
    color: template.event_color || template.eventColor || '#667eea',
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(new Date(startTime).getTime() + (template.event_duration || template.eventDuration || 60) * 60000).toISOString(),
  };
};
