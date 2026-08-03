const { Notification } = require('../models');

const notify = async (userId, message, link = null) => {
  try {
    await Notification.create({ userId, message, link });
  } catch (err) {
    // A failed notification should never break the actual action (applying, scheduling, etc.)
    console.error('Failed to create notification:', err.message);
  }
};

module.exports = notify;
