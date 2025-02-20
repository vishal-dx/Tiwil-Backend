const Notification = require("../models/Notification")
const User = require("../models/User");

// ✅ 1. Create a Notification
const createNotification = async (req, res) => {
  try {
    const { userId, message, type, wishId } = req.body;

    if (!userId || !message || !type) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const newNotification = new Notification({ userId, message, type, wishId });
    await newNotification.save();

    return res.status(201).json({ success: true, message: "Notification created.", data: newNotification });
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ✅ 2. Get Notifications for a User
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId; // User making the request

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ✅ 3. Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.status(200).json({ success: true, message: "Notification marked as read.", data: notification });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { createNotification, getUserNotifications, markAsRead };
