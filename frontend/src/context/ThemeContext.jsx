import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const ThemeContext = createContext();

const DEFAULT_THEME = {
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  font: 'Poppins',
  chatbotIcon: '🤖',
  notificationsEnabled: true,
  language: 'en',
  onboardingCompleted: false,
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  // Fetch user preferences on mount
  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await api.get('/user/preferences');
      if (response.data.preferences) {
        const prefs = response.data.preferences;
        setTheme({
          primaryColor: prefs.theme_primary_color || DEFAULT_THEME.primaryColor,
          secondaryColor: prefs.theme_secondary_color || DEFAULT_THEME.secondaryColor,
          font: prefs.theme_font || DEFAULT_THEME.font,
          chatbotIcon: prefs.chatbot_icon || DEFAULT_THEME.chatbotIcon,
          notificationsEnabled: prefs.notifications_enabled ?? DEFAULT_THEME.notificationsEnabled,
          language: prefs.language || DEFAULT_THEME.language,
          onboardingCompleted: prefs.onboarding_completed ?? DEFAULT_THEME.onboardingCompleted,
        });
        applyTheme(prefs);
      }
    } catch (err) {
      console.error('Failed to fetch theme:', err);
      setTheme(DEFAULT_THEME);
      applyTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (updates) => {
    try {
      const response = await api.put('/user/preferences', {
        theme_primary_color: updates.primaryColor,
        theme_secondary_color: updates.secondaryColor,
        theme_font: updates.font,
        chatbot_icon: updates.chatbotIcon,
        notifications_enabled: updates.notificationsEnabled,
        language: updates.language,
      });

      const prefs = response.data.preferences;
      const newTheme = {
        primaryColor: prefs.theme_primary_color,
        secondaryColor: prefs.theme_secondary_color,
        font: prefs.theme_font,
        chatbotIcon: prefs.chatbot_icon,
        notificationsEnabled: prefs.notifications_enabled,
        language: prefs.language,
        onboardingCompleted: prefs.onboarding_completed,
      };

      setTheme(newTheme);
      applyTheme(newTheme);
      return newTheme;
    } catch (err) {
      console.error('Failed to update theme:', err);
      throw err;
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await api.post('/user/onboarding/complete');
      const prefs = response.data.preferences;
      setTheme(prev => ({
        ...prev,
        onboardingCompleted: prefs.onboarding_completed,
      }));
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      throw err;
    }
  };

  const applyTheme = (themeObj) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', themeObj.theme_primary_color || themeObj.primaryColor);
    root.style.setProperty('--color-secondary', themeObj.theme_secondary_color || themeObj.secondaryColor);
    root.style.setProperty('--font-family', themeObj.theme_font || themeObj.font);
    
    // Set font family for the entire document
    document.body.style.fontFamily = themeObj.theme_font || themeObj.font;
  };

  const value = {
    theme,
    loading,
    updateTheme,
    completeOnboarding,
    resetTheme: () => {
      setTheme(DEFAULT_THEME);
      applyTheme(DEFAULT_THEME);
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
