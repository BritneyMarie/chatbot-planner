const express = require('express');
const { 
  createEventHandler, 
  getEventsHandler, 
  getEventsByDayHandler,
  getEventsByMonthHandler,
  updateEventHandler, 
  deleteEventHandler 
} = require('../controllers/eventController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All event routes require authentication
router.use(verifyToken);

// Create event
router.post('/', createEventHandler);

// Get all events (with optional date range)
router.get('/', getEventsHandler);

// Get events for a specific day
router.get('/day', getEventsByDayHandler);

// Get events for a specific month
router.get('/month', getEventsByMonthHandler);

// Update event
router.put('/:id', updateEventHandler);

// Delete event
router.delete('/:id', deleteEventHandler);

module.exports = router;
