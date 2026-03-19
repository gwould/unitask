import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import DashboardPage from './pages/DashboardPage';
import PostJobPage from './pages/PostJobPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ManageJobsPage from './pages/ManageJobsPage';
import AdminFinancePage from './pages/AdminFinancePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/post-job" element={<PostJobPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/my-applications" element={<MyApplicationsPage />} />
        <Route path="/manage-jobs" element={<ManageJobsPage />} />
        <Route path="/admin-finance" element={<AdminFinancePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function NotFound() {
  return (
    <section className="page-notfound">
      <div className="container" style={{ textAlign: 'center', padding: '120px 20px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: 12 }}>404</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '1.1rem' }}>Trang bạn tìm không tồn tại.</p>
        <a href="/" className="btn btn-primary" style={{ marginTop: 24 }}>← Về trang chủ</a>
      </div>
    </section>
  );
}
