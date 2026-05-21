import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import RecurringEventForm from './RecurringEventForm';
import TemplateSelector from './TemplateSelector';
import * as eventService from '../services/eventService';
import * as templateService from '../services/templateService';
import './EventModal.css';

export const EventModal = ({ isOpen, onClose, onEventSaved, selectedDate, event = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    color: '#667eea',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState('regular'); // 'regular' or 'recurring'
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const startDateTime = format(date, "yyyy-MM-dd'T'HH:mm");
      const endDateTime = format(new Date(date.getTime() + 3600000), "yyyy-MM-dd'T'HH:mm");

      if (event) {
        // Edit mode
        setFormData({
          title: event.title,
          description: event.description || '',
          startTime: format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"),
          endTime: format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm"),
          color: event.color || '#667eea',
        });
      } else {
        // Create mode
        setFormData(prev => ({
          ...prev,
          startTime: startDateTime,
          endTime: endDateTime,
        }));
      }
    }
  }, [selectedDate, event, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title.trim()) {
      setError('Event title is required');
      setLoading(false);
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError('Start and end times are required');
      setLoading(false);
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (start >= end) {
      setError('Start time must be before end time');
      setLoading(false);
      return;
    }

    try {
      if (event) {
        // Update event
        await api.put(`/events/${event.id}`, {
          title: formData.title,
          description: formData.description,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          color: formData.color,
        });
      } else {
        // Create event
        await api.post('/events', {
          title: formData.title,
          description: formData.description,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          color: formData.color,
        });
      }

      onEventSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/events/${event.id}`);
      onEventSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete event');
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    const eventData = templateService.createEventFromTemplate(template, selectedDate || new Date());
    setFormData({
      title: eventData.title,
      description: eventData.description,
      startTime: format(new Date(eventData.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(eventData.endTime), "yyyy-MM-dd'T'HH:mm"),
      color: eventData.color,
    });
    setShowTemplateSelector(false);
  };

  const handleCreateRecurringEvent = async (recurringData) => {
    setError('');
    setLoading(true);

    try {
      const start = new Date(recurringData.startTime);
      const end = new Date(recurringData.endTime);

      await eventService.createRecurringEvent({
        title: recurringData.title,
        description: recurringData.description,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        color: recurringData.color,
        recurrencePattern: recurringData.recurrencePattern,
      });

      onEventSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create recurring event');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (showTemplateSelector) {
    return (
      <div className="event-modal-overlay" onClick={onClose}>
        <div className="event-modal template-modal" onClick={e => e.stopPropagation()}>
          <TemplateSelector
            onSelectTemplate={handleSelectTemplate}
            onCancel={() => setShowTemplateSelector(false)}
          />
        </div>
      </div>
    );
  }

  if (eventType === 'recurring' && !event) {
    return (
      <div className="event-modal-overlay" onClick={onClose}>
        <div className="event-modal" onClick={e => e.stopPropagation()}>
          <div className="event-modal-header">
            <h2>Create Recurring Event</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <RecurringEventForm
            onSubmit={handleCreateRecurringEvent}
            onCancel={() => setEventType('regular')}
            initialData={{
              startTime: format(selectedDate || new Date(), "yyyy-MM-dd'T'HH:mm"),
              endTime: format(new Date((selectedDate || new Date()).getTime() + 3600000), "yyyy-MM-dd'T'HH:mm"),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={e => e.stopPropagation()}>
        <div className="event-modal-header">
          <div className="modal-title-section">
            <h2>{event ? 'Edit Event' : 'New Event'}</h2>
            {!event && (
              <div className="event-type-tabs">
                <button
                  className={`tab-btn ${eventType === 'regular' ? 'active' : ''}`}
                  onClick={() => setEventType('regular')}
                >
                  📅 Regular
                </button>
                <button
                  className={`tab-btn ${eventType === 'recurring' ? 'active' : ''}`}
                  onClick={() => setEventType('recurring')}
                >
                  🔄 Recurring
                </button>
              </div>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="event-modal-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add event details"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="color">Color</label>
            <div className="color-picker">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
              <span className="color-preview" style={{ backgroundColor: formData.color }}></span>
            </div>
          </div>

          <div className="form-actions">
            {!event && (
              <button
                type="button"
                className="btn-template"
                onClick={() => setShowTemplateSelector(true)}
              >
                📋 Use Template
              </button>
            )}
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            {event && (
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
