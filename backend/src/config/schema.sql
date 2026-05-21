-- Database schema for Chatbot-Assisted Weekly Planner
-- Run this script to initialize the database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table (theme customization)
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_primary_color VARCHAR(7) DEFAULT '#667eea',
  theme_secondary_color VARCHAR(7) DEFAULT '#764ba2',
  theme_font VARCHAR(50) DEFAULT 'Poppins',
  chatbot_icon VARCHAR(50) DEFAULT '🤖',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  language VARCHAR(10) DEFAULT 'en',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table (calendar events)
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  color VARCHAR(7),
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50),
  reminder_minutes INTEGER DEFAULT 0,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chatbot conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  intent VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  notification_type VARCHAR(50) DEFAULT 'reminder',
  is_read BOOLEAN DEFAULT FALSE,
  scheduled_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event templates table
CREATE TABLE IF NOT EXISTS event_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_name VARCHAR(100) NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_color VARCHAR(7) DEFAULT '#667eea',
  event_duration INTEGER DEFAULT 60,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_events_user_time ON events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(user_id, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_templates_user ON event_templates(user_id);
