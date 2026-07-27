import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const statusOptions = ['applied', 'shortlisted', 'rejected', 'hired'];
const statusColor = {
  applied: 'bg-secondary',
  shortlisted: 'bg-info',
  rejected: 'bg-danger',
  hired: 'bg-success',
};

export default function JobApplicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [scheduling, setScheduling] = useState(null); // application id currently being scheduled
  const [scheduleForm, setScheduleForm] = useState({ scheduledAt: '', mode: 'online', meetingLink: '' });

  const load = () => {
    setLoading(true);
    api.get(`/applications/job/${jobId}`)
      .then(({ data }) => setApplications(data.applications))
      .catch((err) => setError(err.response?.data?.message || 'Could not load applicants'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const openScheduleForm = (appId) => {
    setScheduling(appId);
    setScheduleForm({ scheduledAt: '', mode: 'online', meetingLink: '' });
  };

  const submitSchedule = async (appId) => {
    setError('');
    try {
      const { data } = await api.post('/interviews', {
        applicationId: appId,
        scheduledAt: scheduleForm.scheduledAt,
        mode: scheduleForm.mode,
        meetingLink: scheduleForm.meetingLink,
      });
      // Update the actual application record with the real Interview from the server,
      // instead of a local flag that would forget itself on refresh.
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, Interview: data.interview } : a)));
      setScheduling(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule interview');
    }
  };

  return (
    <div className="container mt-4">
      <Link to="/my-jobs" className="btn btn-outline-secondary btn-sm mb-3">← Back to My Postings</Link>
      <h3>Applicants</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="skeleton" style={{ height: 200 }} />}
      {!loading && applications.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👋</div>
          <h5>No applicants yet</h5>
          <p>Share this job posting to start receiving applications.</p>
        </div>
      )}

      <table className="table align-middle">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Email</th>
            <th>Skills</th>
            <th>Cover Letter</th>
            <th>Status</th>
            <th>Interview</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.Candidate?.User?.name}</td>
              <td>{app.Candidate?.User?.email}</td>
              <td>{app.Candidate?.skills || '—'}</td>
              <td style={{ maxWidth: 250 }}>{app.coverLetter || '—'}</td>
              <td>
                <select
                  className={`form-select form-select-sm text-white ${statusColor[app.status]}`}
                  value={app.status}
                  disabled={updatingId === app.id}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                >
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td style={{ minWidth: 220 }}>
                {app.Interview ? (
                  <span className="badge bg-success">
                    Scheduled: {new Date(app.Interview.scheduledAt).toLocaleString()}
                  </span>
                ) : scheduling === app.id ? (
                  <div className="d-flex flex-column gap-1">
                    <label className="form-label mb-0 small text-muted">Date &amp; time</label>
                    <input
                      type="datetime-local"
                      className="form-control form-control-sm"
                      value={scheduleForm.scheduledAt}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                    />
                    <label className="form-label mb-0 small text-muted">Mode</label>
                    <select
                      className="form-select form-select-sm"
                      value={scheduleForm.mode}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, mode: e.target.value })}
                    >
                      <option value="online">Online</option>
                      <option value="in-person">In-person</option>
                      <option value="phone">Phone</option>
                    </select>
                    <label className="form-label mb-0 small text-muted">Meeting link (optional)</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="https://..."
                      value={scheduleForm.meetingLink}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                    />
                    <div className="d-flex gap-1 mt-1">
                      <button
                        className="btn btn-sm btn-success"
                        disabled={!scheduleForm.scheduledAt}
                        onClick={() => submitSchedule(app.id)}
                      >
                        Confirm
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setScheduling(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-sm btn-outline-primary" onClick={() => openScheduleForm(app.id)}>
                    Schedule Interview
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
