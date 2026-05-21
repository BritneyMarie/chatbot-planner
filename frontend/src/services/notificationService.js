import api from './api';

const notificationService = {
  // Get unread notifications
  async getUnreadNotifications() {
    try {
      const response = await api.get('/notifications/unread');
      return response.data;
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
      throw err;
    }
  },

  // Get all notifications (paginated)
  async getAllNotifications(limit = 20, offset = 0) {
    try {
      const response = await api.get('/notifications', {
        params: { limit, offset },
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      throw err;
    }
  },

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/count/unread');
      return response.data.unreadCount;
    } catch (err) {
      console.error('Error fetching unread count:', err);
      throw err;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  },

  // Mark all as read
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read/all');
      return response.data;
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  },

  // Delete all notifications
  async deleteAllNotifications() {
    try {
      const response = await api.delete('/notifications/all');
      return response.data;
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      throw err;
    }
  },
};

export default notificationService;
