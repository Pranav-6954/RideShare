import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { verifyJWT, getToken } from "../utils/jwt";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = getToken();
  const user = verifyJWT(token);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/dashboard" replace />;
    if (user.role === "user") return <Navigate to="/user-rides" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
