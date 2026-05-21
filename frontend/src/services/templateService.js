import api from './api';
import cacheManager from '../utils/cacheManager';

// Get all templates (user + default) with caching
export const getTemplates = async () => {
  try {
    const cached = cacheManager.get('templates_all');
    if (cached) {
      console.log('📦 All templates from cache');
      return cached.data;
    }

    const response = await api.get('/templates');
    cacheManager.set('templates_all', response.data, 10 * 60 * 1000); // 10 min TTL
    return response.data;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    throw error;
  }
};

// Get user templates only with caching
export const getUserTemplates = async () => {
  try {
    const cached = cacheManager.get('templates_user');
    if (cached) {
      console.log('📦 User templates from cache');
      return cached.data.templates;
    }

    const response = await api.get('/templates/user');
    cacheManager.set('templates_user', response.data, 10 * 60 * 1000); // 10 min TTL
    return response.data.templates;
  } catch (error) {
    console.error('Failed to fetch user templates:', error);
    throw error;
  }
};

// Get default templates with caching
export const getDefaultTemplates = async () => {
  try {
    const cached = cacheManager.get('templates_defaults');
    if (cached) {
      console.log('📦 Default templates from cache');
      return cached.data.templates;
    }

    const response = await api.get('/templates/defaults');
    cacheManager.set('templates_defaults', response.data, 15 * 60 * 1000); // 15 min TTL (rarely changes)
    return response.data.templates;
  } catch (error) {
    console.error('Failed to fetch default templates:', error);
    throw error;
  }
};

// Create template with cache invalidation
export const createTemplate = async (templateData) => {
  try {
    // Invalidate template caches
    cacheManager.invalidatePattern('templates');
    
    const response = await api.post('/templates', templateData);
    return response.data.template;
  } catch (error) {
    console.error('Failed to create template:', error);
    throw error;
  }
};

// Get single template with caching
export const getTemplate = async (id) => {
  try {
    const cacheKey = `template_${id}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      console.log('📦 Template from cache');
      return cached.data.template;
    }

    const response = await api.get(`/templates/${id}`);
    cacheManager.set(cacheKey, response.data, 10 * 60 * 1000); // 10 min TTL
    return response.data.template;
  } catch (error) {
    console.error('Failed to fetch template:', error);
    throw error;
  }
};

// Update template with cache invalidation
export const updateTemplate = async (id, updates) => {
  try {
    // Invalidate template caches
    cacheManager.invalidatePattern('templates');
    cacheManager.invalidate(`template_${id}`);
    
    const response = await api.put(`/templates/${id}`, updates);
    return response.data.template;
  } catch (error) {
    console.error('Failed to update template:', error);
    throw error;
  }
};

// Delete template with cache invalidation
export const deleteTemplate = async (id) => {
  try {
    // Invalidate template caches
    cacheManager.invalidatePattern('templates');
    cacheManager.invalidate(`template_${id}`);
    
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
