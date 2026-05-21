const express = require('express');
const { 
  createEventHandler, 
  getEventsHandler, 
  getEventsByDayHandler,
  getEventsByMonthHandler,
  updateEventHandler, 
  deleteEventHandler,
  createRecurringEventHandler,
  getFilteredEventsHandler,
  searchEventsHandler,
  getEventsByColorHandler,
  getRecurringEventsHandler,
} = require('../controllers/eventController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All event routes require authentication
router.use(verifyToken);

// Create event
router.post('/', createEventHandler);

// Create recurring event
router.post('/recurring', createRecurringEventHandler);

// Get all events (with optional date range)
router.get('/', getEventsHandler);

// Get recurring events (expanded with instances)
router.get('/recurring', getRecurringEventsHandler);

// Search events
router.get('/search', searchEventsHandler);

// Get events by color
router.get('/by-color', getEventsByColorHandler);

// Get filtered events
router.get('/filter', getFilteredEventsHandler);

// Get events for a specific day
router.get('/day', getEventsByDayHandler);

// Get events for a specific month
router.get('/month', getEventsByMonthHandler);

// Update event
router.put('/:id', updateEventHandler);

// Delete event
router.delete('/:id', deleteEventHandler);

module.exports = router;
