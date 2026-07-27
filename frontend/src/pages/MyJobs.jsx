import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/jobs/my/postings').then(({ data }) => setJobs(data.jobs)).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    setUpdatingId(job.id);
    try {
      await api.put(`/jobs/${job.id}`, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j)));
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
        <h3>My Job Postings</h3>
        <Link to="/post-job" className="btn btn-primary">+ Post New Job</Link>
      </div>

      {loading && <div className="skeleton" style={{ height: 200 }} />}
      {!loading && jobs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h5>No postings yet</h5>
          <p>Once you post a job, it'll show up here with applicant counts.</p>
        </div>
      )}

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
              <td>
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
  );
}
