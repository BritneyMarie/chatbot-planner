import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import './SettingsPage.css';

const SettingsPage = () => {
  const { theme, updateTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    font: theme.font,
    notificationsEnabled: theme.notificationsEnabled,
    language: theme.language,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateTheme(preferences);
      setMessage({ type: 'success', text: '✅ Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: '❌ Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences({
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      font: theme.font,
      notificationsEnabled: theme.notificationsEnabled,
      language: theme.language,
    });
    setMessage(null);
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>⚙️ Settings</h1>
          <p>Customize your experience and manage your preferences</p>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-content">
          {/* Theme Settings */}
          <section className="settings-section">
            <div className="section-header">
              <h2>🎨 Theme & Appearance</h2>
              <p>Personalize how the app looks</p>
            </div>

            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-label">
                  <label>Primary Color</label>
                  <span className="color-value">{preferences.primaryColor}</span>
                </div>
                <div className="setting-input">
                  <input
                    type="color"
                    value={preferences.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="color-input"
                  />
                  <div
                    className="color-preview"
                    style={{ backgroundColor: preferences.primaryColor }}
                  ></div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>Secondary Color</label>
                  <span className="color-value">{preferences.secondaryColor}</span>
                </div>
                <div className="setting-input">
                  <input
                    type="color"
                    value={preferences.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="color-input"
                  />
                  <div
                    className="color-preview"
                    style={{ backgroundColor: preferences.secondaryColor }}
                  ></div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>Font</label>
                  <span className="hint">Choose your preferred font style</span>
                </div>
                <div className="setting-input">
                  <select
                    value={preferences.font}
                    onChange={(e) => handleChange('font', e.target.value)}
                    className="font-select"
                  >
                    <option value="Poppins">Poppins (Modern)</option>
                    <option value="Inter">Inter (Clean)</option>
                    <option value="Roboto">Roboto (Professional)</option>
                    <option value="Georgia">Georgia (Classic)</option>
                    <option value="Courier New">Courier New (Monospace)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="settings-section">
            <div className="section-header">
              <h2>🔔 Notifications</h2>
              <p>Control how you receive updates</p>
            </div>

            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-label">
                  <label>Enable Notifications</label>
                  <span className="hint">Get reminded about upcoming events</span>
                </div>
                <div className="setting-input">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={preferences.notificationsEnabled}
                      onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Language Settings */}
          <section className="settings-section">
            <div className="section-header">
              <h2>🌍 Language & Region</h2>
              <p>Choose your preferred language</p>
            </div>

            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-label">
                  <label>Language</label>
                  <span className="hint">Select your preferred language</span>
                </div>
                <div className="setting-input">
                  <select
                    value={preferences.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="language-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                    <option value="pt">Português (Portuguese)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Account Settings */}
          <section className="settings-section">
            <div className="section-header">
              <h2>👤 Account</h2>
              <p>Manage your account information</p>
            </div>

            <div className="settings-group">
              <div className="setting-item info-box">
                <p>📌 More account features coming soon...</p>
                <ul className="feature-list">
                  <li>Change Password</li>
                  <li>Two-Factor Authentication</li>
                  <li>Connected Devices</li>
                  <li>Data Export</li>
                </ul>
              </div>
            </div>
          </section>

          {/* About Settings */}
          <section className="settings-section">
            <div className="section-header">
              <h2>ℹ️ About</h2>
              <p>App information and links</p>
            </div>

            <div className="settings-group">
              <div className="about-info">
                <div className="info-row">
                  <span>App Version:</span>
                  <strong>1.0.0</strong>
                </div>
                <div className="info-row">
                  <span>Phase:</span>
                  <strong>Phase 5 (Onboarding & Settings) ✅</strong>
                </div>
                <div className="info-row">
                  <span>License:</span>
                  <strong>ISC</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="settings-actions">
          <button
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={saving}
          >
            ↻ Reset Changes
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '💾 Saving...' : '✓ Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
