import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children if user is authenticated
  return <>{children}</>;
};

export default PrivateRoute; 