import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(({ data }) => setJob(data.job))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));

    if (user?.role === 'candidate') {
      api.get('/candidates/me/saved-jobs')
        .then(({ data }) => setSaved(data.savedJobs.some((s) => s.jobId === Number(id))))
        .catch(() => {});
    }
  }, [id]);

  const toggleSave = async () => {
    try {
      if (saved) {
        await api.delete(`/candidates/me/saved-jobs/${id}`);
        setSaved(false);
        showToast('Removed from saved jobs.', 'success');
      } else {
        await api.post('/candidates/me/saved-jobs', { jobId: Number(id) });
        setSaved(true);
        showToast('Job saved.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update saved jobs', 'error');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/applications', { jobId: Number(id), coverLetter });
      setApplied(true);
      showToast('Application submitted!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4" style={{ maxWidth: 700 }}>
        <div className="skeleton mb-2" style={{ height: 28, width: '60%' }} />
        <div className="skeleton mb-3" style={{ height: 16, width: '35%' }} />
        <div className="skeleton" style={{ height: 100, width: '100%' }} />
      </div>
    );
  }

  if (loadError || !job) {
    return (
      <div className="empty-state" style={{ marginTop: '3rem' }}>
        <div className="empty-icon">📭</div>
        <h5>Job not found</h5>
        <p>This posting may have been removed or the link is incorrect.</p>
      </div>
    );
  }

  const isClosed = job.status !== 'open';

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h3 className="mb-1">{job.title}</h3>
          <h6 className="text-muted">{job.Recruiter?.companyName} · {job.location}</h6>
        </div>
        <div className="d-flex align-items-center gap-2">
          {isClosed && <span className="badge bg-secondary">Closed</span>}
          {user?.role === 'candidate' && (
            <button className="btn btn-sm btn-outline-secondary" onClick={toggleSave}>
              {saved ? '❤️ Saved' : '🤍 Save'}
            </button>
          )}
        </div>
      </div>

      <p className="mt-3">{job.description}</p>
      <p><strong>Type:</strong> {job.jobType}</p>
      {job.skillsRequired && <p><strong>Skills Required:</strong> {job.skillsRequired}</p>}
      {job.experienceRequired && <p><strong>Experience Required:</strong> {job.experienceRequired}</p>}
      {(job.salaryMin || job.salaryMax) && (
        <p><strong>Salary:</strong> {job.salaryMin ?? '?'} – {job.salaryMax ?? '?'}</p>
      )}

      {isClosed && (
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h6>This job is no longer accepting applications</h6>
          <p>The recruiter has closed this posting.</p>
        </div>
      )}

      {!isClosed && user?.role === 'candidate' && !applied && (
        <form onSubmit={handleApply} className="mt-4 border-top pt-3">
          <h5>Apply to this job</h5>
          <textarea
            className="form-control mb-2"
            rows={4}
            placeholder="Cover letter (optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}

      {!isClosed && applied && (
        <div className="mt-4 border-top pt-3">
          <p className="text-success mb-0">✓ You've applied to this job. Check "My Applications" for status updates.</p>
        </div>
      )}

      {!isClosed && !user && <p className="mt-3 text-muted">Log in as a candidate to apply.</p>}
      {!isClosed && user?.role === 'recruiter' && <p className="mt-3 text-muted">Recruiters cannot apply to jobs.</p>}
    </div>
  );
}
