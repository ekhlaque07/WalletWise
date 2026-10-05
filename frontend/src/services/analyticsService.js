import API from "./api";

export const getAnalytics = async () => {
  const response = await API.get("/analytics");
  return response.data;
};
