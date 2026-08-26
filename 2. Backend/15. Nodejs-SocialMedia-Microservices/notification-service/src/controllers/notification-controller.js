const Notification = require("../models/Notification");
const logger = require("../utils/logger");

const listNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const notifications = await Notification.find({
      recipient: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({
      recipient: req.user.userId,
    });

    res.json({
      success: true,
      notifications,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
      totalNotifications,
    });
  } catch (e) {
    logger.error("Error fetching notifications", e);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification || notification.recipient.toString() !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      notification,
    });
  } catch (e) {
    logger.error("Error marking notification as read", e);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
    });
  }
};

module.exports = { listNotifications, markAsRead };
