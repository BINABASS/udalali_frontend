import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { role } = useUser();

  // If no role is set, redirect to login
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // If user has the allowed role, render children
  if (allowedRoles.includes(role)) {
    return children;
  }

  // If user has a different role, redirect to their dashboard
  switch (role) {
    case 'admin':
      return <Navigate to="/dashboard" replace />;
    case 'seller':
      return <Navigate to="/seller" replace />;
    case 'buyer':
      return <Navigate to="/buyer" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
