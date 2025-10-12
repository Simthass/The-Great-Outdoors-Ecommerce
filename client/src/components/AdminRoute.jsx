import React from "react";
import ProtectedRoute from "./ProtectedRoute";

const AdminRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute requiredRole="Admin" fallbackPath="/" {...props}>
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;
