import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PostJobPage = lazy(() => import('./pages/PostJobPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const MyApplicationsPage = lazy(() => import('./pages/MyApplicationsPage'));
const ManageJobsPage = lazy(() => import('./pages/ManageJobsPage'));
const AdminFinancePage = lazy(() => import('./pages/AdminFinancePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BusinessAutomationPage = lazy(() => import('./pages/BusinessAutomationPage'));
const AutomationRulesPage = lazy(() => import('./pages/AutomationRulesPage'));
const NotificationHubPage = lazy(() => import('./pages/NotificationHubPage.tsx'));
const MessagesPage = lazy(() => import('./pages/MessagesPage.tsx'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AdminMessagesPage = lazy(() => import('./pages/AdminMessagesPage'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
          <Route path="/business-automation" element={<BusinessAutomationPage />} />
          <Route path="/automation-rules" element={<AutomationRulesPage />} />
          <Route path="/notifications" element={<NotificationHubPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:conversationId" element={<MessagesPage />} />
          <Route path="/admin-finance" element={<AdminFinancePage />} />
          <Route path="/admin-messages" element={<AdminMessagesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
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
