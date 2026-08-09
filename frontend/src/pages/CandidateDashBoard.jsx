import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusLabel = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  selected: 'Selected',
  rejected: 'Rejected',
};
const statusColor = {
  applied: 'bg-secondary',
  under_review: 'bg-info',
  shortlisted: 'bg-primary',
  interview_scheduled: 'bg-warning text-dark',
  selected: 'bg-success',
  rejected: 'bg-danger',
};

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

export default function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/applications/my'),
      api.get('/candidates/me/saved-jobs'),
      api.get('/interviews/my'),
    ]).then(([appsRes, savedRes, interviewsRes]) => {
      setApplications(appsRes.data.applications);
      setSavedJobs(savedRes.data.savedJobs);
      setInterviews(interviewsRes.data.interviews);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mt-4"><div className="skeleton" style={{ height: 400 }} /></div>;

  const upcomingInterviews = interviews
    .filter((iv) => iv.status === 'scheduled' && new Date(iv.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const selectedCount = applications.filter((a) => a.status === 'selected').length;

  return (
    <div className="container mt-4">
      <h3 className="mb-3">My Dashboard</h3>

      <div className="row g-3 mb-4">
        <StatCard label="Applied Jobs" value={applications.length} />
        <StatCard label="Saved Jobs" value={savedJobs.length} />
        <StatCard label="Upcoming Interviews" value={upcomingInterviews.length} />
        <StatCard label="Selected" value={selectedCount} />
      </div>

      <div className="row g-4">
        {/* Application status tracking */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Recent Applications</h6>
                <Link to="/my-applications" className="small">View all →</Link>
              </div>
              {applications.length === 0 ? (
                <p className="text-muted small mb-0">No applications yet.</p>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="small fw-medium">{app.Job?.title}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>{app.Job?.location}</div>
                    </div>
                    <span className={`badge ${statusColor[app.status] || 'bg-secondary'}`}>
                      {statusLabel[app.status] || app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Interview schedule */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="mb-2">Upcoming Interviews</h6>
              {upcomingInterviews.length === 0 ? (
                <p className="text-muted small mb-0">No upcoming interviews scheduled.</p>
              ) : (
                upcomingInterviews.map((iv) => (
                  <div key={iv.id} className="py-2 border-bottom">
                    <div className="small fw-medium">{iv.Application?.Job?.title}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {new Date(iv.scheduledAt).toLocaleString()} · {iv.mode}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Saved jobs preview */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Saved Jobs</h6>
                <Link to="/saved-jobs" className="small">View all →</Link>
              </div>
              {savedJobs.length === 0 ? (
                <p className="text-muted small mb-0">No saved jobs yet.</p>
              ) : (
                <div className="row g-2">
                  {savedJobs.slice(0, 3).map((s) => (
                    <div className="col-md-4" key={s.id}>
                      <Link to={`/jobs/${s.jobId}`} className="text-decoration-none">
                        <div className="border rounded p-2">
                          <div className="small fw-medium text-body">{s.Job?.title}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>{s.Job?.Recruiter?.companyName}</div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
