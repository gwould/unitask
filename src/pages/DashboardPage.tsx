import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_STATUS_MAP } from '../constants';
import { formatMoney } from '../utils/format';
import { simulateDelay, toIdString } from '../utils';
import type { Application, Job } from '../types';
import { serviceRegistry } from '../services';
import { hasAuthToken } from '../utils/auth';
import type { DashboardNotification } from '../services/dashboardService';
import type { StudentDashboardData, BusinessDashboardData } from '../services/dashboardService';

const { applications: applicationService, jobs: jobService, dashboard: dashboardService } = serviceRegistry;

type Period = '7d' | '30d' | 'all';

/* ─── CONSTANTS ───────────────────────────────────── */

const STATUS_MAP: Record<string, { label: string; cls: string }> = APP_STATUS_MAP;

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: '7d',  label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
  { key: 'all', label: 'Tất cả' },
];

/* ─── HELPERS ─────────────────────────────────────── */

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
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [studentDash, setStudentDash] = useState<StudentDashboardData | null>(null);
  const [businessDash, setBusinessDash] = useState<BusinessDashboardData | null>(null);
  const [dashNotifications, setDashNotifications] = useState<DashboardNotification[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;
    const uid = toIdString(user.id);

    if (hasAuthToken()) {
      if (user.role === 'student') {
        const dash = await dashboardService.getStudent(uid);
        if (dash) {
          setStudentDash(dash);
          setBusinessDash(null);
          setDashNotifications(dash.notifications);
          const [userApps, jobs] = await Promise.all([
            applicationService.getByUser(uid),
            jobService.getAll(),
          ]);
          setApps(userApps);
          setPostedJobs([]);
          setJobsData(jobs);
          setAllApplications(userApps);
          return;
        }
      }
      if (user.role === 'business') {
        const dash = await dashboardService.getBusiness(uid);
        if (dash) {
          setBusinessDash(dash);
          setStudentDash(null);
          setDashNotifications(dash.notifications);
          const companyJobs = await jobService.getByCompanyUser(uid);
          setPostedJobs(companyJobs);
          setApps([]);
          setJobsData(companyJobs);
          const allApps = await applicationService.getApplicantsForManager(uid);
          setAllApplications(allApps.map((a) => ({
            id: a.id,
            jobId: a.jobId,
            userId: a.userId,
            coverLetter: a.coverLetter,
            status: a.status,
            appliedAt: a.appliedAt,
          })));
          return;
        }
      }
    }

    setStudentDash(null);
    setBusinessDash(null);
    setDashNotifications([]);
    const [userApps, companyJobs, allApps, jobs] = await Promise.all([
      user.role === 'student' ? applicationService.getByUser(uid) : Promise.resolve([] as Application[]),
      user.role === 'business' ? jobService.getByCompanyUser(uid) : Promise.resolve([] as Job[]),
      applicationService.getAll(),
      jobService.getAll(),
    ]);
    setApps(userApps);
    setPostedJobs(companyJobs);
    setAllApplications(allApps);
    setJobsData(jobs);
  }, [user]);

  // Redirect
  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role === 'admin') navigate('/admin-finance');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    loadData()
      .catch(() => {
        // API failed — data fallback to localStorage is handled inside loadData
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [user, loadData]);

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

  const walletBalance = user?.role === 'business'
    ? (businessDash?.balance ?? user?.balance ?? 0)
    : (studentDash?.wallet.balance ?? user?.balance ?? 0);

  const stats = user?.role === 'business' && businessDash
    ? {
        total: businessDash.stats.openJobs,
        accepted: Math.max(0, businessDash.stats.totalApplications - businessDash.stats.pendingApplications),
        completed: businessDash.stats.completedProjects,
        pending: businessDash.stats.pendingApplications,
      }
    : user?.role === 'student' && studentDash
      ? {
          total: studentDash.stats.pendingApplications + studentDash.stats.activeApplications + studentDash.stats.completedJobs,
          accepted: studentDash.stats.activeApplications,
          completed: studentDash.stats.completedJobs,
          pending: studentDash.stats.pendingApplications,
        }
      : user?.role === 'business'
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
    if (!user) return;
    setIsRefreshing(true);
    simulateDelay(450)
      .then(() => loadData())
      .then(() => setToast('Đã cập nhật dữ liệu ✓'))
      .catch(() => setToast('Không thể cập nhật dữ liệu'))
      .finally(() => setIsRefreshing(false));
  }, [user, loadData]);

  if (!user) return null;

  return (
    <section className="page-dashboard">
      <div className="dashboard-bg-gradient" aria-hidden />
      <div className="container">
        <div className="dash-grid">
          {/* sidebar */}
          <aside className="dash-aside fade-up">
            <div className="dash-profile-card">
              <div className="dash-avatar" style={{
                background: user.role === 'student'
                  ? 'linear-gradient(135deg,#7C3AED,#A78BFA)'
                  : 'linear-gradient(135deg,#10B981,#059669)',
              }}>
                {user.avatar}
              </div>
              <h3>{user.name}</h3>
              <div className="dash-role-badge">
                {user.role === 'student' ? <><i className="bx bxs-graduation" /> Sinh viên</> : <><i className="bx bxs-building-house" /> Doanh nghiệp</>}
              </div>
              {user.university && <p className="dash-uni">{user.university}</p>}
              {user.major && <p className="dash-major">{user.major}</p>}
              {user.companyName && <p className="dash-uni">{user.companyName}</p>}
              {user.rating !== undefined && user.rating > 0 && (
                <div className="dash-rating"><i className="bx bxs-star" /> {user.rating}/5.0</div>
              )}
              <Link to="/profile" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                Chỉnh sửa hồ sơ
              </Link>
            </div>

            <div className="dash-wallet">
              <div className="dash-wallet-label"><i className="bx bx-wallet" /> Số dư ví</div>
              <div className="dash-wallet-amount">{formatMoney(walletBalance)}</div>
              <Link to="/wallet" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {user.role === 'student' ? 'Xem ví →' : 'Nạp tiền Escrow →'}
              </Link>
            </div>

            {studentDash && user.role === 'student' && (
              <div className="dash-wallet" style={{ marginTop: 12 }}>
                <div className="dash-wallet-label"><i className="bx bx-trending-up" /> Tổng thu nhập</div>
                <div className="dash-wallet-amount" style={{ fontSize: '1.1rem' }}>
                  {formatMoney(studentDash.stats.totalEarnings)}
                </div>
                <div className="dash-uni"><i className="bx bxs-star" /> {studentDash.stats.averageRating.toFixed(1)} đánh giá TB</div>
              </div>
            )}

            {businessDash && user.role === 'business' && (
              <div className="dash-wallet" style={{ marginTop: 12 }}>
                <div className="dash-wallet-label"><i className="bx bx-credit-card" /> Đã chi</div>
                <div className="dash-wallet-amount" style={{ fontSize: '1.1rem' }}>
                  {formatMoney(businessDash.stats.totalSpent)}
                </div>
              </div>
            )}

            <nav className="dash-nav">
              <Link to="/dashboard" className="dash-nav-item active"><i className="bx bxs-dashboard" /> Tổng quan</Link>
              {user.role === 'student' ? (
                <>
                  <Link to="/jobs" className="dash-nav-item"><i className="bx bx-search-alt" /> Tìm việc</Link>
                  <Link to="/my-applications" className="dash-nav-item"><i className="bx bx-list-check" /> Đơn ứng tuyển</Link>
                  <Link to="/my-tasks" className="dash-nav-item"><i className="bx bx-task" /> Công việc của tôi</Link>
                  <Link to="/wallet" className="dash-nav-item"><i className="bx bx-wallet" /> Ví & Giao dịch</Link>
                  <Link to="/messages" className="dash-nav-item"><i className="bx bx-message-rounded-dots" /> Tin nhắn</Link>
                  <Link to="/notifications" className="dash-nav-item"><i className="bx bx-bell" /> Thông báo</Link>
                  <Link to="/profile" className="dash-nav-item"><i className="bx bx-user" /> Hồ sơ số</Link>
                </>
              ) : (
                <>
                  <Link to="/post-job" className="dash-nav-item"><i className="bx bx-edit" /> Đăng việc mới</Link>
                  <Link to="/manage-jobs" className="dash-nav-item"><i className="bx bx-folder-open" /> Quản lý job</Link>
                  <Link to="/business-automation" className="dash-nav-item"><i className="bx bx-target-lock" /> Trung tâm tăng trưởng</Link>
                  <Link to="/wallet" className="dash-nav-item"><i className="bx bx-wallet" /> Escrow & Thanh toán</Link>
                  <Link to="/messages" className="dash-nav-item"><i className="bx bx-message-rounded-dots" /> Tin nhắn</Link>
                  <Link to="/notifications" className="dash-nav-item"><i className="bx bx-bell" /> Thông báo</Link>
                </>
              )}
              <button className="dash-nav-item" onClick={() => { logout(); navigate('/'); }}>
                <i className="bx bx-log-out" /> Đăng xuất
              </button>
            </nav>
          </aside>

          {/* main content */}
          {(isLoading || isRefreshing) ? (
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
                    <i className="bx bx-refresh" />
                  </button>
                </div>
              </div>

              {/* Student onboarding checklist */}
              {user.role === 'student' && stats.total === 0 && (
                <div className="dash-onboard fade-up">
                  <div className="dash-onboard-header">
                    <h2><i className="bx bx-rocket" /> Bắt đầu hành trình của bạn</h2>
                    <p>Hoàn thành 7 bước để kiếm tiền từ kỹ năng của bạn</p>
                  </div>
                  <div className="dash-onboard-steps">
                    <Link to="/profile" className={`dash-onboard-step${user.bio ? ' done' : ''}`}>
                      <span className="dash-ob-num">{user.bio ? '✓' : '1'}</span>
                      <div className="dash-ob-info">
                        <strong>Hoàn thiện hồ sơ</strong>
                        <span>Thêm kỹ năng, trường, bio để nổi bật với doanh nghiệp</span>
                      </div>
                      <span className="dash-ob-arrow">→</span>
                    </Link>
                    <Link to="/jobs" className="dash-onboard-step">
                      <span className="dash-ob-num">2</span>
                      <div className="dash-ob-info">
                        <strong>Tìm job phù hợp</strong>
                        <span>Duyệt job theo kỹ năng, AI gợi ý thông minh, lọc theo ngành</span>
                      </div>
                      <span className="dash-ob-arrow">→</span>
                    </Link>
                    <div className="dash-onboard-step disabled">
                      <span className="dash-ob-num">3</span>
                      <div className="dash-ob-info">
                        <strong>Ứng tuyển bằng cover letter</strong>
                        <span>Viết thư giới thiệu bản thân, giải thích vì sao bạn phù hợp</span>
                      </div>
                    </div>
                    <div className="dash-onboard-step disabled">
                      <span className="dash-ob-num">4</span>
                      <div className="dash-ob-info">
                        <strong>Chờ doanh nghiệp duyệt</strong>
                        <span>Doanh nghiệp xem hồ sơ → chấp nhận hoặc từ chối</span>
                      </div>
                    </div>
                    <div className="dash-onboard-step disabled">
                      <span className="dash-ob-num">5</span>
                      <div className="dash-ob-info">
                        <strong>Nhận task & bắt đầu làm</strong>
                        <span>Xem yêu cầu, deliverables, deadline → bắt tay vào việc</span>
                      </div>
                    </div>
                    <div className="dash-onboard-step disabled">
                      <span className="dash-ob-num">6</span>
                      <div className="dash-ob-info">
                        <strong>Nộp sản phẩm & chờ duyệt</strong>
                        <span>Upload link sản phẩm → doanh nghiệp review → duyệt hoặc yêu cầu sửa</span>
                      </div>
                    </div>
                    <div className="dash-onboard-step disabled">
                      <span className="dash-ob-num">7</span>
                      <div className="dash-ob-info">
                        <strong>Nhận tiền qua Escrow</strong>
                        <span>Tiền từ Escrow giải phóng vào ví → rút về ngân hàng/ví điện tử</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Business onboarding checklist */}
              {user.role === 'business' && stats.total === 0 && (
                <div className="dash-onboard fade-up">
                  <div className="dash-onboard-header">
                    <h2><i className="bx bxs-building-house" /> Bắt đầu tuyển dụng trên UniTask</h2>
                    <p>4 bước đơn giản để tìm sinh viên tài năng</p>
                  </div>
                  <div className="dash-onboard-steps">
                    <Link to="/profile" className={`dash-onboard-step${user.companyName ? ' done' : ''}`}>
                      <span className="dash-ob-num">{user.companyName ? '✓' : '1'}</span>
                      <div className="dash-ob-info">
                        <strong>Hoàn thiện hồ sơ doanh nghiệp</strong>
                        <span>Thêm tên công ty, mô tả, logo để tạo uy tín</span>
                      </div>
                      <span className="dash-ob-arrow">→</span>
                    </Link>
                    <Link to="/wallet" className="dash-onboard-step">
                      <span className="dash-ob-num">2</span>
                      <div className="dash-ob-info">
                        <strong>Nạp tiền vào ví Escrow</strong>
                        <span>Nạp tiền qua MoMo để ký quỹ cho sinh viên khi đăng task</span>
                      </div>
                      <span className="dash-ob-arrow">→</span>
                    </Link>
                    <Link to="/post-job" className="dash-onboard-step">
                      <span className="dash-ob-num">3</span>
                      <div className="dash-ob-info">
                        <strong>Đăng job đầu tiên</strong>
                        <span>Mô tả công việc, yêu cầu kỹ năng, budget & deadline</span>
                      </div>
                      <span className="dash-ob-arrow">→</span>
                    </Link>
                    <div className="dash-onboard-step disabled">
                      <span className="dash-ob-num">4</span>
                      <div className="dash-ob-info">
                        <strong>Duyệt ứng viên & quản lý task</strong>
                        <span>Xem hồ sơ sinh viên, chấp nhận, giao task & thanh toán qua Escrow</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* stat cards */}
              <div className="dash-stats fade-up">
                <div className="dash-stat-card">
                  <div className="ds-icon" style={{ background: 'rgba(91,79,255,.15)', color: '#7C3AED' }}><i className="bx bx-briefcase-alt-2" /></div>
                  <div className="ds-num">{stats.total}</div>
                  <div className="ds-label">{user.role === 'business' ? 'Job đã đăng' : 'Đã ứng tuyển'}</div>
                </div>
                <div className="dash-stat-card">
                  <div className="ds-icon" style={{ background: 'rgba(0,212,170,.1)', color: '#10B981' }}><i className="bx bx-check-circle" /></div>
                  <div className="ds-num">{stats.accepted}</div>
                  <div className="ds-label">{user.role === 'business' ? 'Đã được nhận' : 'Đã được nhận'}</div>
                </div>
                <div className="dash-stat-card">
                  <div className="ds-icon" style={{ background: 'rgba(255,179,64,.1)', color: '#F59E0B' }}><i className="bx bx-loader-circle" /></div>
                  <div className="ds-num">{stats.pending}</div>
                  <div className="ds-label">Đang chờ duyệt</div>
                </div>
                <div className="dash-stat-card">
                  <div className="ds-icon" style={{ background: 'rgba(255,107,53,.1)', color: '#F97316' }}><i className="bx bx-trophy" /></div>
                  <div className="ds-num">{stats.completed}</div>
                  <div className="ds-label">{user.role === 'business' ? 'Đã hết hạn' : 'Hoàn thành'}</div>
                </div>
              </div>

              {/* Student journey flow map: chỉ hiện khi đã có hoạt động, tránh trùng lặp với checklist onboarding ở trên */}
              {user.role === 'student' && stats.total > 0 && (
                <div className="dash-student-flow fade-up">
                  <div className="dash-sf-header">
                    <h3><i className="bx bx-map-alt" /> Hành trình của bạn</h3>
                  </div>
                  <div className="dash-sf-steps">
                    <Link to="/jobs" className={`dash-sf-step${stats.total === 0 ? ' current' : ' done'}`}>
                      <div className="dash-sf-num">{stats.total > 0 ? '✓' : '1'}</div>
                      <div className="dash-sf-info">
                        <strong>Tìm việc</strong>
                        <span>Duyệt & ứng tuyển job</span>
                      </div>
                    </Link>
                    <div className="dash-sf-connector" />
                    <Link to="/my-applications" className={`dash-sf-step${stats.total > 0 && stats.accepted === 0 ? ' current' : stats.accepted > 0 ? ' done' : ''}`}>
                      <div className="dash-sf-num">{stats.accepted > 0 ? '✓' : '2'}</div>
                      <div className="dash-sf-info">
                        <strong>Chờ duyệt</strong>
                        <span>{stats.pending > 0 ? `${stats.pending} đơn đang chờ` : 'Doanh nghiệp xét duyệt'}</span>
                      </div>
                    </Link>
                    <div className="dash-sf-connector" />
                    <Link to="/my-tasks" className={`dash-sf-step${stats.accepted > 0 && stats.completed === 0 ? ' current' : stats.completed > 0 ? ' done' : ''}`}>
                      <div className="dash-sf-num">{stats.completed > 0 ? '✓' : '3'}</div>
                      <div className="dash-sf-info">
                        <strong>Làm & nộp bài</strong>
                        <span>{stats.accepted > 0 ? `${stats.accepted} việc đang làm` : 'Nhận task & nộp sản phẩm'}</span>
                      </div>
                    </Link>
                    <div className="dash-sf-connector" />
                    <Link to="/wallet" className={`dash-sf-step${stats.completed > 0 ? ' done' : ''}`}>
                      <div className="dash-sf-num">{stats.completed > 0 ? '✓' : '4'}</div>
                      <div className="dash-sf-info">
                        <strong>Nhận tiền</strong>
                        <span>{stats.completed > 0 ? `${stats.completed} job đã hoàn thành` : 'Escrow trả tiền khi duyệt'}</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}

              {/* Business journey flow map: chỉ hiện khi đã có hoạt động, tránh trùng lặp với checklist onboarding ở trên */}
              {user.role === 'business' && stats.total > 0 && (
                <div className="dash-student-flow fade-up">
                  <div className="dash-sf-header">
                    <h3><i className="bx bx-bar-chart-alt-2" /> Quy trình tuyển dụng</h3>
                  </div>
                  <div className="dash-sf-steps">
                    <Link to="/post-job" className={`dash-sf-step${stats.total > 0 ? ' done' : ' current'}`}>
                      <div className="dash-sf-num">{stats.total > 0 ? '✓' : '1'}</div>
                      <div className="dash-sf-info">
                        <strong>Đăng job</strong>
                        <span>{stats.total > 0 ? `${stats.total} job đã đăng` : 'Tạo mô tả & yêu cầu'}</span>
                      </div>
                    </Link>
                    <div className="dash-sf-connector" />
                    <Link to="/manage-jobs" className={`dash-sf-step${stats.total > 0 && stats.accepted === 0 ? ' current' : stats.accepted > 0 ? ' done' : ''}`}>
                      <div className="dash-sf-num">{stats.accepted > 0 ? '✓' : '2'}</div>
                      <div className="dash-sf-info">
                        <strong>Duyệt ứng viên</strong>
                        <span>{stats.pending > 0 ? `${stats.pending} đang chờ duyệt` : 'Xem CV & chấp nhận'}</span>
                      </div>
                    </Link>
                    <div className="dash-sf-connector" />
                    <Link to="/manage-jobs" className={`dash-sf-step${stats.accepted > 0 && stats.completed === 0 ? ' current' : stats.completed > 0 ? ' done' : ''}`}>
                      <div className="dash-sf-num">{stats.completed > 0 ? '✓' : '3'}</div>
                      <div className="dash-sf-info">
                        <strong>Review & thanh toán</strong>
                        <span>{stats.completed > 0 ? `${stats.completed} đã hoàn thành` : 'Duyệt bài & escrow'}</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}

              {/* Quick actions for business */}
              {user.role === 'business' && (
                <div className="dash-quick-actions fade-up">
                  <Link to="/post-job" className="dash-qa-card dash-qa-highlight">
                    <span className="dash-qa-icon"><i className="bx bx-edit" /></span>
                    <span className="dash-qa-label">Đăng việc</span>
                  </Link>
                  <Link to="/manage-jobs" className="dash-qa-card">
                    <span className="dash-qa-icon"><i className="bx bx-folder-open" /></span>
                    <span className="dash-qa-label">Quản lý job</span>
                  </Link>
                  <Link to="/wallet" className="dash-qa-card">
                    <span className="dash-qa-icon"><i className="bx bx-wallet" /></span>
                    <span className="dash-qa-label">Escrow</span>
                  </Link>
                  <Link to="/messages" className="dash-qa-card">
                    <span className="dash-qa-icon"><i className="bx bx-message-rounded-dots" /></span>
                    <span className="dash-qa-label">Tin nhắn</span>
                  </Link>
                  <Link to="/business-automation" className="dash-qa-card">
                    <span className="dash-qa-icon"><i className="bx bx-target-lock" /></span>
                    <span className="dash-qa-label">Tăng trưởng</span>
                  </Link>
                </div>
              )}

              {/* Quick actions for students */}
              {user.role === 'student' && (
                <div className="dash-quick-actions fade-up">
                  <Link to="/jobs" className="dash-qa-card">
                    <span className="dash-qa-icon"><i className="bx bx-search-alt" /></span>
                    <span className="dash-qa-label">Tìm việc</span>
                  </Link>
                  <Link to="/my-applications" className="dash-qa-card">
                    <span className="dash-qa-icon"><i className="bx bx-list-check" /></span>
                    <span className="dash-qa-label">Đơn ứng tuyển</span>
                  </Link>
                  <Link to="/my-tasks" className="dash-qa-card dash-qa-highlight">
                    <span className="dash-qa-icon"><i className="bx bx-task" /></span>
                    <span className="dash-qa-label">Công việc</span>
                  </Link>
                  <Link to="/wallet" className="dash-qa-card">
                    <span className="dash-qa-icon"><i className="bx bx-wallet" /></span>
                    <span className="dash-qa-label">Ví tiền</span>
                  </Link>
                  <Link to="/messages" className="dash-qa-card">
                    <span className="dash-qa-icon"><i className="bx bx-message-rounded-dots" /></span>
                    <span className="dash-qa-label">Tin nhắn</span>
                  </Link>
                  <Link to="/profile" className="dash-qa-card">
                    <span className="dash-qa-icon"><i className="bx bx-user" /></span>
                    <span className="dash-qa-label">Hồ sơ</span>
                  </Link>
                </div>
              )}

              {/* recent applications */}
              <div className="dash-section fade-up">
                <div className="dash-section-header">
                  <h2>{user.role === 'student' ? 'Lịch sử ứng tuyển' : 'Job đã đăng'}</h2>
                  <Link to={user.role === 'student' ? '/my-applications' : '/manage-jobs'} className="btn btn-ghost btn-sm">Xem tất cả →</Link>
                </div>

                {(user.role === 'business'
                  ? (businessDash ? businessDash.openJobs.length === 0 && businessDash.recentApplications.length === 0 : filteredPostedJobs.length === 0)
                  : (studentDash ? studentDash.recentJobs.length === 0 : filteredApps.length === 0)) ? (
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
                        {user.role === 'business' ? <><i className="bx bx-edit" /> Đăng việc ngay</> : <><i className="bx bx-search-alt" /> Tìm việc ngay</>}
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="dash-apps-list">
                    {user.role === 'business' && businessDash
                      ? (
                        <>
                          {businessDash.recentApplications.map((app) => (
                            <Link to="/manage-jobs" key={app.id} className="dash-app-row">
                              <div className="jc-logo" style={{ background: 'linear-gradient(135deg,#10B981,#059669)', width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>
                                {app.studentName.charAt(0)}
                              </div>
                              <div className="dash-app-info">
                                <div className="dash-app-title">{app.studentName}</div>
                                <div className="dash-app-company">{app.jobTitle}</div>
                              </div>
                              <span className="dash-status st-pending">{app.status}</span>
                            </Link>
                          ))}
                          {businessDash.openJobs.map((job) => (
                            <Link to="/manage-jobs" key={job.id} className="dash-app-row">
                              <div className="dash-app-info">
                                <div className="dash-app-title">{job.title}</div>
                                <div className="dash-app-company">{job.spotsFilled ?? 0}/{job.spotsTotal ?? 0} slot · {job.status}</div>
                              </div>
                            </Link>
                          ))}
                        </>
                      )
                      : user.role === 'business'
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
                        : studentDash
                          ? studentDash.recentJobs.map((job) => (
                            <Link to={`/jobs/${job.id}`} key={job.id} className="dash-app-row">
                              <div className="dash-app-info">
                                <div className="dash-app-title">{job.title}</div>
                                <div className="dash-app-company">{job.companyName ?? ''} · {job.status}</div>
                              </div>
                            </Link>
                          ))
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

              {dashNotifications.length > 0 && (
                <div className="dash-section fade-up">
                  <div className="dash-section-header">
                    <h2><i className="bx bx-bell" /> Thông báo gần đây</h2>
                    <Link to="/notifications" className="btn btn-ghost btn-sm">Xem tất cả →</Link>
                  </div>
                  <div className="dash-apps-list">
                    {dashNotifications.slice(0, 5).map((n) => (
                      <Link to="/notifications" key={n.id} className="dash-app-row">
                        <div className="dash-app-info">
                          <div className="dash-app-title">{n.title ?? 'Thông báo'}</div>
                          <div className="dash-app-company">{n.message}</div>
                        </div>
                        {!n.isRead && <span className="dash-status st-pending">Mới</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* recommended */}
              {user.role === 'student' && (
                <div className="dash-section fade-up">
                  <div className="dash-section-header">
                    <h2><i className="bx bx-bot" /> Gợi ý cho bạn</h2>
                  </div>
                  <div className="dash-rec-grid">
                    {jobsData.slice(0, 3).map((job) => (
                      <Link to={`/jobs/${job.id}`} key={job.id} className="dash-rec-card">
                        <div className="jc-logo" style={{ background: job.logoGradient, width: 36, height: 36, fontSize: 13 }}>
                          {job.logoText}
                        </div>
                        <div className="dash-app-info">
                          <div className="dash-app-title">{job.title}</div>
                          <div className="dash-app-company">{job.company} · <i className="bx bx-money" /> {job.pay}</div>
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
