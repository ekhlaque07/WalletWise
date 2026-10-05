
import API from "./api";

export const chatWithAgent = async (message) => {
  const token = localStorage.getItem("token");

  const response = await API.post(
    "/agent/chat",
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};