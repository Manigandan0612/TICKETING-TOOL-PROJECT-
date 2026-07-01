import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleRoute } from '../utils/roleRoutes';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4">Loading...</div>;

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleRoute(user.role)} replace />;
}
