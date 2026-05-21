import axios from 'axios';

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
      window.location.href = '/login';
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

// Events API calls
export const eventsAPI = {
  createEvent: (title, description, startTime, endTime, color) =>
    api.post('/events', { title, description, startTime, endTime, color }),
  
  getEvents: (startDate = null, endDate = null) =>
    api.get('/events', { params: { startDate, endDate } }),
  
  getEventsByDay: (date) =>
    api.get('/events/day', { params: { date } }),
  
  getEventsByMonth: (year, month) =>
    api.get('/events/month', { params: { year, month } }),
  
  updateEvent: (id, updates) =>
    api.put(`/events/${id}`, updates),
  
  deleteEvent: (id) =>
    api.delete(`/events/${id}`),
};

export default api;
