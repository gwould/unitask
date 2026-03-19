import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobsData } from '../data/mockData';
import type { Application, EnrichedApplication } from '../types';
import { APP_STATUS_MAP } from '../constants';
import { simulateDelay } from '../utils/async';
import { STORAGE_KEYS } from '../constants';
import { ConfirmModal, RatingModal } from '../components/ui';
import { SEEDED_APPLICATIONS } from '../services/applicationService';

/* ─── LOCAL TYPES ─────────────────────────────────── */

type FilterKey = Application['status'] | 'all';
type SortKey = 'newest' | 'oldest' | 'status';

interface WithdrawConfirm {
  appId: string;
  jobTitle: string;
}

/* ─── CONSTANTS ───────────────────────────────────── */

const STATUS_MAP = APP_STATUS_MAP;

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: 'all',       label: 'Tất cả',    icon: '📋' },
  { key: 'pending',   label: 'Đang chờ',  icon: '⏳' },
  { key: 'accepted',  label: 'Đã nhận',   icon: '✅' },
  { key: 'completed', label: 'Hoàn thành', icon: '🏆' },
  { key: 'rejected',  label: 'Từ chối',   icon: '❌' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'oldest', label: 'Cũ nhất' },
  { key: 'status', label: 'Trạng thái' },
];

const STORAGE_KEY = STORAGE_KEYS.APPLICATIONS;
const APPLICANTS_KEY = STORAGE_KEYS.MANAGE_APPLICANTS;

/* ─── DATA HELPERS ────────────────────────────────── */

function loadApplications(userId: string): Application[] {
  const stored: Application[] = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  })();
  const seededIds = new Set(stored.map((a) => a.id));
  const merged = [
    ...SEEDED_APPLICATIONS.filter((s) => !seededIds.has(s.id)),
    ...stored,
  ];
  return merged.filter((a) => a.userId === userId);
}

function saveApplications(apps: Application[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function loadApplicants() {
  try {
    return JSON.parse(localStorage.getItem(APPLICANTS_KEY) || '[]') as Array<Record<string, unknown>>;
  } catch {
    return [];
  }
}

function saveApplicants(apps: Array<Record<string, unknown>>) {
  localStorage.setItem(APPLICANTS_KEY, JSON.stringify(apps));
}

function enrichApp(app: Application): EnrichedApplication {
  const customJobs = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_JOBS) || '[]') as Array<{ id: number } & Record<string, unknown>>;
      return stored.map((j) => ({
        ...j,
        verified: false,
        tags: [],
        spotsLeft: 1,
        spotsTotal: 1,
        featured: false,
      }));
    } catch {
      return [] as Array<{ id: number } & Record<string, unknown>>;
    }
  })();

  const allJobs = [...jobsData, ...customJobs] as Array<{ id: number } & Record<string, unknown>>;
  const job = allJobs.find((j) => Number(j.id) === app.jobId);
  return { ...app, job: job as EnrichedApplication['job'] };
}

/* ─── SUB-COMPONENTS ──────────────────────────────── */

function ApplicationSkeleton() {
  return (
    <div className="apps-card apps-skeleton">
      <div className="apps-card-top">
        <div className="apps-card-job">
          <div className="skeleton-circle" style={{ width: 44, height: 44 }} />
          <div>
            <div className="skeleton-line" style={{ width: 220, height: 16, marginBottom: 6 }} />
            <div className="skeleton-line" style={{ width: 160, height: 12 }} />
          </div>
        </div>
        <div className="skeleton-line" style={{ width: 90, height: 24, borderRadius: 20 }} />
      </div>
      <div className="apps-card-meta">
        <div className="skeleton-line" style={{ width: 120, height: 12 }} />
        <div className="skeleton-line" style={{ width: 100, height: 12 }} />
      </div>
      <div className="skeleton-line" style={{ width: '100%', height: 40, marginTop: 8, borderRadius: 8 }} />
    </div>
  );
}

function ApplicationCard({ app, onWithdraw, onRate, onSubmitTask, expanding, onToggleExpand }: {
  app: EnrichedApplication;
  onWithdraw: (appId: string, jobTitle: string) => void;
  onRate: (appId: string, jobTitle: string) => void;
  onSubmitTask: (app: EnrichedApplication) => void;
  expanding: boolean;
  onToggleExpand: () => void;
}) {
  const { job } = app;
  const jobTitle = job?.title || `Job #${app.jobId}`;
  const jobMeta = job ? `${job.location} · ${job.pay}` : 'Đang cập nhật thông tin job';

  const st = STATUS_MAP[app.status];
  const [currentTime] = useState(() => Date.now());
  const daysSinceApplied = Math.max(0, Math.floor(
    (currentTime - new Date(app.appliedAt).getTime()) / 86_400_000
  ));

  return (
    <div className={`apps-card${expanding ? ' apps-card-expanded' : ''}`}>
      <div className="apps-card-top">
        {job ? (
          <Link to={`/jobs/${job.id}`} className="apps-card-job">
            <div
              className="jc-logo"
              style={{ background: job.logoGradient, width: 44, height: 44, fontSize: 15, flexShrink: 0 }}
            >
              {job.logoText}
            </div>
            <div>
              <div className="apps-card-title">{jobTitle}</div>
              <div className="apps-card-company">
                {job.company}
                {job.verified && <span className="apps-verified" title="Đã xác thực">✓</span>}
                {' · '}{jobMeta}
              </div>
            </div>
          </Link>
        ) : (
          <div className="apps-card-job">
            <div className="jc-logo" style={{ background: 'linear-gradient(135deg,#8B90A5,#A4A9BE)', width: 44, height: 44, fontSize: 15, flexShrink: 0 }}>
              ?
            </div>
            <div>
              <div className="apps-card-title">{jobTitle}</div>
              <div className="apps-card-company">{jobMeta}</div>
            </div>
          </div>
        )}
        <span className={`dash-status ${st.cls}`}>{st.label}</span>
      </div>

      <div className="apps-card-meta">
        <span>🧾 Mã đơn: {app.id}</span>
        <span>📅 Ứng tuyển: {app.appliedAt}</span>
        <span>⏰ {job?.deadline || 'Không rõ hạn'}</span>
        <span>🕐 {daysSinceApplied} ngày trước</span>
        <span>📂 {job?.category || 'Khác'}</span>
      </div>

      {/* Skills tags */}
      {job?.skills && job.skills.length > 0 && (
        <div className="apps-card-skills">
          {job.skills.map((s) => (
            <span key={s} className="apps-skill-tag">{s}</span>
          ))}
        </div>
      )}

      {/* Expandable cover letter */}
      {app.coverLetter && (
        <div className={`apps-card-letter${expanding ? ' expanded' : ''}`}>
          <div className="apps-letter-header" onClick={onToggleExpand}>
            <strong>Cover Letter</strong>
            <button className="apps-expand-btn" type="button">
              {expanding ? '▲ Thu gọn' : '▼ Xem thêm'}
            </button>
          </div>
          <div className="apps-letter-body">
            {app.coverLetter}
          </div>
        </div>
      )}

      {/* Progress indicator for accepted */}
      {app.status === 'accepted' && (
        <div className="apps-progress-bar">
          <div className="apps-progress-track">
            <div className="apps-progress-step done">✓ Ứng tuyển</div>
            <div className="apps-progress-line done" />
            <div className="apps-progress-step done">✓ Được nhận</div>
            <div className="apps-progress-line" />
            <div className="apps-progress-step">
              {app.submission?.reviewStatus === 'submitted' ? 'Đang chờ duyệt' : 'Đang làm'}
            </div>
            <div className="apps-progress-line" />
            <div className="apps-progress-step">Hoàn thành</div>
          </div>
        </div>
      )}

      {app.status === 'accepted' && app.submission && (
        <div className="apps-card-letter" style={{ marginTop: 10 }}>
          <div className="apps-letter-header">
            <strong>📦 Bài nộp mới nhất</strong>
          </div>
          <div className="apps-letter-body" style={{ whiteSpace: 'pre-wrap' }}>
            {app.submission.summary}
            {app.submission.deliverableUrl && (
              <div style={{ marginTop: 8 }}>
                🔗 <a href={app.submission.deliverableUrl} target="_blank" rel="noreferrer">{app.submission.deliverableUrl}</a>
              </div>
            )}
            {app.submission.reviewStatus === 'submitted' && (
              <div style={{ marginTop: 8, color: 'var(--pl)' }}>⏳ Doanh nghiệp đang kiểm tra bài nộp.</div>
            )}
            {app.submission.reviewStatus === 'revision_requested' && (
              <div style={{ marginTop: 8, color: 'var(--a)' }}>
                🔁 Cần chỉnh sửa: {app.submission.reviewNote || 'Vui lòng cập nhật lại bài nộp.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="apps-card-actions">
        {job ? (
          <Link to={`/jobs/${job.id}`} className="btn btn-ghost btn-sm">Xem chi tiết →</Link>
        ) : (
          <span className="apps-card-hint">Thông tin job đang được đồng bộ</span>
        )}

        {app.status === 'pending' && (
          <>
            <button
              className="btn btn-danger-ghost btn-sm"
              onClick={() => onWithdraw(app.id, jobTitle)}
            >
              ✕ Rút đơn
            </button>
            <span className="apps-card-hint">Nút nộp nhiệm vụ sẽ mở khi doanh nghiệp chuyển trạng thái sang Đã nhận.</span>
          </>
        )}

        {app.status === 'accepted' && (
          app.submission?.reviewStatus === 'submitted' ? (
            <span className="apps-card-hint">⏳ Đã nộp bài, đang chờ duyệt</span>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => onSubmitTask(app)}>
              📤 {app.submission?.reviewStatus === 'revision_requested' ? 'Nộp lại nhiệm vụ' : 'Nộp nhiệm vụ'}
            </button>
          )
        )}

        {app.status === 'completed' && (
          <button
            className="btn btn-accent btn-sm"
            onClick={() => onRate(app.id, jobTitle)}
          >
            ⭐ Đánh giá
          </button>
        )}

        {app.status === 'rejected' && (
          <Link to="/jobs" className="btn btn-ghost btn-sm">
            🔍 Tìm job khác
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────── */

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data
  const [applications, setApplications] = useState<Application[]>([]);

  // Filters & sort
  const filterParam = (searchParams.get('status') as FilterKey) || 'all';
  const [filter, setFilter] = useState<FilterKey>(
    FILTERS.some((f) => f.key === filterParam) ? filterParam : 'all'
  );
  const [sort, setSort] = useState<SortKey>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Expand tracking
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Modals
  const [withdrawConfirm, setWithdrawConfirm] = useState<WithdrawConfirm | null>(null);
  const [ratingTarget, setRatingTarget] = useState<{ appId: string; jobTitle: string } | null>(null);
  const [submitTarget, setSubmitTarget] = useState<EnrichedApplication | null>(null);
  const [submitSummary, setSubmitSummary] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitNote, setSubmitNote] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Redirect unauthenticated
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Load data with simulated delay
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    simulateDelay(800).then(() => {
      if (cancelled) return;
      try {
        const data = loadApplications(user.id);
        setApplications(data);
      } catch {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [user]);

  // Sync filter to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    setSearchParams(params, { replace: true });
  }, [filter, setSearchParams]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Enrich apps with job data
  const enrichedApps = useMemo(
    () => applications.map(enrichApp),
    [applications]
  );

  // Counts per status
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: enrichedApps.length, pending: 0, accepted: 0, completed: 0, rejected: 0 };
    enrichedApps.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [enrichedApps]);

  // Filter → search → sort
  const displayedApps = useMemo(() => {
    let list = filter === 'all'
      ? enrichedApps
      : enrichedApps.filter((a) => a.status === filter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        a.job?.title.toLowerCase().includes(q) ||
        a.job?.company.toLowerCase().includes(q) ||
        a.coverLetter.toLowerCase().includes(q)
      );
    }

    list = [...list];
    switch (sort) {
      case 'newest':
        list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        break;
      case 'oldest':
        list.sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime());
        break;
      case 'status':
        list.sort((a, b) => STATUS_MAP[a.status].order - STATUS_MAP[b.status].order);
        break;
    }
    return list;
  }, [enrichedApps, filter, searchQuery, sort]);

  // Handlers
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const handleWithdraw = useCallback(async () => {
    if (!withdrawConfirm || !user) return;
    setActionLoading(withdrawConfirm.appId);
    setWithdrawConfirm(null);

    await simulateDelay(700);

    setApplications((prev) => {
      const updated = prev.filter((a) => a.id !== withdrawConfirm.appId);
      saveApplications(updated);
      return updated;
    });
    setActionLoading(null);
    showToast(`Đã rút đơn ứng tuyển "${withdrawConfirm.jobTitle}"`);
  }, [withdrawConfirm, user, showToast]);

  const handleSubmitTask = useCallback(async () => {
    if (!submitTarget || !user) return;
    if (!submitSummary.trim()) {
      showToast('Vui lòng nhập mô tả kết quả đã làm.', 'error');
      return;
    }
    if (!submitUrl.trim()) {
      showToast('Vui lòng nhập link sản phẩm để doanh nghiệp kiểm tra.', 'error');
      return;
    }

    setActionLoading(submitTarget.id);
    await simulateDelay(500);

    const submission = {
      summary: submitSummary.trim(),
      deliverableUrl: submitUrl.trim(),
      note: submitNote.trim(),
      submittedAt: new Date().toISOString().slice(0, 10),
      reviewStatus: 'submitted' as const,
      reviewNote: '',
      reviewedAt: undefined,
    };

    setApplications((prev) => {
      const updated = prev.map((a) => a.id === submitTarget.id ? { ...a, submission } : a);
      saveApplications(updated);
      return updated;
    });

    const applicants = loadApplicants();
    const updatedApplicants = applicants.map((ap) => {
      const sameApp = ap.appId === submitTarget.id;
      const sameJobUser = ap.jobId === submitTarget.jobId && ap.userId === submitTarget.userId;
      if (sameApp || sameJobUser) {
        return { ...ap, appId: submitTarget.id, submission };
      }
      return ap;
    });
    saveApplicants(updatedApplicants);

    setActionLoading(null);
    setSubmitTarget(null);
    setSubmitSummary('');
    setSubmitUrl('');
    setSubmitNote('');
    showToast('Đã nộp nhiệm vụ thành công. Doanh nghiệp sẽ kiểm tra sớm.');
  }, [showToast, submitNote, submitSummary, submitTarget, submitUrl, user]);

  const handleRate = useCallback(async (rating: number, review: string) => {
    if (!ratingTarget) return;
    setActionLoading(ratingTarget.appId);
    setRatingTarget(null);

    await simulateDelay(500);

    // In a real app, this would POST to an API
    console.log('Rating submitted:', { appId: ratingTarget.appId, rating, review });
    setActionLoading(null);
    showToast(`Đã gửi đánh giá ${rating}/5 sao cho "${ratingTarget.jobTitle}" 🎉`);
  }, [ratingTarget, showToast]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleRetry = useCallback(() => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    simulateDelay(800).then(() => {
      try {
        setApplications(loadApplications(user.id));
      } catch {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    });
  }, [user]);

  if (!user) return null;

  return (
    <section className="page-apps">
      <div className="container">
        {/* Header */}
        <div className="apps-header fade-up">
          <div className="apps-header-top">
            <div>
              <h1>📋 Đơn ứng tuyển của tôi</h1>
              <p>Theo dõi tất cả đơn ứng tuyển và trạng thái xử lý</p>
            </div>
            <div className="apps-header-stats">
              <div className="apps-mini-stat">
                <span className="apps-mini-num">{counts.all}</span>
                <span className="apps-mini-label">Tổng đơn</span>
              </div>
              <div className="apps-mini-stat">
                <span className="apps-mini-num apps-num-green">{counts.accepted + counts.completed}</span>
                <span className="apps-mini-label">Thành công</span>
              </div>
              <div className="apps-mini-stat">
                <span className="apps-mini-num apps-num-orange">{counts.pending}</span>
                <span className="apps-mini-label">Đang chờ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Sort bar */}
        <div className="apps-toolbar fade-up">
          <div className="apps-search">
            <span className="apps-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo tên job, công ty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="apps-search-input"
            />
            {searchQuery && (
              <button
                className="apps-search-clear"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                ✕
              </button>
            )}
          </div>
          <select
            className="apps-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>Sắp xếp: {o.label}</option>
            ))}
          </select>
        </div>

        {/* Filter tabs */}
        <div className="apps-filters fade-up">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`apps-filter-btn${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.icon} {f.label}
              <span className="apps-filter-count">{counts[f.key] || 0}</span>
            </button>
          ))}
        </div>

        <div className="apps-results-info fade-up" style={{ marginTop: -18 }}>
          📌 Nộp nhiệm vụ chỉ xuất hiện ở tab <strong>Đã nhận</strong> (sau khi doanh nghiệp chấp nhận đơn).
          {filter !== 'accepted' && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: 10 }}
              onClick={() => setFilter('accepted')}
              type="button"
            >
              Chuyển sang Đã nhận
            </button>
          )}
        </div>
        {error && (
          <div className="apps-error fade-up">
            <div className="apps-error-icon">⚠️</div>
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={handleRetry}>
              🔄 Thử lại
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !error && (
          <div className="apps-list fade-up">
            {[1, 2, 3].map((i) => <ApplicationSkeleton key={i} />)}
          </div>
        )}

        {/* Loaded content */}
        {!isLoading && !error && (
          <>
            {/* Results info */}
            {searchQuery && (
              <div className="apps-results-info fade-up">
                Tìm thấy <strong>{displayedApps.length}</strong> kết quả
                {filter !== 'all' && <> trong <strong>{FILTERS.find((f) => f.key === filter)?.label}</strong></>}
                {' '}cho "<em>{searchQuery}</em>"
              </div>
            )}

            {/* Application list */}
            <div className="apps-list fade-up">
              {displayedApps.length === 0 ? (
                <div className="apps-empty">
                  {searchQuery ? (
                    <>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                      <p>Không tìm thấy đơn nào phù hợp với "{searchQuery}"</p>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 12 }}
                        onClick={() => { setSearchQuery(''); setFilter('all'); }}
                      >
                        Xóa bộ lọc
                      </button>
                    </>
                  ) : filter !== 'all' ? (
                    <>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>
                        {FILTERS.find((f) => f.key === filter)?.icon}
                      </div>
                      <p>Không có đơn ứng tuyển nào với trạng thái "{FILTERS.find((f) => f.key === filter)?.label}"</p>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 12 }}
                        onClick={() => setFilter('all')}
                      >
                        Xem tất cả
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                      <p>Bạn chưa ứng tuyển job nào.</p>
                      <p style={{ fontSize: 13, marginTop: 4, opacity: 0.7 }}>
                        Khám phá hàng trăm cơ hội phù hợp với kỹ năng của bạn!
                      </p>
                      <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 16 }}>
                        🔍 Tìm việc ngay
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                displayedApps.map((app) => (
                  <div key={app.id} className={actionLoading === app.id ? 'apps-card-loading' : ''}>
                    <ApplicationCard
                      app={app}
                      onWithdraw={(id, title) => setWithdrawConfirm({ appId: id, jobTitle: title })}
                      onRate={(id, title) => setRatingTarget({ appId: id, jobTitle: title })}
                      onSubmitTask={(target) => {
                        setSubmitTarget(target);
                        setSubmitSummary(target.submission?.summary || '');
                        setSubmitUrl(target.submission?.deliverableUrl || '');
                        setSubmitNote(target.submission?.note || '');
                      }}
                      expanding={expandedIds.has(app.id)}
                      onToggleExpand={() => toggleExpand(app.id)}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Summary stats at bottom */}
            {displayedApps.length > 0 && (
              <div className="apps-summary fade-up">
                Hiển thị {displayedApps.length} / {counts.all} đơn ứng tuyển
                {counts.pending > 0 && (
                  <span className="apps-summary-alert">
                    · {counts.pending} đơn đang chờ phản hồi
                  </span>
                )}
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/dashboard" className="btn btn-ghost">← Về Dashboard</Link>
        </div>
      </div>

      {/* Withdraw confirmation modal */}
      {withdrawConfirm && (
        <ConfirmModal
          title="Rút đơn ứng tuyển?"
          message={`Bạn có chắc muốn rút đơn ứng tuyển "${withdrawConfirm.jobTitle}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Rút đơn"
          danger
          onConfirm={handleWithdraw}
          onCancel={() => setWithdrawConfirm(null)}
        />
      )}

      {/* Rating modal */}
      {ratingTarget && (
        <RatingModal
          jobTitle={ratingTarget.jobTitle}
          onSubmit={handleRate}
          onCancel={() => setRatingTarget(null)}
        />
      )}

      {submitTarget && (
        <div className="modal-overlay" onClick={() => setSubmitTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>📤 Nộp nhiệm vụ</h3>
            <p style={{ marginBottom: 12 }}>
              Job: <strong>{submitTarget.job?.title || `#${submitTarget.jobId}`}</strong>
            </p>
            <div className="pj-field" style={{ marginBottom: 10 }}>
              <label>Mô tả kết quả *</label>
              <textarea
                rows={4}
                value={submitSummary}
                onChange={(e) => setSubmitSummary(e.target.value)}
                placeholder="VD: Em đã hoàn thành 10 bài viết theo outline, tối ưu SEO onpage và meta đầy đủ."
              />
            </div>
            <div className="pj-field" style={{ marginBottom: 10 }}>
              <label>Link sản phẩm *</label>
              <input
                type="url"
                value={submitUrl}
                onChange={(e) => setSubmitUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="pj-field">
              <label>Ghi chú thêm</label>
              <textarea
                rows={2}
                value={submitNote}
                onChange={(e) => setSubmitNote(e.target.value)}
                placeholder="Có thể để trống"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setSubmitTarget(null)}>Hủy</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmitTask}
                disabled={actionLoading === submitTarget.id}
              >
                {actionLoading === submitTarget.id ? 'Đang gửi...' : '📤 Gửi bài nộp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`apps-toast apps-toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
          <button className="apps-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </section>
  );
}
