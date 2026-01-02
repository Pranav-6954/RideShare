import React from 'react';
import { Navigate } from "react-router-dom";
import { verifyJWT } from "../utils/jwt";

const RootRedirect = () => {
    const user = verifyJWT();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "ROLE_ADMIN") return <Navigate to="/dashboard" replace />;
    if (user.role === "ROLE_DRIVER") return <Navigate to="/driver-dashboard" replace />;
    if (user.role === "ROLE_USER") return <Navigate to="/user-rides" replace />;
    return <Navigate to="/login" replace />;
};

export default RootRedirect;
