import API from "./api";

export const registerUser = async (userData) => {
    const response = await API.post("/auth/register", userData);

    return response.data;
};

export const loginUser = async (userData) => {
    const response = await API.post("/auth/login", userData);

    return response.data;
};

export const getCurrentUser = async () => {
    const response = await API.get("/auth/me");

    return response.data;
};


export const forgotPassword = async (email) => {
    const response = await API.post(
        "/auth/forgot-password",
        { email }
    );

    return response.data;
};

export const resetPassword = async (
    token,
    password,
    confirmPassword
) => {
    const response = await API.post(
        `/auth/reset-password/${encodeURIComponent(token)}`,
        {
            password,
            confirmPassword,
        }
    );

    return response.data;
};