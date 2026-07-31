import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function PostJob() {
  const [form, setForm] = useState({
    title: '', description: '', location: '', jobType: 'full-time', salaryMin: '', salaryMax: '',
    skillsRequired: '', experienceRequired: '',
  });
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/jobs', form);
      showToast('Job posted successfully!', 'success');
      navigate(`/jobs/${data.job.id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h3>Post a New Job</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input className="form-control" required
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={4} required
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Location</label>
          <input className="form-control"
            value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Job Type</label>
          <select className="form-select" value={form.jobType}
            onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Min Salary (optional)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 30000"
              value={form.salaryMin}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
            />
          </div>
          <div className="col">
            <label className="form-label">Max Salary (optional)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 50000"
              value={form.salaryMax}
              onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Skills Required</label>
          <input
            className="form-control"
            placeholder="e.g. React, Node.js, SQL"
            value={form.skillsRequired}
            onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })}
          />
          <div className="form-text">Comma-separated list.</div>
        </div>
        <div className="mb-3">
          <label className="form-label">Experience Required</label>
          <input
            className="form-control"
            placeholder="e.g. 2-4 years"
            value={form.experienceRequired}
            onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })}
          />
        </div>
        <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}
