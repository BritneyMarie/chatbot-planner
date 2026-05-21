const { 
  createEvent, 
  createRecurringEvent, 
  getEventsByUser, 
  getRecurringEventsByUser, 
  getEventById, 
  updateEvent, 
  updateRecurringEvent, 
  deleteEvent, 
  getEventsByDay, 
  getEventsByMonth,
  searchEvents,
  getEventsByColor,
  getEventsWithFilter,
} = require('../models/Event');

// Create event
const createEventHandler = async (req, res) => {
  const { title, description, startTime, endTime, color } = req.body;
  const userId = req.user.userId;

  // Validation
  if (!title || !startTime || !endTime) {
    return res.status(400).json({ error: 'Title, start time, and end time are required.' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return res.status(400).json({ error: 'Start time must be before end time.' });
  }

  try {
    const event = await createEvent(userId, title, description || '', start, end, color);
    return res.status(201).json({ message: 'Event created successfully.', event });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ error: 'Failed to create event.' });
  }
};

// Get all events for user (with optional date range)
const getEventsHandler = async (req, res) => {
  const userId = req.user.userId;
  const { startDate, endDate } = req.query;

  try {
    const events = await getEventsByUser(
      userId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
    return res.status(200).json({ events });
  } catch (err) {
    console.error('Get events error:', err);
    return res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

// Get events for a specific day
const getEventsByDayHandler = async (req, res) => {
  const userId = req.user.userId;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date query parameter is required.' });
  }

  try {
    const events = await getEventsByDay(userId, new Date(date));
    return res.status(200).json({ events });
  } catch (err) {
    console.error('Get events by day error:', err);
    return res.status(500).json({ error: 'Failed to fetch events for day.' });
  }
};

// Get events for a specific month
const getEventsByMonthHandler = async (req, res) => {
  const userId = req.user.userId;
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: 'Year and month query parameters are required.' });
  }

  try {
    const events = await getEventsByMonth(userId, parseInt(year), parseInt(month));
    return res.status(200).json({ events });
  } catch (err) {
    console.error('Get events by month error:', err);
    return res.status(500).json({ error: 'Failed to fetch events for month.' });
  }
};

// Update event
const updateEventHandler = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const updates = req.body;

  try {
    // Verify event belongs to user
    const event = await getEventById(parseInt(id), userId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Validate time if provided
    if (updates.startTime && updates.endTime) {
      const start = new Date(updates.startTime);
      const end = new Date(updates.endTime);
      if (start >= end) {
        return res.status(400).json({ error: 'Start time must be before end time.' });
      }
    }

    const updatedEvent = await updateEvent(parseInt(id), userId, updates);
    return res.status(200).json({ message: 'Event updated successfully.', event: updatedEvent });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({ error: 'Failed to update event.' });
  }
};

// Delete event
const deleteEventHandler = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Verify event belongs to user
    const event = await getEventById(parseInt(id), userId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    await deleteEvent(parseInt(id), userId);
    return res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({ error: 'Failed to delete event.' });
  }
};

// Create recurring event
const createRecurringEventHandler = async (req, res) => {
  const { title, description, startTime, endTime, color, recurrencePattern } = req.body;
  const userId = req.user.userId;

  // Validation
  if (!title || !startTime || !endTime || !recurrencePattern) {
    return res.status(400).json({ error: 'Title, start time, end time, and recurrence pattern are required.' });
  }

  const validPatterns = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'];
  if (!validPatterns.includes(recurrencePattern)) {
    return res.status(400).json({ error: `Recurrence pattern must be one of: ${validPatterns.join(', ')}` });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return res.status(400).json({ error: 'Start time must be before end time.' });
  }

  try {
    const event = await createRecurringEvent(userId, title, description || '', start, end, color, recurrencePattern);
    return res.status(201).json({ message: 'Recurring event created successfully.', event });
  } catch (err) {
    console.error('Create recurring event error:', err);
    return res.status(500).json({ error: 'Failed to create recurring event.' });
  }
};

// Get events with filters and search
const getFilteredEventsHandler = async (req, res) => {
  const userId = req.user.userId;
  const { color, search, startDate, endDate, recurring } = req.query;

  try {
    const filters = {};
    if (color) filters.color = color;
    if (search) filters.searchTerm = search;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (recurring !== undefined) filters.isRecurring = recurring === 'true';

    const events = await getEventsWithFilter(userId, filters);
    return res.status(200).json({ events });
  } catch (err) {
    console.error('Get filtered events error:', err);
    return res.status(500).json({ error: 'Failed to fetch filtered events.' });
  }
};

// Search events
const searchEventsHandler = async (req, res) => {
  const userId = req.user.userId;
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  try {
    const events = await searchEvents(userId, q);
    return res.status(200).json({ events });
  } catch (err) {
    console.error('Search events error:', err);
    return res.status(500).json({ error: 'Failed to search events.' });
  }
};

// Get events by color
const getEventsByColorHandler = async (req, res) => {
  const userId = req.user.userId;
  const { color } = req.query;

  if (!color) {
    return res.status(400).json({ error: 'Color query parameter is required.' });
  }

  try {
    const events = await getEventsByColor(userId, color);
    return res.status(200).json({ events });
  } catch (err) {
    console.error('Get events by color error:', err);
    return res.status(500).json({ error: 'Failed to fetch events by color.' });
  }
};

// Get recurring events (expanded)
const getRecurringEventsHandler = async (req, res) => {
  const userId = req.user.userId;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' });
  }

  try {
    const events = await getRecurringEventsByUser(userId, startDate, endDate);
    return res.status(200).json({ events });
  } catch (err) {
    console.error('Get recurring events error:', err);
    return res.status(500).json({ error: 'Failed to fetch recurring events.' });
  }
};

module.exports = {
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
};
