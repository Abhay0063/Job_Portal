import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

function StatCard({ label, value }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card text-center h-100">
        <div className="card-body">
          <div className="fs-3 fw-bold" style={{ color: 'var(--jp-navy)' }}>{value}</div>
          <div className="text-muted small">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([
      api.get('/jobs/my/postings'),
      api.get('/jobs/my/stats'),
    ]).then(([jobsRes, statsRes]) => {
      setJobs(jobsRes.data.jobs);
      setStats(statsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    setUpdatingId(job.id);
    try {
      await api.put(`/jobs/${job.id}`, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j)));
      setStats((prev) => prev && ({
        ...prev,
        activeJobListings: prev.activeJobListings + (newStatus === 'open' ? 1 : -1),
      }));
      showToast(`Job ${newStatus === 'closed' ? 'closed' : 'reopened'}.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update job status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Recruiter Dashboard</h3>
        <Link to="/post-job" className="btn btn-primary">+ Post New Job</Link>
      </div>

      {stats && (
        <div className="row g-3 mb-4">
          <StatCard label="Active Job Listings" value={stats.activeJobListings} />
          <StatCard label="Open Positions" value={stats.activeJobListings} />
          <StatCard label="Total Applications" value={stats.totalApplications} />
          <StatCard label="Shortlisted Candidates" value={stats.shortlistedCount} />
        </div>
      )}

      <h5 className="mb-3">My Job Postings</h5>

      {loading && <div className="skeleton" style={{ height: 200 }} />}
      {!loading && jobs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h5>No postings yet</h5>
          <p>Once you post a job, it'll show up here with applicant counts.</p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>Title</th><th>Status</th><th>Applicants</th><th></th></tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>
                    <span className={`badge ${job.status === 'open' ? 'bg-success' : 'bg-secondary'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>{job.Applications?.length ?? 0}</td>
                  <td className="text-nowrap">
                    <Link to={`/jobs/${job.id}`} className="me-2">View</Link>
                    <Link to={`/my-jobs/${job.id}/applicants`} className="me-2">Applicants</Link>
                    <button
                      className={`btn btn-sm ${job.status === 'open' ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                      disabled={updatingId === job.id}
                      onClick={() => toggleStatus(job)}
                    >
                      {job.status === 'open' ? 'Close' : 'Reopen'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
