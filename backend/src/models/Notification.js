const pool = require('../config/database');

// Create a notification
const createNotification = async (userId, eventId, title, message, notificationType, scheduledTime) => {
  const query = `
    INSERT INTO notifications (user_id, event_id, title, message, notification_type, scheduled_time)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const result = await pool.query(query, [userId, eventId, title, message, notificationType, scheduledTime]);
  return result.rows[0];
};

// Get unread notifications for user
const getUnreadNotifications = async (userId) => {
  const query = `
    SELECT * FROM notifications
    WHERE user_id = $1 AND is_read = FALSE
    ORDER BY scheduled_time DESC
    LIMIT 50;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Get all notifications for user (paginated)
const getUserNotifications = async (userId, limit = 20, offset = 0) => {
  const query = `
    SELECT * FROM notifications
    WHERE user_id = $1
    ORDER BY scheduled_time DESC
    LIMIT $2 OFFSET $3;
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

// Get notifications due for reminding (within next 5 minutes)
const getNotificationsDue = async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 5 * 60000); // 5 minutes from now

  const query = `
    SELECT n.*, u.username, e.title as event_title
    FROM notifications n
    JOIN users u ON n.user_id = u.id
    LEFT JOIN events e ON n.event_id = e.id
    WHERE n.is_read = FALSE 
      AND n.scheduled_time <= $1
      AND n.scheduled_time > $2
    ORDER BY n.scheduled_time ASC;
  `;
  const result = await pool.query(query, [soon, new Date(now.getTime() - 60000)]); // Last minute buffer
  return result.rows;
};

// Mark notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [notificationId, userId]);
  return result.rows[0];
};

// Mark all notifications as read for user
const markAllNotificationsAsRead = async (userId) => {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = $1 AND is_read = FALSE
    RETURNING *;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Delete notification
const deleteNotification = async (notificationId, userId) => {
  const query = `
    DELETE FROM notifications
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [notificationId, userId]);
  return result.rows[0];
};

// Delete all notifications for user
const deleteAllNotifications = async (userId) => {
  const query = `
    DELETE FROM notifications
    WHERE user_id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Schedule notifications for upcoming events
const scheduleNotificationsForEvent = async (userId, eventId, eventTitle, startTime, reminders = [15, 60, 1440]) => {
  // reminders are in minutes: 15 min, 1 hour, 1 day by default
  const notifications = [];

  for (const minutesBeforeEvent of reminders) {
    const scheduledTime = new Date(new Date(startTime).getTime() - minutesBeforeEvent * 60000);
    
    let timeLabel = '';
    if (minutesBeforeEvent === 15) timeLabel = '15 minutes';
    else if (minutesBeforeEvent === 60) timeLabel = '1 hour';
    else if (minutesBeforeEvent === 1440) timeLabel = '1 day';
    else timeLabel = `${minutesBeforeEvent} minutes`;

    const notification = await createNotification(
      userId,
      eventId,
      `Upcoming: ${eventTitle}`,
      `Your event "${eventTitle}" starts in ${timeLabel}`,
      'reminder',
      scheduledTime
    );
    notifications.push(notification);
  }

  return notifications;
};

// Count unread notifications
const countUnreadNotifications = async (userId) => {
  const query = `
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = $1 AND is_read = FALSE;
  `;
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].count);
};

// Delete old read notifications (older than 7 days)
const deleteOldNotifications = async () => {
  const query = `
    DELETE FROM notifications
    WHERE is_read = TRUE 
      AND created_at < NOW() - INTERVAL '7 days';
  `;
  const result = await pool.query(query);
  return result.rowCount;
};

module.exports = {
  createNotification,
  getUnreadNotifications,
  getUserNotifications,
  getNotificationsDue,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  scheduleNotificationsForEvent,
  countUnreadNotifications,
  deleteOldNotifications,
};
