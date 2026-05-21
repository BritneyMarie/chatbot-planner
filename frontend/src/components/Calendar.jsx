import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval as eachDayOfIntervalWeek, addMonths, subMonths, addDays, subDays } from 'date-fns';
import api from '../services/api';
import CalendarFilter from './CalendarFilter';
import './Calendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const Calendar = ({ onEventClick }) => {
  const [view, setView] = useState('month'); // 'day', 'week', 'month', 'year'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    color: '',
    search: '',
    startDate: '',
    endDate: '',
    recurring: false,
  });

  // Fetch events for current date
  useEffect(() => {
    fetchEvents();
  }, [currentDate, view, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // Build request
      let endpoint = '/events/month';
      const params = { year, month };

      // If filters are active, use filter endpoint
      if (filters.color || filters.search || filters.startDate || filters.endDate || filters.recurring) {
        endpoint = '/events/filter';
        delete params.year;
        delete params.month;
        if (filters.color) params.color = filters.color;
        if (filters.search) params.search = filters.search;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.recurring) params.recurring = true;
      }

      const response = await api.get(endpoint, { params });
      setEvents(response.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, date);
    });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  // Month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="calendar-month">
        <div className="calendar-header">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>&lt;</button>
          <h2>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>&gt;</button>
        </div>

        <div className="calendar-weekdays">
          {DAYS.map(day => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {calendarDays.map(date => {
            const dayEvents = getEventsForDay(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isToday = isSameDay(date, new Date());

            return (
              <div
                key={date.toISOString()}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => onEventClick?.(date)}
              >
                <div className="day-number">{format(date, 'd')}</div>
                <div className="day-events">
                  {dayEvents.slice(0, 2).map(event => (
                    <div key={event.id} className="event-dot" style={{ backgroundColor: event.color }} title={event.title}>
                      {event.title.substring(0, 10)}
                    </div>
                  ))}
                  {dayEvents.length > 2 && <div className="event-more">+{dayEvents.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const weekDays = eachDayOfIntervalWeek({ start: weekStart, end: weekEnd });

    return (
      <div className="calendar-week">
        <div className="calendar-header">
          <button onClick={() => setCurrentDate(subDays(currentDate, 7))}>&lt;</button>
          <h2>
            Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))}>&gt;</button>
        </div>

        <div className="week-days">
          {weekDays.map(date => {
            const dayEvents = getEventsForDay(date);
            const isToday = isSameDay(date, new Date());

            return (
              <div key={date.toISOString()} className={`week-day ${isToday ? 'today' : ''}`}>
                <div className="day-header">
                  <div className="day-name">{format(date, 'EEE')}</div>
                  <div className="day-date">{format(date, 'd')}</div>
                </div>
                <div className="day-events-list">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="event-card"
                      style={{ backgroundColor: event.color }}
                      onClick={() => onEventClick?.(date, event)}
                    >
                      <div className="event-time">{format(new Date(event.start_time), 'HH:mm')}</div>
                      <div className="event-title">{event.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Day view
  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    const isToday = isSameDay(currentDate, new Date());

    return (
      <div className="calendar-day-view">
        <div className="calendar-header">
          <button onClick={() => setCurrentDate(subDays(currentDate, 1))}>&lt;</button>
          <h2>{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))}>&gt;</button>
        </div>

        {isToday && <div className="today-badge">Today</div>}

        <div className="day-timeline">
          {dayEvents.length > 0 ? (
            dayEvents.map(event => (
              <div key={event.id} className="timeline-event" style={{ backgroundColor: event.color }}>
                <div className="event-time">{format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}</div>
                <div className="event-title">{event.title}</div>
                {event.description && <div className="event-description">{event.description}</div>}
              </div>
            ))
          ) : (
            <div className="no-events">No events scheduled for today</div>
          )}
        </div>
      </div>
    );
  };

  // Year view
  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i, 1);
      return { date, month: i + 1 };
    });

    return (
      <div className="calendar-year">
        <div className="calendar-header">
          <button onClick={() => setCurrentDate(new Date(year - 1, 0, 1))}>&lt;</button>
          <h2>{year}</h2>
          <button onClick={() => setCurrentDate(new Date(year + 1, 0, 1))}>&gt;</button>
        </div>

        <div className="year-grid">
          {months.map(({ date, month }) => {
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(monthStart);
            const calendarStart = startOfWeek(monthStart);
            const calendarEnd = endOfWeek(monthEnd);
            const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

            return (
              <div key={month} className="year-month">
                <h3>{MONTHS[month - 1]}</h3>
                <div className="mini-calendar">
                  <div className="mini-weekdays">
                    {DAYS.map(day => (
                      <span key={day}>{day[0]}</span>
                    ))}
                  </div>
                  <div className="mini-days">
                    {calendarDays.map(d => {
                      const dayEvents = getEventsForDay(d);
                      return (
                        <span
                          key={d.toISOString()}
                          className={`mini-day ${!isSameMonth(d, date) ? 'other' : ''} ${dayEvents.length > 0 ? 'has-event' : ''}`}
                          onClick={() => {
                            setCurrentDate(d);
                            setView('day');
                          }}
                        >
                          {format(d, 'd')}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-controls">
        <div className="view-buttons">
          <button
            className={`view-btn ${view === 'day' ? 'active' : ''}`}
            onClick={() => setView('day')}
          >
            Day
          </button>
          <button
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button
            className={`view-btn ${view === 'year' ? 'active' : ''}`}
            onClick={() => setView('year')}
          >
            Year
          </button>
        </div>
        <button className="today-btn" onClick={() => setCurrentDate(new Date())}>
          Today
        </button>
      </div>

      <CalendarFilter
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />

      {error && <div className="calendar-error">{error}</div>}
      {loading && <div className="calendar-loading">Loading events...</div>}

      <div className="calendar-view">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
        {view === 'year' && renderYearView()}
      </div>
    </div>
  );
};

export default Calendar;
