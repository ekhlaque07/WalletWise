import API from "./api";

const getConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getNotifications = async () => {
  const response = await API.get("/notifications", getConfig());
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await API.get("/notifications/unread-count", getConfig());
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`, {}, getConfig());

  return response.data;
};

export const markAllAsRead = async () => {
  const response = await API.patch("/notifications/read-all", {}, getConfig());

  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await API.delete(`/notifications/${id}`, getConfig());

  return response.data;
};

export const deleteAllNotifications = async () => {
  const response = await API.delete("/notifications/delete-all", getConfig());

  return response.data;
};