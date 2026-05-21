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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      {/* Navigation Bar */}
      <nav className="max-w-6xl mx-auto mb-8 flex justify-between items-center bg-white rounded-lg shadow-lg p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Planner</h1>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-gray-600 text-sm">{user?.username}</span>
          <NotificationBadge onClick={() => setShowNotificationCenter(true)} />
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-medium hover:bg-indigo-200 transition"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition"
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome, {user?.username || 'User'}! 👋
        </h2>
        <p className="text-gray-600 mb-8">
          You're now logged in to the Chatbot-Assisted Weekly Planner
        </p>

        {/* Calendar component */}
        <div className="mb-12">
          <Calendar key={calendarRefresh} onEventClick={handleCalendarEventClick} />
        </div>

        {/* Feature overview */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">✨ Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📅</div>
              <h3 className="font-semibold text-gray-700">Multi-View Calendar</h3>
              <p className="text-sm text-gray-600 mt-2">Day, week, month, and year views</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🤖</div>
              <h3 className="font-semibold text-gray-700">AI Chatbot</h3>
              <p className="text-sm text-gray-600 mt-2">Weather, jokes, trivia, event creation</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎨</div>
              <h3 className="font-semibold text-gray-700">Customizable</h3>
              <p className="text-sm text-gray-600 mt-2">Colors, fonts, and themes</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-12 bg-indigo-50 rounded-lg p-6 border border-indigo-200">
          <h3 className="font-bold text-indigo-900 mb-3">🚀 Implementation Progress</h3>
          <div className="space-y-2 text-sm text-indigo-800">
            <p>✅ Phase 1: Project Structure & Setup</p>
            <p>✅ Phase 2: Database & Authentication</p>
            <p>✅ Phase 3: Frontend Auth & Layout</p>
            <p>✅ Phase 4: Calendar Component (Day/Week/Month/Year views)</p>
            <p>✅ Phase 5: Onboarding Tour & Settings</p>
            <p>✅ Phase 6: Chatbot Integration (OpenAI)</p>
            <p>✅ Phase 7A: Enhanced Chatbot (event creation, smart suggestions)</p>
            <p>🔄 Phase 7B: Notifications System — IN PROGRESS</p>
            <p>⏳ Phase 7C: Advanced calendar features</p>
            <p>⏳ Phase 7D: UI/UX Polish</p>
            <p>⏳ Phase 7E: Performance Optimization</p>
          </div>
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
