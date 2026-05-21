import api from './api';

const chatService = {
  // Send message to chatbot
  async sendMessage(message) {
    try {
      const response = await api.post('/chatbot/message', {
        message,
      });
      return response.data;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  },

  // Get conversation history
  async getHistory(limit = 50, offset = 0) {
    try {
      const response = await api.get('/chatbot/history', {
        params: { limit, offset },
      });
      return response.data.history;
    } catch (err) {
      console.error('Error fetching history:', err);
      throw err;
    }
  },

  // Clear conversation history
  async clearHistory() {
    try {
      const response = await api.delete('/chatbot/history');
      return response.data;
    } catch (err) {
      console.error('Error clearing history:', err);
      throw err;
    }
  },

  // Create event from chat message
  async createEventFromChat(message, extractedDetails = null) {
    try {
      const response = await api.post('/chatbot/create-event', {
        message,
        extractedDetails,
      });
      return response.data;
    } catch (err) {
      console.error('Error creating event from chat:', err);
      throw err;
    }
  },

  // Get smart suggestions
  async getSuggestions() {
    try {
      const response = await api.get('/chatbot/suggestions');
      return response.data.suggestions;
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      throw err;
    }
  },
};

export default chatService;
