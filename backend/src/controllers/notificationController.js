const {
  getUnreadNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  countUnreadNotifications,
} = require('../models/Notification');

// Get unread notifications
const getUnreadNotificationsHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    const notifications = await getUnreadNotifications(userId);
    const unreadCount = await countUnreadNotifications(userId);

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error('Get unread notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch unread notifications.' });
  }
};

// Get all notifications (paginated)
const getAllNotificationsHandler = async (req, res) => {
  const userId = req.user.userId;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const notifications = await getUserNotifications(userId, parseInt(limit), parseInt(offset));
    const unreadCount = await countUnreadNotifications(userId);

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error('Get all notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

// Mark notification as read
const markNotificationAsReadHandler = async (req, res) => {
  const userId = req.user.userId;
  const { notificationId } = req.params;

  if (!notificationId) {
    return res.status(400).json({ error: 'Notification ID is required.' });
  }

  try {
    const notification = await markNotificationAsRead(notificationId, userId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const unreadCount = await countUnreadNotifications(userId);

    return res.status(200).json({
      message: 'Notification marked as read.',
      notification,
      unreadCount,
    });
  } catch (err) {
    console.error('Mark notification as read error:', err);
    return res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
};

// Mark all notifications as read
const markAllNotificationsAsReadHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    const notifications = await markAllNotificationsAsRead(userId);

    return res.status(200).json({
      message: 'All notifications marked as read.',
      count: notifications.length,
      unreadCount: 0,
    });
  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    return res.status(500).json({ error: 'Failed to mark all notifications as read.' });
  }
};

// Delete notification
const deleteNotificationHandler = async (req, res) => {
  const userId = req.user.userId;
  const { notificationId } = req.params;

  if (!notificationId) {
    return res.status(400).json({ error: 'Notification ID is required.' });
  }

  try {
    const notification = await deleteNotification(notificationId, userId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const unreadCount = await countUnreadNotifications(userId);

    return res.status(200).json({
      message: 'Notification deleted.',
      unreadCount,
    });
  } catch (err) {
    console.error('Delete notification error:', err);
    return res.status(500).json({ error: 'Failed to delete notification.' });
  }
};

// Delete all notifications
const deleteAllNotificationsHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    const notifications = await deleteAllNotifications(userId);

    return res.status(200).json({
      message: 'All notifications deleted.',
      count: notifications.length,
      unreadCount: 0,
    });
  } catch (err) {
    console.error('Delete all notifications error:', err);
    return res.status(500).json({ error: 'Failed to delete all notifications.' });
  }
};

// Get unread notification count
const getUnreadCountHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    const unreadCount = await countUnreadNotifications(userId);

    return res.status(200).json({ unreadCount });
  } catch (err) {
    console.error('Get unread count error:', err);
    return res.status(500).json({ error: 'Failed to fetch unread count.' });
  }
};

module.exports = {
  getUnreadNotificationsHandler,
  getAllNotificationsHandler,
  markNotificationAsReadHandler,
  markAllNotificationsAsReadHandler,
  deleteNotificationHandler,
  deleteAllNotificationsHandler,
  getUnreadCountHandler,
};
