import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Onboarding.css';

const Onboarding = ({ onComplete }) => {
  const { theme, updateTheme, completeOnboarding } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    font: theme.font,
    notificationsEnabled: theme.notificationsEnabled,
    language: theme.language,
  });

  const steps = [
    {
      title: 'Welcome! 👋',
      description: 'Welcome to Chatbot-Assisted Weekly Planner. This onboarding will help you get started.',
      component: () => (
        <div className="onboarding-step-content">
          <p>Let's customize your experience and learn the basics.</p>
          <p>This should only take a minute!</p>
        </div>
      ),
    },
    {
      title: 'Customize Your Theme 🎨',
      description: 'Choose your preferred colors and font to personalize the app.',
      component: () => (
        <div className="onboarding-step-content">
          <div className="theme-selector">
            <div className="color-picker">
              <label>Primary Color</label>
              <input
                type="color"
                value={preferences.primaryColor}
                onChange={(e) => setPreferences({ ...preferences, primaryColor: e.target.value })}
              />
              <span>{preferences.primaryColor}</span>
            </div>

            <div className="color-picker">
              <label>Secondary Color</label>
              <input
                type="color"
                value={preferences.secondaryColor}
                onChange={(e) => setPreferences({ ...preferences, secondaryColor: e.target.value })}
              />
              <span>{preferences.secondaryColor}</span>
            </div>

            <div className="font-selector">
              <label>Font</label>
              <select value={preferences.font} onChange={(e) => setPreferences({ ...preferences, font: e.target.value })}>
                <option value="Poppins">Poppins (Modern)</option>
                <option value="Inter">Inter (Clean)</option>
                <option value="Roboto">Roboto (Professional)</option>
                <option value="Georgia">Georgia (Classic)</option>
                <option value="Courier New">Courier New (Monospace)</option>
              </select>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Calendar Overview 📅',
      description: 'Manage your events with our powerful calendar views.',
      component: () => (
        <div className="onboarding-step-content">
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">📆</span>
              <div>
                <strong>Day View</strong>
                <p>See your full schedule for a single day</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <div>
                <strong>Week View</strong>
                <p>Get an overview of your week at a glance</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <div>
                <strong>Month View</strong>
                <p>Navigate through months and mark important dates</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <div>
                <strong>Year View</strong>
                <p>See all 12 months in one view</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Notifications 🔔',
      description: 'Stay on top of your events with notifications.',
      component: () => (
        <div className="onboarding-step-content">
          <div className="notification-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={preferences.notificationsEnabled}
                onChange={(e) => setPreferences({ ...preferences, notificationsEnabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
              {preferences.notificationsEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
            </label>
            <p>You can always change this in settings later.</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Language & Region 🌍',
      description: 'Choose your preferred language.',
      component: () => (
        <div className="onboarding-step-content">
          <div className="language-selector">
            <label>Language</label>
            <select value={preferences.language} onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}>
              <option value="en">English</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
              <option value="pt">Português (Portuguese)</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      title: 'You\'re All Set! 🚀',
      description: 'Your account is ready. Let\'s get started!',
      component: () => (
        <div className="onboarding-step-content">
          <p>Your personalized calendar is ready to use.</p>
          <p>Start creating events and managing your time like never before!</p>
          <p className="text-small">Tip: You can access Settings anytime to customize your experience further.</p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      // Update theme with new preferences
      await updateTheme(preferences);
      // Mark onboarding as completed
      await completeOnboarding();
      onComplete();
    } catch (err) {
      console.error('Failed to finish onboarding:', err);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const step = steps[currentStep];

  return (
    <div className="onboarding-container">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <h1>{step.title}</h1>
          <p className="onboarding-subtitle">{step.description}</p>
        </div>

        <div className="onboarding-content">
          {step.component()}
        </div>

        <div className="onboarding-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">{currentStep + 1} of {steps.length}</span>
        </div>

        <div className="onboarding-buttons">
          <button
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            ← Previous
          </button>

          {isLastStep ? (
            <button
              className="btn btn-primary"
              onClick={handleFinish}
            >
              Get Started 🎉
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleNext}
            >
              Next →
            </button>
          )}
        </div>

        <button className="skip-btn" onClick={handleFinish}>
          Skip Tour
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
