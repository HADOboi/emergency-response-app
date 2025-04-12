import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useUser();

  if (!user || user.role !== 'admin') {
    // Redirect to home if user is not authenticated or is not an admin
    return <Navigate to="/" replace />;
  }

  // Render children if user is authenticated and is an admin
  return <>{children}</>;
};

export default AdminRoute; 