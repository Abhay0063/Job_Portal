import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function JobCardSkeleton() {
  return (
    <div className="col-md-6">
      <div className="card h-100">
        <div className="card-body">
          <div className="skeleton mb-2" style={{ height: 22, width: '70%' }} />
          <div className="skeleton mb-3" style={{ height: 14, width: '40%' }} />
          <div className="skeleton mb-3" style={{ height: 14, width: '90%' }} />
          <div className="skeleton" style={{ height: 30, width: 110 }} />
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());

  const fetchJobs = async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: targetPage, limit: 6 };
      if (search) params.search = search;
      if (location) params.location = location;
      if (jobType) params.jobType = jobType;
      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch (err) {
      setError('Could not load jobs. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    if (user?.role !== 'candidate') return;
    try {
      const { data } = await api.get('/candidates/me/saved-jobs');
      setSavedIds(new Set(data.savedJobs.map((s) => s.jobId)));
    } catch {
      // silently ignore — saved-state is a nice-to-have, not critical to page function
    }
  };

  useEffect(() => { fetchJobs(1); fetchSaved(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const toggleSave = async (jobId) => {
    try {
      if (savedIds.has(jobId)) {
        await api.delete(`/candidates/me/saved-jobs/${jobId}`);
        setSavedIds((prev) => { const next = new Set(prev); next.delete(jobId); return next; });
        showToast('Removed from saved jobs.', 'success');
      } else {
        await api.post('/candidates/me/saved-jobs', { jobId });
        setSavedIds((prev) => new Set(prev).add(jobId));
        showToast('Job saved.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update saved jobs', 'error');
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Open Positions</h3>
      <form className="row g-2 mb-4" onSubmit={handleFilter}>
        <div className="col-md-4">
          <input className="form-control" placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
            <option value="">All job types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" type="submit">Filter</button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="row g-3">
          <JobCardSkeleton /><JobCardSkeleton />
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h5>No jobs found</h5>
          <p>Try different search terms or filters.</p>
        </div>
      )}

      <div className="row g-3">
        {!loading && jobs.map((job) => (
          <div className="col-md-6" key={job.id}>
            <div className="card h-100 job-type-accent" data-type={job.jobType}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="card-title mb-1">{job.title}</h5>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge text-bg-light border">{job.jobType}</span>
                    {user?.role === 'candidate' && (
                      <button
                        className="btn btn-sm p-0 border-0 bg-transparent fs-5"
                        title={savedIds.has(job.id) ? 'Unsave' : 'Save job'}
                        onClick={() => toggleSave(job.id)}
                      >
                        {savedIds.has(job.id) ? '❤️' : '🤍'}
                      </button>
                    )}
                  </div>
                </div>
                <h6 className="card-subtitle mb-2 text-muted">{job.Recruiter?.companyName}</h6>
                <p className="card-text text-muted mb-1">{job.location || 'Location not specified'}</p>
                {job.skillsRequired && <p className="small mb-1"><strong>Skills:</strong> {job.skillsRequired}</p>}
                <Link to={`/jobs/${job.id}`} className="btn btn-outline-primary btn-sm mt-2">
                  View details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => fetchJobs(page - 1)}>
            ← Previous
          </button>
          <span className="align-self-center small text-muted">Page {page} of {totalPages}</span>
          <button className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages} onClick={() => fetchJobs(page + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
