import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { verifyJWT, getToken } from "../utils/jwt";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = getToken();
  const user = verifyJWT(token);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "ROLE_ADMIN") return <Navigate to="/dashboard" replace />;
    if (user.role === "ROLE_USER") return <Navigate to="/user-rides" replace />;
    if (user.role === "ROLE_DRIVER") return <Navigate to="/driver-dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
