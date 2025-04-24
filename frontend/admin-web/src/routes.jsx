import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading state
  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check if user has this role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and role is correct (or no role required), render children
  return children;
};

export default ProtectedRoute;
