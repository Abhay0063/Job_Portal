import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-3" style={{ background: 'var(--jp-navy)' }}>
      <div className="container-fluid px-0">
        <Link className="navbar-brand brand-mark text-white" to="/">
          <span className="brand-dot" />
          Job Portal
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="d-flex flex-column flex-lg-row ms-lg-auto gap-2 gap-lg-3 align-items-start align-items-lg-center mt-3 mt-lg-0 pb-3 pb-lg-0">
            <Link className="nav-link text-white-50" to="/">Jobs</Link>
            {user?.role === 'recruiter' && (
              <Link className="nav-link text-white-50" to="/my-jobs">My Postings</Link>
            )}
            {user?.role === 'candidate' && (
              <>
                <Link className="nav-link text-white-50" to="/candidate-dashboard">Dashboard</Link>
                <Link className="nav-link text-white-50" to="/my-applications">My Applications</Link>
                <Link className="nav-link text-white-50" to="/saved-jobs">Saved Jobs</Link>
                <Link className="nav-link text-white-50" to="/my-profile">My Profile</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link className="nav-link text-white-50" to="/admin-dashboard">Admin Dashboard</Link>
            )}

            <div className="d-flex align-items-center gap-2 gap-lg-3 flex-wrap">
              <button
                className="btn btn-sm btn-outline-light"
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              {user && <NotificationBell />}
              {user ? (
                <>
                  <span className="text-white-50 small">{user.name} · {user.role}</span>
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
                  <Link className="btn btn-sm" style={{ background: 'var(--jp-amber)', color: 'var(--jp-navy-dark)', fontWeight: 600 }} to="/register">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
