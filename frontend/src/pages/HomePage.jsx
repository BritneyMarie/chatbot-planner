import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome, {user?.username || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mb-8">
          You're now logged in to the Chatbot-Assisted Weekly Planner
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar placeholder */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Calendar</h2>
            <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-600 text-center">
                Calendar component coming in Phase 4 with day/week/month/year views
              </p>
            </div>
          </div>

          {/* Chatbot placeholder */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🤖 Chatbot Assistant</h2>
            <div className="h-64 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-600 text-center">
                Chatbot component coming in Phase 6 with AI integration
              </p>
            </div>
          </div>
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
            <p>✅ Phase 3: Frontend Auth & Layout (Current)</p>
            <p>⏳ Phase 4: Calendar Component</p>
            <p>⏳ Phase 5: Onboarding Tour & Settings</p>
            <p>⏳ Phase 6: Chatbot Integration</p>
            <p>⏳ Phase 7: Theming & Customization</p>
            <p>⏳ Phase 8: Polish & Deployment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
