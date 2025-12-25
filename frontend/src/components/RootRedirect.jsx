import React from 'react';
import { Navigate } from "react-router-dom";
import { verifyJWT } from "../utils/jwt";

const RootRedirect = () => {
    const user = verifyJWT();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "admin") return <Navigate to="/dashboard" replace />;
    if (user.role === "driver") return <Navigate to="/driver-dashboard" replace />;
    return <Navigate to="/user-rides" replace />;
};

export default RootRedirect;
