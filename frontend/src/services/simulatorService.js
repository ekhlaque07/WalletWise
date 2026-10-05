import API from "./api";

export const simulateScenario = async (data) => {
  const token = localStorage.getItem("token");

  const response = await API.post( "/simulator/simulate",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};