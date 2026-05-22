import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const ThemeContext = createContext();

// Preset palettes from mood board assets
export const PALETTES = {
  matchaStrawberry: {
    name: 'Matcha Strawberry',
    emoji: '🍓🍵',
    primaryColor: '#B97D7B',
    secondaryColor: '#928E5E',
    accentColor: '#575527',
    highlightColor: '#ECC4C3',
    bgColor: '#F5F0EB',
    cardBg: '#FFFFFF',
    textColor: '#3D3326',
    textMuted: '#8A7E72',
    borderColor: '#E2D9CF',
  },
  pinkCandy: {
    name: 'Pink Candy',
    emoji: '🩷✨',
    primaryColor: '#fa7ce5',
    secondaryColor: '#e86bd0',
    accentColor: '#d946a8',
    highlightColor: '#fce4f6',
    bgColor: '#f8f8f8',
    cardBg: '#FFFFFF',
    textColor: '#333333',
    textMuted: '#888888',
    borderColor: '#eee',
  },
  lavenderDream: {
    name: 'Lavender Dream',
    emoji: '💜🦋',
    primaryColor: '#775BA5',
    secondaryColor: '#66A5ED',
    accentColor: '#D85E8C',
    highlightColor: '#FFAFEB',
    bgColor: '#F3EFF8',
    cardBg: '#FFFFFF',
    textColor: '#2D2344',
    textMuted: '#8878A0',
    borderColor: '#E0D5ED',
  },
  heatherGarden: {
    name: 'Heather Garden',
    emoji: '🌸🌿',
    primaryColor: '#877499',
    secondaryColor: '#679F9F',
    accentColor: '#E18299',
    highlightColor: '#E6D4BF',
    bgColor: '#F7F4F0',
    cardBg: '#FFFFFF',
    textColor: '#3A3040',
    textMuted: '#8A7E92',
    borderColor: '#DDD5E0',
  },
  coralBlossom: {
    name: 'Coral Blossom',
    emoji: '🌺🍂',
    primaryColor: '#C63E4E',
    secondaryColor: '#475B35',
    accentColor: '#E19184',
    highlightColor: '#F5F9E5',
    bgColor: '#FAF7F4',
    cardBg: '#FFFFFF',
    textColor: '#3A2520',
    textMuted: '#8A706A',
    borderColor: '#E8DDD8',
  },
  honeyGold: {
    name: 'Honey Gold',
    emoji: '🍯🌻',
    primaryColor: '#D4943A',
    secondaryColor: '#66A5ED',
    accentColor: '#F6C45C',
    highlightColor: '#FFF5E0',
    bgColor: '#FFFCF5',
    cardBg: '#FFFFFF',
    textColor: '#3D3020',
    textMuted: '#9A8A6E',
    borderColor: '#EDE4D4',
  },
};

const DEFAULT_PALETTE = 'matchaStrawberry';

const DEFAULT_THEME = {
  palette: DEFAULT_PALETTE,
  ...PALETTES[DEFAULT_PALETTE],
  font: 'Poppins',
  chatbotIcon: '🤖',
  notificationsEnabled: true,
  language: 'en',
  onboardingCompleted: false,
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Apply default theme CSS variables immediately on mount
    const savedPalette = localStorage.getItem('selectedPalette') || DEFAULT_PALETTE;
    const palette = PALETTES[savedPalette] || PALETTES[DEFAULT_PALETTE];
    const initialTheme = { ...DEFAULT_THEME, palette: savedPalette, ...palette };
    setTheme(initialTheme);
    applyTheme(initialTheme);
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await api.get('/user/preferences');
      if (response.data.preferences) {
        const prefs = response.data.preferences;
        // Try to match saved colors to a palette
        const savedPalette = localStorage.getItem('selectedPalette') || DEFAULT_PALETTE;
        const palette = PALETTES[savedPalette] || PALETTES[DEFAULT_PALETTE];

        const newTheme = {
          palette: savedPalette,
          ...palette,
          primaryColor: palette.primaryColor,
          secondaryColor: palette.secondaryColor,
          font: prefs.theme_font || DEFAULT_THEME.font,
          chatbotIcon: prefs.chatbot_icon || DEFAULT_THEME.chatbotIcon,
          notificationsEnabled: prefs.notifications_enabled ?? DEFAULT_THEME.notificationsEnabled,
          language: prefs.language || DEFAULT_THEME.language,
          onboardingCompleted: prefs.onboarding_completed ?? DEFAULT_THEME.onboardingCompleted,
        };
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    } catch (err) {
      console.error('Failed to fetch theme:', err);
      applyTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  };

  const switchPalette = (paletteKey) => {
    const palette = PALETTES[paletteKey];
    if (!palette) return;
    localStorage.setItem('selectedPalette', paletteKey);
    const newTheme = { ...theme, palette: paletteKey, ...palette };
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const updateTheme = async (updates) => {
    try {
      const response = await api.put('/user/preferences', {
        theme_primary_color: updates.primaryColor || theme.primaryColor,
        theme_secondary_color: updates.secondaryColor || theme.secondaryColor,
        theme_font: updates.font,
        chatbot_icon: updates.chatbotIcon,
        notifications_enabled: updates.notificationsEnabled,
        language: updates.language,
      });

      const prefs = response.data.preferences;
      const newTheme = {
        ...theme,
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
      setTheme(prev => ({ ...prev, onboardingCompleted: prefs.onboarding_completed }));
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      throw err;
    }
  };

  const applyTheme = (t) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', t.primaryColor);
    root.style.setProperty('--color-secondary', t.secondaryColor);
    root.style.setProperty('--color-accent', t.accentColor || t.primaryColor);
    root.style.setProperty('--color-highlight', t.highlightColor || '#fce4f6');
    root.style.setProperty('--color-bg', t.bgColor || '#f8f8f8');
    root.style.setProperty('--color-card', t.cardBg || '#fff');
    root.style.setProperty('--color-text', t.textColor || '#333');
    root.style.setProperty('--color-text-muted', t.textMuted || '#888');
    root.style.setProperty('--color-border', t.borderColor || '#eee');
    root.style.setProperty('--font-family', t.font || 'Poppins');
    document.body.style.fontFamily = t.font || 'Poppins';
  };

  const value = {
    theme,
    loading,
    updateTheme,
    switchPalette,
    completeOnboarding,
    resetTheme: () => {
      setTheme(DEFAULT_THEME);
      applyTheme(DEFAULT_THEME);
      localStorage.setItem('selectedPalette', DEFAULT_PALETTE);
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
