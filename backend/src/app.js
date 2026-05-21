require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database'); // Initialize database

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/user', require('./routes/user'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/notifications', require('./routes/notifications'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
});
