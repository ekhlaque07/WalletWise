import API from "./api";

// Get authentication token
const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ==========================================
// GET PROFILE
// ==========================================
export const getProfile = async () => {
  const response = await API.get("/user/profile", getAuthConfig());

  return response.data;
};

// ==========================================
// UPDATE USERNAME
// ==========================================
export const updateProfile = async (username) => {
  const response = await API.put(
    "/user/profile",
    {
      username,
    },
    getAuthConfig()
  );

  return response.data;
};

// ==========================================
// CHANGE PASSWORD
// ==========================================
export const changePassword = async (
  currentPassword,
  newPassword,
  confirmPassword
) => {
  const response = await API.put(
    "/user/password",
    {
      currentPassword,
      newPassword,
      confirmPassword,
    },
    getAuthConfig()
  );

  return response.data;
};

// ==========================================
// DELETE ACCOUNT
// ==========================================
export const deleteAccount = async (confirmation) => {
  const response = await API.delete(
    "/user/account",
    {
      ...getAuthConfig(),
      data: {
        confirmation,
      },
    }
  );

  return response.data;
};