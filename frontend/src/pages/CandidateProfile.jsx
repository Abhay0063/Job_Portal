import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function CandidateProfile() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ skills: '', education: '', experienceYears: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    api.get('/candidates/me').then(({ data }) => {
      setProfile(data.candidate);
      setForm({
        skills: data.candidate.skills || '',
        education: data.candidate.education || '',
        experienceYears: data.candidate.experienceYears || 0,
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/candidates/me', form);
      setProfile(data.candidate);
      showToast('Profile updated.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const { data } = await api.post('/candidates/me/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((prev) => ({ ...prev, resumeUrl: data.resumeUrl }));
      setFile(null);
      showToast('Resume uploaded.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not upload resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="container mt-4"><div className="skeleton" style={{ height: 300 }} /></div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h3 className="mb-3">My Profile</h3>
      <p className="text-muted">{profile?.User?.name} · {profile?.User?.email}</p>

      <form onSubmit={handleSave} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Skills</label>
          <input
            className="form-control"
            placeholder="e.g. React, Node.js, SQL"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />
          <div className="form-text">Comma-separated list.</div>
        </div>
        <div className="mb-3">
          <label className="form-label">Education</label>
          <input
            className="form-control"
            placeholder="e.g. B.Tech Computer Science"
            value={form.education}
            onChange={(e) => setForm({ ...form, education: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Years of Experience</label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={form.experienceYears}
            onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
          />
        </div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <div className="border-top pt-3">
        <h5>Resume</h5>
        {profile?.resumeUrl ? (
          <>
            {profile.resumeUrl.toLowerCase().endsWith('.pdf') ? (
              <iframe
                title="my-resume-preview"
                src={`http://localhost:5000${profile.resumeUrl}`}
                style={{ width: '100%', height: 400, border: '1px solid var(--jp-border)', borderRadius: 6 }}
                className="mb-2"
              />
            ) : (
              <p className="text-muted small">Word documents can't be previewed inline — use the link below to open it.</p>
            )}
            <p>
              <a href={`http://localhost:5000${profile.resumeUrl}`} target="_blank" rel="noreferrer">
                Open in new tab
              </a>
            </p>
          </>
        ) : (
          <p className="text-muted">No resume uploaded yet.</p>
        )}
        <form onSubmit={handleUpload} className="d-flex gap-2">
          <input
            type="file"
            className="form-control"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button className="btn btn-outline-primary" disabled={!file || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        <div className="form-text">PDF, DOC, or DOCX. Max 5MB.</div>
      </div>
    </div>
  );
}
