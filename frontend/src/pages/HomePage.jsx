import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Calendar from '../components/Calendar';
import EventModal from '../components/EventModal';
import Onboarding from '../components/Onboarding';
import ChatBox from '../components/ChatBox';
import ChatBotButton from '../components/ChatBotButton';
import Toast from '../components/Toast';
import NotificationCenter from '../components/NotificationCenter';
import NotificationBadge from '../components/NotificationBadge';
import HabitTracker from '../components/HabitTracker';
import GoalsList from '../components/GoalsList';
import TodoList from '../components/TodoList';
import PriorityNotes from '../components/PriorityNotes';
import notificationService from '../services/notificationService';

export const HomePage = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(!theme.onboardingCompleted);
  const [showChatBox, setShowChatBox] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [toast, setToast] = useState(null);

  // Poll for new notifications
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const data = await notificationService.getUnreadNotifications();
        if (data.unreadCount > 0) {
          const recentNotifications = data.notifications.filter(n => {
            const notifTime = new Date(n.scheduled_time).getTime();
            const now = new Date().getTime();
            return (now - notifTime) < 300000;
          });

          if (recentNotifications.length > 0) {
            const latestNotif = recentNotifications[0];
            showToast(latestNotif.message, 'reminder');
          }
        }
      } catch (err) {
        console.error('Failed to check notifications:', err);
      }
    };

    const interval = setInterval(checkNotifications, 30000);
    checkNotifications();

    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleCalendarEventClick = (date, event = null) => {
    setSelectedDate(date);
    setSelectedEvent(event || null);
    setShowEventModal(true);
  };

  const handleEventSaved = () => {
    setCalendarRefresh(prev => prev + 1);
    showToast('Event created successfully!', 'success');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--color-bg, #F5F0EB)' }}>
      {/* Navigation Bar */}
      <nav className="max-w-6xl mx-auto mb-8" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--color-card, #FFFFFF)', borderRadius: '16px',
        boxShadow: '0 0 20px rgba(0,0,0,.08)', padding: '12px 20px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text, #3D3326)' }}>Planner</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-text-muted, #8A7E72)', fontSize: '14px' }}>{user?.username}</span>
          <NotificationBadge onClick={() => setShowNotificationCenter(true)} />
          <button
            onClick={() => navigate('/settings')}
            style={{
              background: 'var(--color-highlight, #ECC4C3)',
              color: 'var(--color-accent, #575527)',
              borderRadius: '8px', border: 'none', padding: '8px 16px',
              fontWeight: 600, cursor: 'pointer', fontSize: '14px'
            }}
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: '#ffe0e0', color: '#c33',
              borderRadius: '8px', border: 'none', padding: '8px 16px',
              fontWeight: 600, cursor: 'pointer', fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text, #3D3326)', marginBottom: '6px' }}>
          Welcome, {user?.username || 'User'}!
        </h2>
        <p style={{ color: 'var(--color-text-muted, #8A7E72)', marginBottom: '24px', fontSize: '15px' }}>
          Your personal planner dashboard
        </p>

        {/* Calendar component */}
        <div className="mb-12">
          <Calendar key={calendarRefresh} onEventClick={handleCalendarEventClick} />
        </div>

        {/* Planner Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          marginTop: '32px',
        }}>
          <HabitTracker />
          <GoalsList />
          <TodoList />
          <PriorityNotes />
        </div>
      </div>

      {/* Modals */}
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onEventSaved={handleEventSaved}
        selectedDate={selectedDate}
        event={selectedEvent}
      />

      {/* Chatbot */}
      <ChatBotButton onClick={() => setShowChatBox(true)} />
      <ChatBox isOpen={showChatBox} onClose={() => setShowChatBox(false)} />

      {/* Notifications */}
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
