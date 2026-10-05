const Notification = require("../models/Notification");

let io;

const setSocketIO = (socketIO) => {
  io = socketIO;
};

const createNotification = async ({
  userId,
  title,
  message,
  type = "system",
  priority = "medium",
  relatedId = null,
  actionUrl = null,
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      priority,
      relatedId,
      actionUrl,
    });

    // Send notification to the user's personal socket room.
    if (io) {
      io.to(`user:${userId}`).emit("newNotification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Notification Service Error:", error);
    throw error;
  }
};

module.exports = {
  setSocketIO,
  createNotification,
};