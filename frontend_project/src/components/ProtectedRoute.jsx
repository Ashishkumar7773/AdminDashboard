import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) return <Navigate to="/login" />;

    const decoded = jwtDecode(token);
    const allowedRoles = ["admin", "superadmin", "editor"];

    if (!decoded.role || !allowedRoles.includes(decoded.role.toLowerCase())) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;