import { Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'customer') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/panel" replace />;
    }
  }

  return children;
};
