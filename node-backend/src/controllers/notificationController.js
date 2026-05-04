const Notification = require('../models/Notification');

// @desc  Get all notifications for logged in user
// @route GET /api/notifications
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.json({ 
      success: true, 
      count: notifications.length, 
      unreadCount,
      data: notifications 
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Mark notification as read
// @route PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc  Mark all as read
// @route PATCH /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete notification
// @route DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin broadcast (Internal utility)
const createNotification = async (userId, title, message, type = 'system', priority = 'medium', relatedId = null) => {
  try {
    return await Notification.create({
      userId,
      title,
      message,
      type,
      priority,
      relatedId
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// @desc  Admin create notification for user
// @route POST /api/notifications
const sendManualNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type, priority } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const notification = await createNotification(userId, title, message, type, priority);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  sendManualNotification
};
