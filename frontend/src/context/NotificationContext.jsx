import { createContext, useContext, useEffect, useState } from "react";

import { io } from "socket.io-client";

import {
  getNotifications,
  getUnreadCount,
} from "../services/notificationService";

import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let active = true;

    const loadNotifications = async () => {
      try {
        const [notificationData, unreadData] = await Promise.all([
          getNotifications(),
          getUnreadCount(),
        ]);

        if (!active) return;

        setNotifications(notificationData.notifications || []);
        setUnreadCount(unreadData.count || 0);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();

    const socketURL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    const newSocket = io("http://localhost:5000", {
      auth: {
        token,
      },
    });

    setSocket(newSocket);

    newSocket.on("connect_error", (error) => {
      console.error("Notification socket error:", error.message);
    });

    newSocket.on("newNotification", (notification) => {
      if (!active) return;

      setNotifications((previous) => {
        if (previous.some((item) => item._id === notification._id)) {
          return previous;
        }

        return [notification, ...previous];
      });

      if (!notification.isRead) {
        setUnreadCount((count) => count + 1);
      }
    });

    return () => {
      active = false;
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        socket,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }

  return context;
};
