import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get('/candidates/me/saved-jobs')
      .then(({ data }) => setSavedJobs(data.savedJobs))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUnsave = async (jobId) => {
    try {
      await api.delete(`/candidates/me/saved-jobs/${jobId}`);
      setSavedJobs((prev) => prev.filter((s) => s.jobId !== jobId));
      showToast('Removed from saved jobs.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not remove job', 'error');
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Saved Jobs</h3>
      {loading && <div className="skeleton" style={{ height: 200 }} />}
      {!loading && savedJobs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🤍</div>
          <h5>No saved jobs yet</h5>
          <p>Tap the heart icon on any job listing to save it for later.</p>
        </div>
      )}

      <div className="row g-3">
        {savedJobs.map((s) => (
          <div className="col-md-6" key={s.id}>
            <div className="card h-100 job-type-accent" data-type={s.Job?.jobType}>
              <div className="card-body">
                <h5 className="card-title">{s.Job?.title}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{s.Job?.Recruiter?.companyName}</h6>
                <p className="card-text text-muted">{s.Job?.location}</p>
                <div className="d-flex gap-2">
                  <Link to={`/jobs/${s.jobId}`} className="btn btn-outline-primary btn-sm">View details</Link>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleUnsave(s.jobId)}>Remove</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
