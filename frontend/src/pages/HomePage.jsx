import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Calendar from '../components/Calendar';
import EventModal from '../components/EventModal';

export const HomePage = () => {
  const { user } = useAuth();
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const handleCalendarEventClick = (date, event = null) => {
    setSelectedDate(date);
    setSelectedEvent(event || null);
    setShowEventModal(true);
  };

  const handleEventSaved = () => {
    // Refresh calendar
    setCalendarRefresh(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome, {user?.username || 'User'}! 👋
        </h1>
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
            <p>🔄 Phase 4: Calendar Component (In Progress)</p>
            <p>⏳ Phase 5: Onboarding Tour & Settings</p>
            <p>⏳ Phase 6: Chatbot Integration</p>
            <p>⏳ Phase 7: Theming & Customization</p>
            <p>⏳ Phase 8: Polish & Deployment</p>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onEventSaved={handleEventSaved}
        selectedDate={selectedDate}
        event={selectedEvent}
      />
    </div>
  );
};

export default HomePage;
