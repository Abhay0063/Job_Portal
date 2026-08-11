import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_BASE } from '../api/axios';
import { useToast } from '../context/ToastContext';

const statusOptions = [
  { value: 'applied', label: 'Applied' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
];
const statusColor = {
  applied: 'bg-secondary',
  under_review: 'bg-info',
  shortlisted: 'bg-primary',
  interview_scheduled: 'bg-warning text-dark',
  selected: 'bg-success',
  rejected: 'bg-danger',
};

const interviewStatusOptions = ['scheduled', 'completed', 'passed', 'failed'];
const interviewStatusColor = {
  scheduled: 'bg-secondary',
  completed: 'bg-info',
  passed: 'bg-success',
  failed: 'bg-danger',
};

export default function JobApplicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useToast();

  // Scheduling a new interview
  const [scheduling, setScheduling] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ scheduledAt: '', mode: 'online', meetingLink: '' });

  // Editing an existing interview's status/notes
  const [editingInterview, setEditingInterview] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'scheduled', feedback: '' });
  const [viewingResumeFor, setViewingResumeFor] = useState(null); // application id whose resume is expanded

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
      showToast(err.response?.data?.message || 'Could not update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const openScheduleForm = (appId) => {
    setScheduling(appId);
    setScheduleForm({ scheduledAt: '', mode: 'online', meetingLink: '' });
  };

  const submitSchedule = async (appId) => {
    try {
      const { data } = await api.post('/interviews', {
        applicationId: appId,
        scheduledAt: scheduleForm.scheduledAt,
        mode: scheduleForm.mode,
        meetingLink: scheduleForm.meetingLink,
      });
      // Scheduling also auto-bumps the application status server-side — reflect both locally
      setApplications((prev) => prev.map((a) => (
        a.id === appId ? { ...a, Interview: data.interview, status: 'interview_scheduled' } : a
      )));
      setScheduling(null);
      showToast('Interview scheduled.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not schedule interview', 'error');
    }
  };

  const openEditInterview = (interview) => {
    setEditingInterview(interview.id);
    setEditForm({ status: interview.status, feedback: interview.feedback || '' });
  };

  const submitEditInterview = async (appId, interviewId) => {
    try {
      const { data } = await api.put(`/interviews/${interviewId}`, editForm);
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, Interview: data.interview } : a)));
      setEditingInterview(null);
      showToast('Interview updated.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update interview', 'error');
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

      <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Email</th>
            <th>Skills</th>
            <th>Cover Letter</th>
            <th>Resume</th>
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
              <td style={{ maxWidth: 220 }}>{app.coverLetter || '—'}</td>
              <td>
                {app.Candidate?.resumeUrl ? (
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setViewingResumeFor(app)}>
                    View Resume
                  </button>
                ) : (
                  <span className="text-muted small">Not uploaded</span>
                )}
              </td>
              <td>
                <select
                  className={`form-select form-select-sm text-white ${statusColor[app.status]}`}
                  value={app.status}
                  disabled={updatingId === app.id}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                >
                  {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </td>
              <td style={{ minWidth: 240 }}>
                {app.Interview ? (
                  editingInterview === app.Interview.id ? (
                    <div className="d-flex flex-column gap-1">
                      <label className="form-label mb-0 small text-muted">Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        {interviewStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <label className="form-label mb-0 small text-muted">Notes</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        value={editForm.feedback}
                        onChange={(e) => setEditForm({ ...editForm, feedback: e.target.value })}
                      />
                      <div className="d-flex gap-1 mt-1">
                        <button className="btn btn-sm btn-success" onClick={() => submitEditInterview(app.id, app.Interview.id)}>Save</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingInterview(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className={`badge ${interviewStatusColor[app.Interview.status]}`}>
                        {app.Interview.status}
                      </span>
                      <div className="small text-muted mt-1">{new Date(app.Interview.scheduledAt).toLocaleString()}</div>
                      {app.Interview.feedback && <div className="small mt-1">📝 {app.Interview.feedback}</div>}
                      <button className="btn btn-sm btn-link p-0 mt-1" onClick={() => openEditInterview(app.Interview)}>
                        Update status / notes
                      </button>
                    </div>
                  )
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

      {viewingResumeFor && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500,
          }}
          onClick={() => setViewingResumeFor(null)}
        >
          <div
            className="card"
            style={{ width: '90%', maxWidth: 800, height: '85vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body d-flex flex-column" style={{ minHeight: 0 }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">{viewingResumeFor.Candidate?.User?.name}'s Resume</h6>
                <button className="btn-close" onClick={() => setViewingResumeFor(null)} />
              </div>
              {viewingResumeFor.Candidate.resumeUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  title="resume-preview"
                  src={`${API_BASE}${viewingResumeFor.Candidate.resumeUrl}`}
                  style={{ flex: 1, border: '1px solid var(--jp-border)', borderRadius: 6 }}
                />
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <p>This resume is a Word document — inline preview isn't supported by browsers for this format.</p>
                  <a
                    href={`${API_BASE}${viewingResumeFor.Candidate.resumeUrl}`}
                    className="btn btn-primary btn-sm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
