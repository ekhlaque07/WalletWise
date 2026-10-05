import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Wallet,
  Target,
  Bot,
  AlertTriangle,
  Settings,
} from "lucide-react";

import { useNotifications } from "../context/NotificationContext";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../services/notificationService";

import "./notifications.css";

const iconMap = {
  budget: Wallet,
  goal: Target,
  transaction: Wallet,
  agent: Bot,
  approval: AlertTriangle,
  system: Settings,
};

const Notifications = () => {
  const navigate = useNavigate();

  const {
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
  } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data.notifications || []);
      } catch (err) {
        setError("Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [setNotifications]);

  const handleMarkAsRead = async (notification) => {
    if (notification.isRead) return;

    try {
      await markAsRead(notification._id);

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      setError("Unable to mark notification as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError("Unable to mark all notifications as read.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const notification = notifications.find(
        (item) => item._id === id
      );

      await deleteNotification(id);

      setNotifications((previous) =>
        previous.filter((item) => item._id !== id)
      );

      if (notification && !notification.isRead) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (err) {
      setError("Unable to delete notification.");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete all notifications?")) return;

    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError("Unable to delete notifications.");
    }
  };

  const handleOpen = async (notification) => {
    await handleMarkAsRead(notification);

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your financial activities.</p>
        </div>

        <div className="notification-header-actions">
          {unreadCount > 0 && (
            <button
              className="notification-action-btn"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck size={17} />
              Mark all as read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              className="notification-delete-all"
              onClick={handleDeleteAll}
            >
              <Trash2 size={17} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {error && <div className="notification-error">{error}</div>}

      <div className="notification-summary">
        <div className="notification-summary-icon">
          <Bell size={23} />
        </div>

        <div>
          <span>Unread notifications</span>
          <h2>{unreadCount}</h2>
        </div>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">
            <Bell size={42} />
            <h3>You're all caught up!</h3>
            <p>New notifications will appear here.</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon =
              iconMap[notification.type] || Bell;

            return (
              <div
                key={notification._id}
                className={`notification-card ${
                  notification.isRead ? "read" : "unread"
                }`}
              >
                <div className={`notification-icon ${notification.type}`}>
                  <Icon size={21} />
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{notification.title}</h3>

                    {!notification.isRead && (
                      <span className="unread-dot" />
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="notification-date">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>

                  {notification.actionUrl && (
                    <button
                      className="notification-open-btn"
                      onClick={() => handleOpen(notification)}
                    >
                      View details
                    </button>
                  )}
                </div>

                <div className="notification-card-actions">
                  {!notification.isRead && (
                    <button
                      title="Mark as read"
                      onClick={() => handleMarkAsRead(notification)}
                    >
                      <Check size={17} />
                    </button>
                  )}

                  <button
                    title="Delete notification"
                    onClick={() => handleDelete(notification._id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;