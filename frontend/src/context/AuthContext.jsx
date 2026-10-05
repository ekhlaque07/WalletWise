import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService";

/* eslint-disable react-refresh/only-export-components */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      setUser(data?.user || data || null);
    } catch (error) {
      console.error("Authentication check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const login = async (userData) => {
    const data = await loginUser(userData);

    if (!data?.token) {
      throw new Error("Login response did not contain a token.");
    }

    localStorage.setItem("token", data.token);
    setUser(data.user || null);

    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);

    if (data?.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user || null);
    }

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
};
