import api from './api';

// Get filtered events
export const getFilteredEvents = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.color) params.append('color', filters.color);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.recurring !== undefined) params.append('recurring', filters.recurring);

    const response = await api.get(`/events/filter?${params.toString()}`);
    return response.data.events;
  } catch (error) {
    console.error('Failed to fetch filtered events:', error);
    throw error;
  }
};

// Search events
export const searchEvents = async (query) => {
  try {
    const response = await api.get(`/events/search?q=${encodeURIComponent(query)}`);
    return response.data.events;
  } catch (error) {
    console.error('Failed to search events:', error);
    throw error;
  }
};

// Get events by color
export const getEventsByColor = async (color) => {
  try {
    const response = await api.get(`/events/by-color?color=${encodeURIComponent(color)}`);
    return response.data.events;
  } catch (error) {
    console.error('Failed to fetch events by color:', error);
    throw error;
  }
};

// Get recurring events (expanded instances)
export const getRecurringEvents = async (startDate, endDate) => {
  try {
    const response = await api.get(`/events/recurring?startDate=${startDate}&endDate=${endDate}`);
    return response.data.events;
  } catch (error) {
    console.error('Failed to fetch recurring events:', error);
    throw error;
  }
};

// Create recurring event
export const createRecurringEvent = async (eventData) => {
  try {
    const response = await api.post('/events/recurring', eventData);
    return response.data.event;
  } catch (error) {
    console.error('Failed to create recurring event:', error);
    throw error;
  }
};
