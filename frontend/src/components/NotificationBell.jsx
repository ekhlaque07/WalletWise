import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <button
      className="notification-bell"
      onClick={() => navigate("/notifications")}
      aria-label={`Notifications, ${unreadCount} unread`}
      title="Notifications"
    >
      <Bell size={21} />

      {unreadCount > 0 && (
        <span className="notification-badge">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;