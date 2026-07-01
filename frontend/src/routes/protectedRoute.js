import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleRoute } from '../utils/roleRoutes';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={getRoleRoute(user.role)} replace />;
  }

  return children;
}
