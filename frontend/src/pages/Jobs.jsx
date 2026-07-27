import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

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
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/jobs', { params: query ? { search: query } : {} });
      setJobs(data.jobs);
    } catch (err) {
      setError('Could not load jobs. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(search);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Open Positions</h3>
      <form className="d-flex gap-2 mb-4" onSubmit={handleSearch}>
        <input
          className="form-control"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
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
          <p>Try a different search term, or check back soon — new postings appear here as recruiters add them.</p>
        </div>
      )}

      <div className="row g-3">
        {!loading && jobs.map((job) => (
          <div className="col-md-6" key={job.id}>
            <div className="card h-100 job-type-accent" data-type={job.jobType}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="card-title mb-1">{job.title}</h5>
                  <span className="badge text-bg-light border">{job.jobType}</span>
                </div>
                <h6 className="card-subtitle mb-2 text-muted">{job.Recruiter?.companyName}</h6>
                <p className="card-text text-muted">
                  {job.location || 'Location not specified'}
                </p>
                <Link to={`/jobs/${job.id}`} className="btn btn-outline-primary btn-sm">
                  View details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
