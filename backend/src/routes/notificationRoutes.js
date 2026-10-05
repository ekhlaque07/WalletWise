const express = require("express");

const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

// All notification routes require authentication.
router.use(authMiddleware);

router.get("/", getNotifications);

router.get("/unread-count", getUnreadCount);

router.patch("/read-all", markAllAsRead);

router.patch("/:id/read", markAsRead);

router.delete("/delete-all", deleteAllNotifications);

router.delete("/:id", deleteNotification);

module.exports = router;