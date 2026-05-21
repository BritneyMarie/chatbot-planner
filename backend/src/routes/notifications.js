const express = require('express');
const {
  getUnreadNotificationsHandler,
  getAllNotificationsHandler,
  markNotificationAsReadHandler,
  markAllNotificationsAsReadHandler,
  deleteNotificationHandler,
  deleteAllNotificationsHandler,
  getUnreadCountHandler,
} = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.use(verifyToken);

// Get unread notifications
router.get('/unread', getUnreadNotificationsHandler);

// Get all notifications (paginated)
router.get('/', getAllNotificationsHandler);

// Get unread notification count
router.get('/count/unread', getUnreadCountHandler);

// Mark notification as read
router.put('/:notificationId/read', markNotificationAsReadHandler);

// Mark all notifications as read
router.put('/read/all', markAllNotificationsAsReadHandler);

// Delete notification
router.delete('/:notificationId', deleteNotificationHandler);

// Delete all notifications
router.delete('/all', deleteAllNotificationsHandler);

module.exports = router;
