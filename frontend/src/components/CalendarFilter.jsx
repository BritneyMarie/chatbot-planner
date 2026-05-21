import React, { useState, useEffect } from 'react';
import './CalendarFilter.css';

const CalendarFilter = ({ onFilterChange, onSearch, availableColors = [] }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);

  const defaultColors = [
    '#667eea',
    '#764ba2',
    '#f97316',
    '#ef4444',
    '#10b981',
    '#06b6d4',
    '#8b5cf6',
    '#ec4899',
  ];

  const colors = availableColors.length > 0 ? availableColors : defaultColors;

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  const handleColorChange = (color) => {
    const newColor = selectedColor === color ? '' : color;
    setSelectedColor(newColor);
    applyFilters({ color: newColor });
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    const newRange = { ...dateRange, [name]: value };
    setDateRange(newRange);
    applyFilters({ ...newRange });
  };

  const handleRecurringToggle = () => {
    const newState = !showRecurringOnly;
    setShowRecurringOnly(newState);
    applyFilters({ recurring: newState });
  };

  const applyFilters = (updates = {}) => {
    if (onFilterChange) {
      onFilterChange({
        color: updates.color !== undefined ? updates.color : selectedColor,
        search: updates.search !== undefined ? updates.search : searchTerm,
        startDate: updates.startDate !== undefined ? updates.startDate : dateRange.startDate,
        endDate: updates.endDate !== undefined ? updates.endDate : dateRange.endDate,
        recurring: updates.recurring !== undefined ? updates.recurring : showRecurringOnly,
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedColor('');
    setDateRange({ startDate: '', endDate: '' });
    setShowRecurringOnly(false);
    if (onFilterChange) {
      onFilterChange({
        color: '',
        search: '',
        startDate: '',
        endDate: '',
        recurring: false,
      });
    }
  };

  const hasActiveFilters = searchTerm || selectedColor || dateRange.startDate || dateRange.endDate || showRecurringOnly;

  return (
    <div className="calendar-filter">
      <div className="filter-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search events..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <button
          className={`filter-toggle ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          title="Toggle advanced filters"
        >
          ⚙️ {hasActiveFilters && <span className="filter-badge">{Object.values({ selectedColor, dateRange, showRecurringOnly }).filter(v => v).length}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-section">
            <h4>📅 Date Range</h4>
            <div className="date-range">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                placeholder="Start date"
              />
              <span className="separator">→</span>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                placeholder="End date"
              />
            </div>
          </div>

          <div className="filter-section">
            <h4>🎨 Color</h4>
            <div className="color-filter">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showRecurringOnly}
                onChange={handleRecurringToggle}
              />
              <span>🔄 Recurring Events Only</span>
            </label>
          </div>

          <div className="filter-actions">
            {hasActiveFilters && (
              <button
                className="btn-clear"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarFilter;
