import api from './api';
import cacheManager from '../utils/cacheManager';

// Get filtered events with caching
export const getFilteredEvents = async (filters = {}) => {
  try {
    const cacheKey = `filtered_${JSON.stringify(filters)}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      console.log('📦 Filtered events from cache');
      return cached.data.events;
    }

    const params = new URLSearchParams();
    if (filters.color) params.append('color', filters.color);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.recurring !== undefined) params.append('recurring', filters.recurring);

    const response = await api.get(`/events/filter?${params.toString()}`);
    cacheManager.set(cacheKey, response.data, 2 * 60 * 1000); // 2 min TTL
    return response.data.events;
  } catch (error) {
    console.error('Failed to fetch filtered events:', error);
    throw error;
  }
};

// Search events with caching
export const searchEvents = async (query) => {
  try {
    const cacheKey = `search_${query}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      console.log('📦 Search results from cache');
      return cached.data.events;
    }

    const response = await api.get(`/events/search?q=${encodeURIComponent(query)}`);
    cacheManager.set(cacheKey, response.data, 3 * 60 * 1000); // 3 min TTL
    return response.data.events;
  } catch (error) {
    console.error('Failed to search events:', error);
    throw error;
  }
};

// Get events by color with caching
export const getEventsByColor = async (color) => {
  try {
    const cacheKey = `color_${color}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      console.log('📦 Color events from cache');
      return cached.data.events;
    }

    const response = await api.get(`/events/by-color?color=${encodeURIComponent(color)}`);
    cacheManager.set(cacheKey, response.data, 4 * 60 * 1000); // 4 min TTL
    return response.data.events;
  } catch (error) {
    console.error('Failed to fetch events by color:', error);
    throw error;
  }
};

// Get recurring events with caching
export const getRecurringEvents = async (startDate, endDate) => {
  try {
    const cacheKey = `recurring_${startDate}_${endDate}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      console.log('📦 Recurring events from cache');
      return cached.data.events;
    }

    const response = await api.get(`/events/recurring?startDate=${startDate}&endDate=${endDate}`);
    cacheManager.set(cacheKey, response.data, 5 * 60 * 1000); // 5 min TTL
    return response.data.events;
  } catch (error) {
    console.error('Failed to fetch recurring events:', error);
    throw error;
  }
};

// Create recurring event with cache invalidation
export const createRecurringEvent = async (eventData) => {
  try {
    // Invalidate event caches on create
    cacheManager.invalidatePattern('recurring');
    cacheManager.invalidatePattern('filtered');
    cacheManager.invalidatePattern('search');
    
    const response = await api.post('/events/recurring', eventData);
    return response.data.event;
  } catch (error) {
    console.error('Failed to create recurring event:', error);
    throw error;
  }
};
