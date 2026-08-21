import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const activeToken = localStorage.getItem("token");
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/api/auth/me");
      if (response && response.data) {
        setUser(response.data);
      }
    } catch (err) {
      console.warn("Failed to fetch authenticated user session:", err.message);
      if (err.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const data = await api.post("/api/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || "Login failed");
  };

  const signup = async (name, email, password) => {
    const data = await api.post("/api/auth/signup", { name, email, password });
    if (data && data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isOnboarded: Boolean(user?.isOnboarded),
    isAdmin: user?.role === "admin",
    loading,
    login,
    signup,
    logout,
    refreshUser: fetchCurrentUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
