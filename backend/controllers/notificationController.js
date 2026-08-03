const { Notification } = require('../models');

// GET /api/notifications/my (any authenticated user)
const getMyNotifications = async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 30,
  });
  const unreadCount = await Notification.count({ where: { userId: req.user.id, isRead: false } });
  return res.json({ notifications, unreadCount });
};

// PUT /api/notifications/:id/read (any authenticated user, own notifications only)
const markAsRead = async (req, res) => {
  const notification = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });

  await notification.update({ isRead: true });
  return res.json({ notification });
};

// PUT /api/notifications/read-all (any authenticated user)
const markAllAsRead = async (req, res) => {
  await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
  return res.json({ message: 'All notifications marked as read' });
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
