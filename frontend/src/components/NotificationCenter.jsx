import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import './NotificationCenter.css';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load notifications when component opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getAllNotifications(50, 0);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      setUnreadCount(result.unreadCount);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const result = await notificationService.deleteNotification(notificationId);
      setUnreadCount(result.unreadCount);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Delete all notifications?')) {
      try {
        const result = await notificationService.deleteAllNotifications();
        setNotifications([]);
        setUnreadCount(0);
      } catch (err) {
        console.error('Failed to delete all:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="notification-center-header">
          <div className="notification-center-title">
            <span className="notification-icon">🔔</span>
            <div>
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <p className="unread-count">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Toolbar */}
        {notifications.length > 0 && (
          <div className="notification-toolbar">
            <button
              className="toolbar-btn"
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              ✓ Mark all read
            </button>
            <button
              className="toolbar-btn danger"
              onClick={handleDeleteAll}
              title="Delete all notifications"
            >
              🗑️ Delete all
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="notification-list">
          {loading ? (
            <div className="notification-empty">
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="notification-empty">
              <p>❌ {error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="empty-icon">📭</div>
              <p>No notifications yet</p>
              <p className="empty-hint">Event reminders will appear here</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.is_read ? '' : 'unread'}`}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <span className="notification-type-badge">
                      {notification.notification_type === 'reminder' ? '🕐' : '📬'}
                    </span>
                    <h4 className="notification-title">{notification.title}</h4>
                    {!notification.is_read && (
                      <span className="unread-badge">●</span>
                    )}
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-time">
                    {new Date(notification.scheduled_time).toLocaleString()}
                  </p>
                </div>

                <div className="notification-actions">
                  {!notification.is_read && (
                    <button
                      className="action-btn read-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
