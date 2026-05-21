import './ChatBotButton.css';

const ChatBotButton = ({ onClick }) => {
  return (
    <button className="chatbot-floating-btn" onClick={onClick} title="Open chatbot">
      <span className="chatbot-btn-icon">🤖</span>
      <span className="chatbot-btn-pulse"></span>
    </button>
  );
};

export default ChatBotButton;
