import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-3" style={{ background: 'var(--jp-navy)' }}>
      <Link className="navbar-brand brand-mark text-white" to="/">
        <span className="brand-dot" />
        Job Portal
      </Link>
      <div className="d-flex ms-auto gap-3 align-items-center">
        <Link className="nav-link text-white-50" to="/">Jobs</Link>
        {user?.role === 'recruiter' && (
          <Link className="nav-link text-white-50" to="/my-jobs">My Postings</Link>
        )}
        {user?.role === 'candidate' && (
          <>
            <Link className="nav-link text-white-50" to="/my-applications">My Applications</Link>
            <Link className="nav-link text-white-50" to="/saved-jobs">Saved Jobs</Link>
            <Link className="nav-link text-white-50" to="/my-profile">My Profile</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <Link className="nav-link text-white-50" to="/admin-dashboard">Admin Dashboard</Link>
        )}
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
    </nav>
  );
}
