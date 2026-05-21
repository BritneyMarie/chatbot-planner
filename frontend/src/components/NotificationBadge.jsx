import { useEffect, useState } from 'react';
import notificationService from '../services/notificationService';
import './NotificationBadge.css';

const NotificationBadge = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  return (
    <button className="notification-badge-btn" onClick={onClick} title="Notifications">
      <span className="badge-icon">🔔</span>
      {unreadCount > 0 && (
        <span className="badge-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
      )}
    </button>
  );
};

export default NotificationBadge;
