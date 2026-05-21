import { useState, useRef, useEffect } from 'react';
import chatService from '../services/chatService';
import './ChatBox.css';

const ChatBox = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [creatingEvent, setCreatingEvent] = useState(null);
  const messagesEndRef = useRef(null);

  // Load conversation history and suggestions on mount
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadHistory();
      loadSuggestions();
    }
  }, [isOpen, historyLoaded]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const history = await chatService.getHistory(20);
      const formattedMessages = history.flatMap(conv => [
        { role: 'user', content: conv.user_message, timestamp: conv.created_at },
        { role: 'assistant', content: conv.bot_response, timestamp: conv.created_at },
      ]);
      setMessages(formattedMessages);
      setHistoryLoaded(true);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Failed to load chat history');
    }
  };

  const loadSuggestions = async () => {
    try {
      const sugg = await chatService.getSuggestions();
      setSuggestions(sugg);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);
    setSuggestions([]); // Clear suggestions after user sends message

    // Add user message to UI immediately
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
    ]);

    try {
      setLoading(true);
      const response = await chatService.sendMessage(userMessage);
      
      // Add bot response
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: response.botResponse, 
          timestamp: response.timestamp,
          intent: response.intent 
        },
      ]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEventFromChat = async (messageText) => {
    try {
      setCreatingEvent(messageText);
      const result = await chatService.createEventFromChat(messageText);
      
      if (result.success) {
        // Add success message
        setMessages(prev => [
          ...prev,
          { 
            role: 'system', 
            content: result.message, 
            timestamp: new Date().toISOString(),
            type: 'event-created'
          },
        ]);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      const errorMsg = err.response?.data?.error || 'Failed to create event';
      setMessages(prev => [
        ...prev,
        { 
          role: 'system', 
          content: `❌ ${errorMsg}`, 
          timestamp: new Date().toISOString(),
          type: 'event-error'
        },
      ]);
    } finally {
      setCreatingEvent(null);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      try {
        await chatService.clearHistory();
        setMessages([]);
        setError(null);
      } catch (err) {
        console.error('Error clearing history:', err);
        setError('Failed to clear history');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbox-overlay" onClick={onClose}>
      <div className="chatbox-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbox-header">
          <div className="chatbox-title">
            <span className="chatbot-icon">🤖</span>
            <h3>Chatbot Assistant</h3>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Messages */}
        <div className="chatbox-messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p className="empty-title">No messages yet</p>
              <p className="empty-text">Start a conversation! Ask about weather, jokes, trivia, or calendar tips.</p>
              
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="suggestions-container">
                  <p className="suggestions-title">💡 Suggestions:</p>
                  <div className="suggestions-list">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="suggestion-btn"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role} ${msg.type || ''}`}>
                  {msg.type === 'event-created' && (
                    <div className="message-content event-success">
                      {msg.content}
                    </div>
                  )}
                  {msg.type === 'event-error' && (
                    <div className="message-content event-error">
                      {msg.content}
                    </div>
                  )}
                  {!msg.type && (
                    <>
                      <div className="message-content">
                        {msg.content}
                      </div>
                      {msg.role === 'assistant' && msg.intent === 'event' && (
                        <button 
                          className="event-action-btn"
                          onClick={() => handleCreateEventFromChat(msg.content)}
                          disabled={creatingEvent !== null}
                        >
                          {creatingEvent === msg.content ? '⏳ Creating...' : '📅 Create Event'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
              
              {/* Suggestions after first message */}
              {suggestions.length > 0 && messages.length > 0 && (
                <div className="suggestions-container">
                  <p className="suggestions-title">💡 Quick Actions:</p>
                  <div className="suggestions-list">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="suggestion-btn"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="chatbox-error">
            ⚠️ {error}
          </div>
        )}

        {/* Input Area */}
        <div className="chatbox-footer">
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              disabled={loading}
              className="message-input"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="send-btn"
            >
              {loading ? '⏳' : '➤'}
            </button>
          </form>

          <button
            className="clear-history-btn"
            onClick={handleClearHistory}
            title="Clear all chat history"
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
