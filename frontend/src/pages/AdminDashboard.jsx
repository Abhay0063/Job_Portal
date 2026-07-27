import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

function StatCard({ label, value }) {
  return (
    <div className="col-6 col-md-4 col-lg-2">
      <div className="card text-center h-100">
        <div className="card-body">
          <div className="fs-3 fw-bold" style={{ color: 'var(--jp-navy)' }}>{value}</div>
          <div className="text-muted small">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/users'),
    ]).then(([dashRes, usersRes]) => {
      setData(dashRes.data);
      setUsers(usersRes.data.users);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This also removes their profile, jobs, and applications.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User deleted.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete user', 'error');
    }
  };

  if (loading) return <div className="container mt-4"><div className="skeleton" style={{ height: 400 }} /></div>;

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Admin Dashboard</h3>

      <div className="row g-3 mb-4">
        <StatCard label="Total Users" value={data.stats.totalUsers} />
        <StatCard label="Recruiters" value={data.stats.totalRecruiters} />
        <StatCard label="Candidates" value={data.stats.totalCandidates} />
        <StatCard label="Jobs Posted" value={data.stats.totalJobs} />
        <StatCard label="Applications" value={data.stats.totalApplications} />
        <StatCard label="Active Jobs" value={data.stats.activeJobs} />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title">User Growth</h6>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1f3a5f" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title">Applications per Month</h6>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.applicationsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#e8a33d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Jobs Posted by Recruiter</h6>
              {data.jobsByRecruiter.length === 0 ? (
                <p className="text-muted">No jobs posted yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.jobsByRecruiter} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} fontSize={12} />
                    <YAxis type="category" dataKey="company" width={140} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2a9d8f" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <h5>Manage Users</h5>
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className="badge bg-secondary">{u.role}</span></td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                {u.role !== 'admin' && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id, u.name)}>
                    Delete
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
