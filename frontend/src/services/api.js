import axios from 'axios';
import cacheManager from '../utils/cacheManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (username, email, password, confirmPassword) =>
    api.post('/auth/register', { username, email, password, confirmPassword }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: () =>
    api.post('/auth/refresh'),
};

// Events API calls with caching support
export const eventsAPI = {
  createEvent: (title, description, startTime, endTime, color) => {
    // Invalidate relevant caches on create
    cacheManager.invalidatePattern('events');
    return api.post('/events', { title, description, startTime, endTime, color });
  },
  
  getEvents: (startDate = null, endDate = null) => {
    const cacheKey = `events_range_${startDate}_${endDate}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      console.log('📦 Events from cache (range)');
      return Promise.resolve(cached);
    }
    
    return api.get('/events', { params: { startDate, endDate } })
      .then(response => {
        cacheManager.set(cacheKey, response, 3 * 60 * 1000); // 3 min TTL
        return response;
      });
  },
  
  getEventsByDay: (date) => {
    const cacheKey = `events_day_${date}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      console.log('📦 Events from cache (day)');
      return Promise.resolve(cached);
    }
    
    return api.get('/events/day', { params: { date } })
      .then(response => {
        cacheManager.set(cacheKey, response, 2 * 60 * 1000); // 2 min TTL
        return response;
      });
  },
  
  getEventsByMonth: (year, month) => {
    const cacheKey = `events_month_${year}_${month}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      console.log('📦 Events from cache (month)');
      return Promise.resolve(cached);
    }
    
    return api.get('/events/month', { params: { year, month } })
      .then(response => {
        cacheManager.set(cacheKey, response, 5 * 60 * 1000); // 5 min TTL
        return response;
      });
  },
  
  updateEvent: (id, updates) => {
    // Invalidate relevant caches on update
    cacheManager.invalidatePattern('events');
    return api.put(`/events/${id}`, updates);
  },
  
  deleteEvent: (id) => {
    // Invalidate relevant caches on delete
    cacheManager.invalidatePattern('events');
    return api.delete(`/events/${id}`);
  },
};

export default api;
