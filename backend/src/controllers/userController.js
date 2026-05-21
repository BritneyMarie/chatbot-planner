const { getUserPreferences, updateUserPreferences, updateOnboardingCompleted, createDefaultPreferences } = require('../models/UserPreferences');

// Get user preferences
const getUserPreferencesHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    let preferences = await getUserPreferences(userId);

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await createDefaultPreferences(userId);
    }

    return res.status(200).json({ preferences });
  } catch (err) {
    console.error('Get preferences error:', err);
    return res.status(500).json({ error: 'Failed to fetch preferences.' });
  }
};

// Update user preferences
const updateUserPreferencesHandler = async (req, res) => {
  const userId = req.user.userId;
  const updates = req.body;

  try {
    // Check if preferences exist, if not create default
    let preferences = await getUserPreferences(userId);
    if (!preferences) {
      preferences = await createDefaultPreferences(userId);
    }

    // Update preferences
    const updatedPreferences = await updateUserPreferences(userId, updates);
    return res.status(200).json({ message: 'Preferences updated successfully.', preferences: updatedPreferences });
  } catch (err) {
    console.error('Update preferences error:', err);
    return res.status(500).json({ error: 'Failed to update preferences.' });
  }
};

// Complete onboarding
const completeOnboardingHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Check if preferences exist, if not create default
    let preferences = await getUserPreferences(userId);
    if (!preferences) {
      preferences = await createDefaultPreferences(userId);
    }

    // Mark onboarding as completed
    const updatedPreferences = await updateOnboardingCompleted(userId);
    return res.status(200).json({ message: 'Onboarding completed.', preferences: updatedPreferences });
  } catch (err) {
    console.error('Complete onboarding error:', err);
    return res.status(500).json({ error: 'Failed to complete onboarding.' });
  }
};

module.exports = {
  getUserPreferencesHandler,
  updateUserPreferencesHandler,
  completeOnboardingHandler,
};
