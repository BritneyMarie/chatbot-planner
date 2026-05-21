const { createEvent, getEventsByUser, getEventById, updateEvent, deleteEvent, getEventsByDay, getEventsByMonth } = require('../models/Event');

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

module.exports = {
  createEventHandler,
  getEventsHandler,
  getEventsByDayHandler,
  getEventsByMonthHandler,
  updateEventHandler,
  deleteEventHandler,
};
