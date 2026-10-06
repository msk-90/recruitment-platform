import Notification from '../models/Notification.js';

/**
 * @desc    Get my notifications
 * @route   GET /api/notifications
 * @access  Private
 * @query   unread=true, limit=20
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const { unread, limit } = req.query;
    const filter = { recipient: req.user._id };

    if (unread === 'true') filter.read = false;

    const max = Math.min(Number(limit) || 50, 100);

    const notifications = await Notification.find(filter)
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(max);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get unread count only (for navbar badge)
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });
    res.json({ unreadCount: count });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark one notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark all my notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete one notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/clear-read
 * @access  Private
 */
export const clearRead = async (req, res, next) => {
  try {
    await Notification.deleteMany({
      recipient: req.user._id,
      read: true,
    });
    res.json({ message: 'Read notifications cleared' });
  } catch (err) {
    next(err);
  }
};