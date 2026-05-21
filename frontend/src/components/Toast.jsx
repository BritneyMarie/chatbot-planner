import { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    reminder: '🔔',
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type] || icons.info}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
};

export default Toast;
