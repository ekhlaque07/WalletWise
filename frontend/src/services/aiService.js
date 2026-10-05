import API from "./api";

export const askAIAdvisor = async (question) => {
  const token = localStorage.getItem("token");

  const response = await API.post("/ai-advisor", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      question,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to get AI advice"
    );
  }

  return data;
};