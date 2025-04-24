import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";

// Create auth context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (authService.isLoggedIn()) {
        try {
          // Get fresh user data from API
          const response = await authService.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          // Token might be expired or invalid
          authService.logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.data.user);
    return response;
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
  };

  // Value provided to consumers
  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === "admin",
    isAccompagnateur: user?.role === "accompagnateur",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
