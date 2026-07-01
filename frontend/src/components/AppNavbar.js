import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { displayRole } from '../utils/displayLabels';

export default function AppNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/login');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand">WAMIS Ticketing</span>

        <div className="ms-auto d-flex align-items-center text-white">
          <span className="me-3">
            {user?.username} {user?.role ? `(${displayRole(user.role)})` : ''}
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
