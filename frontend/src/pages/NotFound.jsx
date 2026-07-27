import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty-state" style={{ marginTop: '4rem' }}>
      <div className="empty-icon">🗂️</div>
      <h4>Page not found</h4>
      <p className="mb-3">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn btn-primary btn-sm">Back to job listings</Link>
    </div>
  );
}
