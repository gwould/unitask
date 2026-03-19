import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobsData, applicationsData } from '../data/mockData';
import { APP_STATUS_MAP, STORAGE_KEYS } from '../constants';
import { formatMoney } from '../utils/format';
import { simulateDelay } from '../utils/async';
import type { Job } from '../types';

/* ─── TYPES ───────────────────────────────────────── */

interface AppRecord {
  id: string;
  jobId: number;
  userId: string;
  coverLetter: string;
  status: string;
  appliedAt: string;
}

type Period = '7d' | '30d' | 'all';

/* ─── CONSTANTS ───────────────────────────────────── */

const STATUS_MAP: Record<string, { label: string; cls: string }> = APP_STATUS_MAP;

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: '7d',  label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
  { key: 'all', label: 'Tất cả' },
];

/* ─── HELPERS ─────────────────────────────────────── */

function getApplications(userId: string): AppRecord[] {
  try {
    const seeded: AppRecord[] = applicationsData;
    const stored: AppRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
    return [...seeded, ...stored].filter((a) => a.userId === userId);
  } catch {
    return [];
  }
}

function getPostedJobs(companyId: string): Job[] {
  try {
    const custom: Job[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_JOBS) || '[]');
    return [...jobsData, ...custom].filter((j) => j.companyId === companyId);
  } catch {
    return jobsData.filter((j) => j.companyId === companyId);
  }
}

function getAllApplications(): AppRecord[] {
  try {
    const stored: AppRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
    return [...applicationsData, ...stored];
  } catch {
    return applicationsData;
  }
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function isExpired(deadline: string): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < new Date().setHours(0, 0, 0, 0);
}

function DashSkeleton() {
  return (
    <div className="dash-main">
      <div className="skeleton-line" style={{ width: '50%', height: 28, marginBottom: 24 }} />
      <div className="dash-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dash-stat-card">
            <div className="skeleton-circle" style={{ width: 40, height: 40 }} />
            <div className="skeleton-line" style={{ width: '40%', height: 24, marginTop: 12 }} />
            <div className="skeleton-line" style={{ width: '60%', height: 14, marginTop: 6 }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-line" style={{ height: 56, marginBottom: 8, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────────── */

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('all');
  const [toast, setToast] = useState<string | null>(null);

  // Redirect
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const apps = user ? getApplications(user.id) : [];
  const postedJobs = user ? getPostedJobs(user.id) : [];
  const allApplications = getAllApplications();

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Filtered by period
  const filteredApps = period === 'all'
    ? apps
    : apps.filter((a) => daysAgo(a.appliedAt) <= (period === '7d' ? 7 : 30));

  const filteredPostedJobs = period === 'all'
    ? postedJobs
    : postedJobs.filter((j) => daysAgo(j.postedAt) <= (period === '7d' ? 7 : 30));

  const postedJobIds = new Set(postedJobs.map((j) => j.id));
  const applicationsOnMyJobs = allApplications.filter((a) => postedJobIds.has(a.jobId));

  const stats = user?.role === 'business'
    ? {
        total: filteredPostedJobs.length,
        accepted: applicationsOnMyJobs.filter((a) => a.status === 'accepted').length,
        completed: filteredPostedJobs.filter((j) => isExpired(j.deadline)).length,
        pending: applicationsOnMyJobs.filter((a) => a.status === 'pending').length,
      }
    : {
        total: filteredApps.length,
        accepted: filteredApps.filter((a) => a.status === 'accepted').length,
        completed: filteredApps.filter((a) => a.status === 'completed').length,
        pending: filteredApps.filter((a) => a.status === 'pending').length,
      };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    simulateDelay(450).then(() => {
      setIsRefreshing(false);
      setToast('Đã cập nhật dữ liệu ✓');
    });
  }, []);

  if (!user) return null;

  return (
    <section className="page-dashboard">
      <div className="container">
        <div className="dash-grid">
          {/* sidebar */}
          <aside className="dash-aside fade-up">
            <div className="dash-profile-card">
              <div className="dash-avatar" style={{
                background: user.role === 'student'
                  ? 'linear-gradient(135deg,#5B4FFF,#7C72FF)'
                  : 'linear-gradient(135deg,#00D4AA,#00A882)',
              }}>
                {user.avatar}
              </div>
              <h3>{user.name}</h3>
              <div className="dash-role-badge">
                {user.role === 'student' ? '👨‍🎓 Sinh viên' : '🏢 Doanh nghiệp'}
              </div>
              {user.university && <p className="dash-uni">{user.university}</p>}
              {user.major && <p className="dash-major">{user.major}</p>}
              {user.companyName && <p className="dash-uni">{user.companyName}</p>}
              {user.rating !== undefined && user.rating > 0 && (
                <div className="dash-rating">⭐ {user.rating}/5.0</div>
              )}
              <Link to="/profile" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                Chỉnh sửa hồ sơ
              </Link>
            </div>

            <div className="dash-wallet">
              <div className="dash-wallet-label">💰 Số dư ví</div>
              <div className="dash-wallet-amount">{formatMoney(user.balance || 0)}</div>
              <Link to="/wallet" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {user.role === 'student' ? 'Xem ví →' : 'Nạp tiền Escrow →'}
              </Link>
            </div>

            <nav className="dash-nav">
              <Link to="/dashboard" className="dash-nav-item active">📊 Tổng quan</Link>
              {user.role === 'student' ? (
                <>
                  <Link to="/jobs" className="dash-nav-item">🔍 Tìm việc</Link>
                  <Link to="/my-applications" className="dash-nav-item">📋 Đơn ứng tuyển</Link>
                  <Link to="/wallet" className="dash-nav-item">💰 Ví & Giao dịch</Link>
                  <Link to="/profile" className="dash-nav-item">👤 Hồ sơ số</Link>
                </>
              ) : (
                <>
                  <Link to="/post-job" className="dash-nav-item">📝 Đăng việc mới</Link>
                  <Link to="/manage-jobs" className="dash-nav-item">📂 Quản lý job</Link>
                  <Link to="/wallet" className="dash-nav-item">💰 Escrow & Thanh toán</Link>
                </>
              )}
              <button className="dash-nav-item" onClick={() => { logout(); navigate('/'); }}>
                🚪 Đăng xuất
              </button>
            </nav>
          </aside>

          {/* main content */}
          {isRefreshing ? (
            <DashSkeleton />
          ) : (
            <div className="dash-main">
              {/* greeting + toolbar */}
              <div className="dash-toolbar fade-up">
                <h1 className="dash-greeting">
                  {getGreeting()}, {user.name.split(' ').pop()}! 👋
                </h1>
                <div className="dash-toolbar-actions">
                  <div className="dash-period-tabs">
                    {PERIOD_OPTIONS.map((p) => (
                      <button
                        key={p.key}
                        className={`dash-period-btn${period === p.key ? ' active' : ''}`}
                        onClick={() => setPeriod(p.key)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={handleRefresh} title="Làm mới">
                    🔄
                  </button>
                </div>
              </div>

              {/* stat cards */}
              <div className="dash-stats fade-up">
                <div className="dash-stat-card">
                  <div className="ds-icon" style={{ background: 'rgba(91,79,255,.15)' }}>📋</div>
                  <div className="ds-num">{stats.total}</div>
                  <div className="ds-label">{user.role === 'business' ? 'Job đã đăng' : 'Đã ứng tuyển'}</div>
                </div>
                <div className="dash-stat-card">
                  <div className="ds-icon" style={{ background: 'rgba(0,212,170,.1)' }}>✅</div>
                  <div className="ds-num">{stats.accepted}</div>
                  <div className="ds-label">{user.role === 'business' ? 'Đã được nhận' : 'Đã được nhận'}</div>
                </div>
                <div className="dash-stat-card">
                  <div className="ds-icon" style={{ background: 'rgba(255,179,64,.1)' }}>⏳</div>
                  <div className="ds-num">{stats.pending}</div>
                  <div className="ds-label">Đang chờ duyệt</div>
                </div>
                <div className="dash-stat-card">
                  <div className="ds-icon" style={{ background: 'rgba(255,107,53,.1)' }}>🏆</div>
                  <div className="ds-num">{stats.completed}</div>
                  <div className="ds-label">{user.role === 'business' ? 'Đã hết hạn' : 'Hoàn thành'}</div>
                </div>
              </div>

              {/* recent applications */}
              <div className="dash-section fade-up">
                <div className="dash-section-header">
                  <h2>{user.role === 'student' ? 'Lịch sử ứng tuyển' : 'Job đã đăng'}</h2>
                  <Link to={user.role === 'student' ? '/my-applications' : '/manage-jobs'} className="btn btn-ghost btn-sm">Xem tất cả →</Link>
                </div>

                {(user.role === 'business' ? filteredPostedJobs.length === 0 : filteredApps.length === 0) ? (
                  <div className="dash-empty">
                    <p>
                      {period !== 'all'
                        ? 'Không có hoạt động nào trong khoảng thời gian này.'
                        : user.role === 'business'
                          ? 'Bạn chưa đăng job nào.'
                          : 'Bạn chưa ứng tuyển job nào.'}
                    </p>
                    {period !== 'all' ? (
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setPeriod('all')}>
                        Xem tất cả
                      </button>
                    ) : (
                      <Link to={user.role === 'business' ? '/post-job' : '/jobs'} className="btn btn-primary" style={{ marginTop: 12 }}>
                        {user.role === 'business' ? '📝 Đăng việc ngay' : '🔍 Tìm việc ngay'}
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="dash-apps-list">
                    {user.role === 'business'
                      ? filteredPostedJobs.map((job) => {
                          const appCount = applicationsOnMyJobs.filter((a) => a.jobId === job.id).length;
                          return (
                            <Link to="/manage-jobs" key={job.id} className="dash-app-row">
                              <div className="jc-logo" style={{ background: job.logoGradient, width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>
                                {job.logoText}
                              </div>
                              <div className="dash-app-info">
                                <div className="dash-app-title">{job.title}</div>
                                <div className="dash-app-company">{job.location} · Đăng: {job.postedAt}</div>
                              </div>
                              <span className="dash-status st-pending">{appCount} ứng viên</span>
                            </Link>
                          );
                        })
                      : filteredApps.map((app) => {
                          const job = jobsData.find((j) => j.id === app.jobId);
                          if (!job) return null;
                          const st = STATUS_MAP[app.status] || STATUS_MAP.pending;
                          return (
                            <Link to={`/jobs/${job.id}`} key={app.id} className="dash-app-row">
                              <div className="jc-logo" style={{ background: job.logoGradient, width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>
                                {job.logoText}
                              </div>
                              <div className="dash-app-info">
                                <div className="dash-app-title">{job.title}</div>
                                <div className="dash-app-company">{job.company} · {app.appliedAt}</div>
                              </div>
                              <span className={`dash-status ${st.cls}`}>{st.label}</span>
                            </Link>
                          );
                        })}
                  </div>
                )}
              </div>

              {/* recommended */}
              {user.role === 'student' && (
                <div className="dash-section fade-up">
                  <div className="dash-section-header">
                    <h2>🤖 Gợi ý cho bạn</h2>
                  </div>
                  <div className="dash-rec-grid">
                    {jobsData.slice(0, 3).map((job) => (
                      <Link to={`/jobs/${job.id}`} key={job.id} className="dash-rec-card">
                        <div className="jc-logo" style={{ background: job.logoGradient, width: 36, height: 36, fontSize: 13 }}>
                          {job.logoText}
                        </div>
                        <div>
                          <div className="dash-app-title">{job.title}</div>
                          <div className="dash-app-company">{job.company} · 💰 {job.pay}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="apps-toast apps-toast-success">
          <span>✅</span>
          {toast}
          <button className="apps-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </section>
  );
}
