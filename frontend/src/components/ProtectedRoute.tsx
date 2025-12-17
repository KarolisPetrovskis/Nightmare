import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/userRole';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: number;
  allowedRoles?: number[];
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  allowedRoles 
}: ProtectedRouteProps) {
  const { userType, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // SuperAdmin has access to everything
  if (userType === UserRole.SuperAdmin) {
    return <>{children}</>;
  }

  // Check if user is in allowed roles list (if specified, only these roles can access)
  if (allowedRoles !== undefined && userType !== null) {
    if (!allowedRoles.includes(userType)) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // Check if user has required role (minimum role requirement)
  if (requiredRole !== undefined && userType !== null) {
    if (userType < requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
