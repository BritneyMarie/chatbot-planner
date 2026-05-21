const { OpenAI } = require('openai');
const { saveConversation, getRecentConversations, getConversationHistory, clearConversationHistory } = require('../models/ChatbotConversation');
const { createEvent, getEventsByUser } = require('../models/Event');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful AI assistant for a calendar planning app called "Chatbot-Assisted Weekly Planner". 
You help users with:
1. Weather information - provide helpful weather insights
2. Calendar management - help users organize their schedule
3. Jokes and fun facts - keep conversations light and engaging
4. Trivia questions - test users' knowledge
5. Event suggestions - recommend events based on user's interests

Keep responses concise (under 150 words), friendly, and relevant to calendar/planning context.
When users mention dates or times, acknowledge them but don't create events automatically - suggest they use the calendar interface.`;

// Detect user intent from message
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.match(/weather|forecast|temperature|rain|snow|sunny|cloudy/i)) {
    return 'weather';
  } else if (lowerMessage.match(/joke|funny|laugh|humor|haha|lol/i)) {
    return 'joke';
  } else if (lowerMessage.match(/trivia|quiz|question|know|fact|interesting/i)) {
    return 'trivia';
  } else if (lowerMessage.match(/event|meeting|appointment|schedule|plan|calendar|add|create/i)) {
    return 'event';
  } else {
    return 'general';
  }
};

// Extract event details from natural language message
const extractEventDetails = (message) => {
  const details = {
    title: null,
    date: null,
    time: null,
    duration: 60, // Default 60 minutes
    color: '#667eea', // Default color
  };

  // Extract title (usually after "create", "schedule", "add", or "meeting about")
  const titleMatch = message.match(/(?:create|schedule|add|meeting about)\s+(?:a\s+)?(?:meeting\s+)?(?:called\s+)?(?:about\s+)?([^,\.!?]*?)(?:\s+(?:at|on|tomorrow|today|next|in|\d))/i);
  if (titleMatch) {
    details.title = titleMatch[1].trim();
  } else if (message.match(/meeting|event|appointment/i)) {
    const words = message.split(/\s+/);
    const eventIdx = words.findIndex(w => /event|meeting|appointment/i.test(w));
    if (eventIdx !== -1 && words[eventIdx + 1]) {
      details.title = words.slice(eventIdx + 1, eventIdx + 4).join(' ');
    }
  }

  // Extract date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (message.match(/tomorrow/i)) {
    details.date = tomorrow.toISOString().split('T')[0];
  } else if (message.match(/today/i)) {
    details.date = today.toISOString().split('T')[0];
  } else {
    // Try to extract specific date (e.g., "May 25", "05/25", "05-25")
    const dateMatch = message.match(/(?:on\s+)?(?:may|june|july|august|september|october|november|december)?\s*(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?/i);
    if (dateMatch) {
      const month = new Date().getMonth() + 1;
      const year = dateMatch[2] || new Date().getFullYear();
      const day = dateMatch[1].padStart(2, '0');
      details.date = `${year}-${String(month).padStart(2, '0')}-${day}`;
    }

    // Check for "next Monday", "next week", etc.
    const nextDayMatch = message.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (nextDayMatch) {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = days.indexOf(nextDayMatch[1].toLowerCase());
      const currentDay = today.getDay();
      const daysAhead = targetDay - currentDay;
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + (daysAhead > 0 ? daysAhead : 7 + daysAhead));
      details.date = targetDate.toISOString().split('T')[0];
    }
  }

  // Extract time (e.g., "2:30 PM", "14:30", "at 9", "3 o'clock")
  const timeMatch = message.match(/(?:at\s+)?(\d{1,2}):?(\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    
    // Check for AM/PM
    if (message.match(/pm|p\.m\./i) && hour !== 12) {
      hour += 12;
    } else if (message.match(/am|a\.m\./i) && hour === 12) {
      hour = 0;
    }
    
    details.time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  // Extract duration
  const durationMatch = message.match(/(\d+)\s*(?:hour|hr|minute|min)/i);
  if (durationMatch) {
    const num = parseInt(durationMatch[1]);
    if (message.match(/hour|hr/i)) {
      details.duration = num * 60;
    } else {
      details.duration = num;
    }
  }

  return details;
};

// Generate smart suggestions based on user patterns
const generateSmartSuggestions = async (userId) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = tomorrow.toISOString().split('T')[0];

    const events = await getEventsByUser(userId, startDate, endDate);

    const suggestions = [];

    // Suggestion 1: Based on day of week
    const dayOfWeek = today.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (dayOfWeek === 1) { // Monday
      suggestions.push('📅 It\'s Monday! Would you like to schedule a weekly planning session or team meeting?');
    } else if (dayOfWeek === 5) { // Friday
      suggestions.push('🎉 Friday already! Ready to plan your weekend?');
    }

    // Suggestion 2: Based on event count
    if (events.length === 0) {
      suggestions.push('📝 Your calendar looks empty today. Want to add some events?');
    } else if (events.length >= 5) {
      suggestions.push('⚡ You have quite a few events today! Need help organizing?');
    }

    // Suggestion 3: Time-based suggestions
    const hour = today.getHours();
    if (hour < 9) {
      suggestions.push('☀️ Good morning! Plan your day by adding today\'s tasks?');
    } else if (hour >= 12 && hour < 13) {
      suggestions.push('🍽️ Lunch time! Want to schedule a lunch break?');
    } else if (hour >= 17) {
      suggestions.push('🌆 End of day! Review your tasks and plan tomorrow?');
    }

    return suggestions;
  } catch (err) {
    console.error('Error generating suggestions:', err);
    return [];
  }
};

// Send message to chatbot
const sendMessageHandler = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.userId;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured.' });
  }

  try {
    // Detect intent
    const intent = detectIntent(message);

    // Get recent conversation context
    const recentConversations = await getRecentConversations(userId, 5);

    // Build conversation history for context
    const conversationHistory = recentConversations.map((conv) => ({
      role: 'user',
      content: conv.user_message,
    })).flatMap((userMsg, idx) => {
      const botMsg = recentConversations[idx]?.bot_response;
      return botMsg ? [userMsg, { role: 'assistant', content: botMsg }] : [userMsg];
    });

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message,
    });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...conversationHistory,
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const botResponse = response.choices[0].message.content.trim();

    // Save conversation to database
    await saveConversation(userId, message, botResponse, intent);

    return res.status(200).json({
      userMessage: message,
      botResponse,
      intent,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Chatbot error:', err);
    
    if (err.message?.includes('API key')) {
      return res.status(500).json({ error: 'OpenAI API key is not configured.' });
    } else if (err.message?.includes('rate_limit')) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    return res.status(500).json({ error: 'Failed to process message.' });
  }
};

// Get conversation history
const getHistoryHandler = async (req, res) => {
  const userId = req.user.userId;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const history = await getConversationHistory(userId, parseInt(limit), parseInt(offset));
    return res.status(200).json({ history });
  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json({ error: 'Failed to fetch conversation history.' });
  }
};

// Clear conversation history
const clearHistoryHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    await clearConversationHistory(userId);
    return res.status(200).json({ message: 'Conversation history cleared.' });
  } catch (err) {
    console.error('Clear history error:', err);
    return res.status(500).json({ error: 'Failed to clear conversation history.' });
  }
};

// Create event from chat message
const createEventFromChatHandler = async (req, res) => {
  const { message, extractedDetails } = req.body;
  const userId = req.user.userId;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  try {
    // Extract event details from message
    const details = extractedDetails || extractEventDetails(message);

    if (!details.title) {
      return res.status(400).json({ 
        error: 'Could not extract event title. Please specify what event you\'d like to create.',
        suggestedFormat: 'e.g., "Schedule a meeting tomorrow at 2 PM" or "Create a dentist appointment on May 25"'
      });
    }

    if (!details.date) {
      return res.status(400).json({ 
        error: 'Could not extract date. Please specify when.',
        suggestedFormat: 'e.g., "tomorrow", "next Monday", "May 25"'
      });
    }

    // Build start and end times
    const timeStr = details.time || '09:00';
    const [hour, minute] = timeStr.split(':').map(Number);
    
    const startDateTime = new Date(`${details.date}T${timeStr}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + details.duration);

    // Create event
    const event = await createEvent(
      userId,
      details.title,
      `Created from chatbot: ${message}`,
      startDateTime.toISOString(),
      endDateTime.toISOString(),
      details.color
    );

    return res.status(201).json({
      success: true,
      message: `✅ Event "${details.title}" created for ${details.date} at ${timeStr}`,
      event: {
        id: event.id,
        title: details.title,
        date: details.date,
        time: timeStr,
        duration: details.duration,
      }
    });
  } catch (err) {
    console.error('Create event from chat error:', err);
    return res.status(500).json({ error: 'Failed to create event from chat.' });
  }
};

// Get smart suggestions
const getSuggestionsHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    const suggestions = await generateSmartSuggestions(userId);
    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error('Get suggestions error:', err);
    return res.status(500).json({ error: 'Failed to generate suggestions.' });
  }
};

module.exports = {
  sendMessageHandler,
  getHistoryHandler,
  clearHistoryHandler,
  detectIntent,
  extractEventDetails,
  generateSmartSuggestions,
  createEventFromChatHandler,
  getSuggestionsHandler,
};
