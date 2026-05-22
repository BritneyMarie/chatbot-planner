import React, { useState } from 'react';
import './RecurringEventForm.css';

const RecurringEventForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      color: '#B97D7B',
      recurrencePattern: 'weekly',
    }
  );

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const patterns = [
    { value: 'daily', label: '🔄 Daily' },
    { value: 'weekly', label: '📅 Weekly' },
    { value: 'biweekly', label: '📆 Bi-Weekly' },
    { value: 'monthly', label: '📋 Monthly' },
    { value: 'yearly', label: '🎆 Yearly' },
  ];

  return (
    <form className="recurring-event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Event Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., Team Meeting"
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Add event details..."
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Date & Time *</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            className={errors.startTime ? 'error' : ''}
          />
          {errors.startTime && <span className="error-message">{errors.startTime}</span>}
        </div>

        <div className="form-group">
          <label>End Date & Time *</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
            className={errors.endTime ? 'error' : ''}
          />
          {errors.endTime && <span className="error-message">{errors.endTime}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Recurrence Pattern *</label>
          <select
            name="recurrencePattern"
            value={formData.recurrencePattern}
            onChange={handleInputChange}
          >
            {patterns.map((pattern) => (
              <option key={pattern.value} value={pattern.value}>
                {pattern.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Color</label>
          <div className="color-picker">
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
            />
            <span className="color-value">{formData.color}</span>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Create Recurring Event
        </button>
      </div>
    </form>
  );
};

export default RecurringEventForm;
