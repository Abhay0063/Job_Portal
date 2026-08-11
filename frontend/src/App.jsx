import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import MyJobs from './pages/MyJobs';
import JobApplicants from './pages/JobApplicants';
import MyApplications from './pages/MyApplications';
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateProfile from './pages/CandidateProfile';
import SavedJobs from './pages/SavedJobs';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route
          path="/post-job"
          element={<ProtectedRoute roles={['recruiter']}><PostJob /></ProtectedRoute>}
        />
        <Route
          path="/my-jobs"
          element={<ProtectedRoute roles={['recruiter']}><MyJobs /></ProtectedRoute>}
        />
        <Route
          path="/my-jobs/:jobId/applicants"
          element={<ProtectedRoute roles={['recruiter']}><JobApplicants /></ProtectedRoute>}
        />
        <Route
          path="/candidate-dashboard"
          element={<ProtectedRoute roles={['candidate']}><CandidateDashboard /></ProtectedRoute>}
        />
        <Route
          path="/my-applications"
          element={<ProtectedRoute roles={['candidate']}><MyApplications /></ProtectedRoute>}
        />
        <Route
          path="/my-profile"
          element={<ProtectedRoute roles={['candidate']}><CandidateProfile /></ProtectedRoute>}
        />
        <Route
          path="/saved-jobs"
          element={<ProtectedRoute roles={['candidate']}><SavedJobs /></ProtectedRoute>}
        />
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
