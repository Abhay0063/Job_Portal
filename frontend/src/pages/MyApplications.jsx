import { useEffect, useState } from 'react';
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

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [interviewsByAppId, setInterviewsByAppId] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/applications/my'),
      api.get('/interviews/my'),
    ]).then(([appsRes, interviewsRes]) => {
      setApplications(appsRes.data.applications);
      const map = {};
      interviewsRes.data.interviews.forEach((iv) => {
        map[iv.applicationId] = iv;
      });
      setInterviewsByAppId(map);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mt-4">
      <h3>My Applications</h3>
      {loading && <div className="skeleton" style={{ height: 200 }} />}
      {!loading && applications.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h5>No applications yet</h5>
          <p>Browse open positions and apply — your applications will show up here.</p>
        </div>
      )}

      <table className="table">
        <thead>
          <tr><th>Job</th><th>Location</th><th>Status</th><th>Applied On</th><th>Interview</th></tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const interview = interviewsByAppId[app.id];
            return (
              <tr key={app.id}>
                <td>{app.Job?.title}</td>
                <td>{app.Job?.location}</td>
                <td><span className={`badge ${statusColor[app.status] || 'bg-secondary'}`}>{statusLabel[app.status] || app.status}</span></td>
                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td>
                  {interview ? (
                    <div>
                      <div className="text-success small">
                        {new Date(interview.scheduledAt).toLocaleString()} ({interview.mode})
                      </div>
                      <span className="badge bg-light text-dark border">{interview.status}</span>
                    </div>
                  ) : (
                    <span className="text-muted">Not scheduled</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
