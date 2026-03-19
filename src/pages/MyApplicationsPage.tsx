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

function enrichApp(app: Application): EnrichedApplication {
  return { ...app, job: jobsData.find((j) => j.id === app.jobId) };
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

function ApplicationCard({ app, onWithdraw, onRate, expanding, onToggleExpand }: {
  app: EnrichedApplication;
  onWithdraw: (appId: string, jobTitle: string) => void;
  onRate: (appId: string, jobTitle: string) => void;
  expanding: boolean;
  onToggleExpand: () => void;
}) {
  const { job } = app;
  if (!job) return null;

  const st = STATUS_MAP[app.status];
  const currentTime = Date.now();
  const daysSinceApplied = Math.max(0, Math.floor(
    (currentTime - new Date(app.appliedAt).getTime()) / 86_400_000
  ));

  return (
    <div className={`apps-card${expanding ? ' apps-card-expanded' : ''}`}>
      <div className="apps-card-top">
        <Link to={`/jobs/${job.id}`} className="apps-card-job">
          <div
            className="jc-logo"
            style={{ background: job.logoGradient, width: 44, height: 44, fontSize: 15, flexShrink: 0 }}
          >
            {job.logoText}
          </div>
          <div>
            <div className="apps-card-title">{job.title}</div>
            <div className="apps-card-company">
              {job.company}
              {job.verified && <span className="apps-verified" title="Đã xác thực">✓</span>}
              {' · '}{job.location} · {job.pay}
            </div>
          </div>
        </Link>
        <span className={`dash-status ${st.cls}`}>{st.label}</span>
      </div>

      <div className="apps-card-meta">
        <span>📅 Ứng tuyển: {app.appliedAt}</span>
        <span>⏰ {job.deadline}</span>
        <span>🕐 {daysSinceApplied} ngày trước</span>
        <span>📂 {job.category}</span>
      </div>

      {/* Skills tags */}
      {job.skills.length > 0 && (
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
            <div className="apps-progress-step">Đang làm</div>
            <div className="apps-progress-line" />
            <div className="apps-progress-step">Hoàn thành</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="apps-card-actions">
        <Link to={`/jobs/${job.id}`} className="btn btn-ghost btn-sm">Xem chi tiết →</Link>

        {app.status === 'pending' && (
          <button
            className="btn btn-danger-ghost btn-sm"
            onClick={() => onWithdraw(app.id, job.title)}
          >
            ✕ Rút đơn
          </button>
        )}

        {app.status === 'accepted' && (
          <span className="apps-card-hint">
            💬 Hãy liên hệ doanh nghiệp để bắt đầu!
          </span>
        )}

        {app.status === 'completed' && (
          <button
            className="btn btn-accent btn-sm"
            onClick={() => onRate(app.id, job.title)}
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

        {/* Error state */}
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
