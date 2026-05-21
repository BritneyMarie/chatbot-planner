import React, { useState, useEffect } from 'react';
import * as templateService from '../services/templateService';
import './TemplateSelector.css';

const TemplateSelector = ({ onSelectTemplate, onCreateTemplate, onCancel }) => {
  const [templates, setTemplates] = useState([]);
  const [userTemplates, setUserTemplates] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    title: '',
    description: '',
    color: '#667eea',
    duration: 60,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await templateService.getTemplates();
      setTemplates(data.defaultTemplates || []);
      setUserTemplates(data.userTemplates || []);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();

    if (!newTemplate.name.trim() || !newTemplate.title.trim()) {
      setError('Template name and event title are required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const created = await templateService.createTemplate(newTemplate);
      setUserTemplates((prev) => [created, ...prev]);
      setNewTemplate({
        name: '',
        title: '',
        description: '',
        color: '#667eea',
        duration: 60,
      });
      setShowCreateForm(false);
      if (onCreateTemplate) {
        onCreateTemplate(created);
      }
    } catch (err) {
      setError('Failed to create template');
      console.error('Error creating template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templateService.deleteTemplate(id);
        setUserTemplates((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        setError('Failed to delete template');
        console.error('Error deleting template:', err);
      }
    }
  };

  return (
    <div className="template-selector">
      <div className="selector-header">
        <h3>📋 Event Templates</h3>
        <button className="btn-close" onClick={onCancel}>
          ✕
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="template-tabs">
        <button className="tab-btn active">Default Templates</button>
        {userTemplates.length > 0 && (
          <button className="tab-btn">My Templates ({userTemplates.length})</button>
        )}
      </div>

      {!showCreateForm ? (
        <>
          <div className="templates-grid">
            {templates.map((template) => (
              <div
                key={template.id || template.template_name}
                className="template-card"
                onClick={() => handleTemplateSelect(template)}
              >
                <div
                  className="template-color"
                  style={{ backgroundColor: template.event_color || template.eventColor || '#667eea' }}
                />
                <div className="template-info">
                  <h4>{template.template_name || template.templateName}</h4>
                  <p>{template.event_title || template.eventTitle}</p>
                  <small>
                    ⏱️ {template.event_duration || template.eventDuration || 60} min
                  </small>
                </div>
                <button className="btn-select">Select</button>
              </div>
            ))}
          </div>

          {userTemplates.length > 0 && (
            <div className="user-templates">
              <h4>My Templates</h4>
              <div className="templates-grid">
                {userTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="template-card user-template"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div
                      className="template-color"
                      style={{ backgroundColor: template.event_color }}
                    />
                    <div className="template-info">
                      <h4>{template.template_name}</h4>
                      <p>{template.event_title}</p>
                      <small>⏱️ {template.event_duration} min</small>
                    </div>
                    <div className="template-actions">
                      <button
                        className="btn-select"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        Select
                      </button>
                      <button
                        className="btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="template-actions-footer">
            <button
              className="btn-create-template"
              onClick={() => setShowCreateForm(true)}
            >
              + Create New Template
            </button>
          </div>
        </>
      ) : (
        <form className="create-template-form" onSubmit={handleCreateTemplate}>
          <div className="form-group">
            <label>Template Name *</label>
            <input
              type="text"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              placeholder="e.g., Daily Standup"
            />
          </div>

          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              value={newTemplate.title}
              onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
              placeholder="e.g., Standup"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              placeholder="Event details..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={newTemplate.duration}
                onChange={(e) => setNewTemplate({ ...newTemplate, duration: parseInt(e.target.value) })}
                min="5"
                max="1440"
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={newTemplate.color}
                  onChange={(e) => setNewTemplate({ ...newTemplate, color: e.target.value })}
                  style={{ width: '50px', height: '50px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{newTemplate.color}</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowCreateForm(false)}
            >
              Back
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TemplateSelector;
