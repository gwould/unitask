import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Application, EnrichedApplication, Job, TaskSubmission } from '../types';
import { STORAGE_KEYS } from '../constants';
import { serviceRegistry } from '../services';

const { applications: applicationService, jobs: jobService } = serviceRegistry;

/* ─── TYPES ──────────────────────────────────────── */

type TabKey = 'active' | 'submitted' | 'revision' | 'completed' | 'all';

interface TaskActivity {
  id: string;
  type: 'applied' | 'accepted' | 'submitted' | 'revision' | 'approved' | 'paid' | 'rejected';
  label: string;
  date: string;
  detail?: string;
}

/* ─── CONSTANTS ──────────────────────────────────── */

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'active',    label: 'Đang làm',     icon: '🔨' },
  { key: 'submitted', label: 'Đã nộp',       icon: '📤' },
  { key: 'revision',  label: 'Cần sửa',      icon: '🔁' },
  { key: 'completed', label: 'Hoàn thành',    icon: '✅' },
  { key: 'all',       label: 'Tất cả',       icon: '📋' },
];

const FLOW_STEPS = [
  { key: 'find',     icon: '🔍', label: 'Tìm việc',       sub: 'Duyệt & lọc job' },
  { key: 'apply',    icon: '📝', label: 'Ứng tuyển',      sub: 'Gửi cover letter' },
  { key: 'accepted', icon: '✅', label: 'Được nhận',       sub: 'Doanh nghiệp chấp nhận' },
  { key: 'working',  icon: '🔨', label: 'Làm việc',       sub: 'Hoàn thành deliverables' },
  { key: 'submit',   icon: '📤', label: 'Nộp bài',        sub: 'Gửi sản phẩm' },
  { key: 'review',   icon: '👀', label: 'Chờ duyệt',      sub: 'Doanh nghiệp review' },
  { key: 'paid',     icon: '💰', label: 'Nhận tiền',       sub: 'Escrow giải phóng' },
];

/* ─── HELPERS ────────────────────────────────────── */

function loadSubmissionMap(): Record<string, TaskSubmission> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATION_SUBMISSIONS) || '{}');
  } catch { return {}; }
}

function saveSubmissionMap(map: Record<string, TaskSubmission>) {
  localStorage.setItem(STORAGE_KEYS.APPLICATION_SUBMISSIONS, JSON.stringify(map));
}

function getTaskStatus(app: EnrichedApplication): string {
  if (app.status === 'completed') return 'completed';
  if (app.status === 'rejected') return 'rejected';
  if (app.status === 'pending') return 'pending';
  // accepted
  if (!app.submission) return 'working';
  if (app.submission.reviewStatus === 'submitted') return 'submitted';
  if (app.submission.reviewStatus === 'revision_requested') return 'revision';
  if (app.submission.reviewStatus === 'approved') return 'approved';
  return 'working';
}

function getFlowStepIndex(app: EnrichedApplication): number {
  const s = getTaskStatus(app);
  switch (s) {
    case 'pending': return 1;
    case 'working': return 3;
    case 'submitted': return 4;
    case 'revision': return 3; // back to working
    case 'approved': return 5;
    case 'completed': return 6;
    default: return 0;
  }
}

function buildTimeline(app: EnrichedApplication): TaskActivity[] {
  const events: TaskActivity[] = [];
  events.push({
    id: 'applied',
    type: 'applied',
    label: 'Đã ứng tuyển',
    date: app.appliedAt,
    detail: `Cover letter: "${app.coverLetter.slice(0, 80)}${app.coverLetter.length > 80 ? '...' : ''}"`,
  });

  if (app.status === 'rejected') {
    events.push({ id: 'rejected', type: 'rejected', label: 'Không được chọn', date: app.appliedAt });
    return events;
  }

  if (app.status === 'accepted' || app.status === 'completed') {
    events.push({
      id: 'accepted',
      type: 'accepted',
      label: 'Doanh nghiệp đã chấp nhận',
      date: app.appliedAt, // approximate
      detail: 'Bạn có thể bắt đầu làm việc và nộp sản phẩm',
    });
  }

  if (app.submission) {
    events.push({
      id: 'submitted',
      type: 'submitted',
      label: 'Đã nộp bài',
      date: app.submission.submittedAt,
      detail: app.submission.summary.slice(0, 100),
    });

    if (app.submission.reviewStatus === 'revision_requested') {
      events.push({
        id: 'revision',
        type: 'revision',
        label: 'Yêu cầu chỉnh sửa',
        date: app.submission.reviewedAt || app.submission.submittedAt,
        detail: app.submission.reviewNote || 'Doanh nghiệp yêu cầu cập nhật lại sản phẩm',
      });
    }

    if (app.submission.reviewStatus === 'approved') {
      events.push({
        id: 'approved',
        type: 'approved',
        label: 'Sản phẩm được duyệt',
        date: app.submission.reviewedAt || app.submission.submittedAt,
      });
    }
  }

  if (app.status === 'completed') {
    events.push({
      id: 'paid',
      type: 'paid',
      label: 'Đã nhận thanh toán qua Escrow',
      date: app.submission?.reviewedAt || app.appliedAt,
      detail: `Tiền đã được chuyển vào ví của bạn`,
    });
  }

  return events;
}

function daysUntil(dateStr: string): string {
  if (!dateStr) return '';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Đã hết hạn';
  const d = Math.floor(diff / 86_400_000);
  if (d > 30) return `${Math.floor(d / 30)} tháng`;
  if (d > 0) return `${d} ngày`;
  return `${Math.floor(diff / 3_600_000)} giờ`;
}

/* ─── TASK CARD ──────────────────────────────────── */

function TaskCard({
  app,
  onSubmit,
  expanded,
  onToggle,
}: {
  app: EnrichedApplication;
  onSubmit: (app: EnrichedApplication) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { job } = app;
  const status = getTaskStatus(app);
  const flowIdx = getFlowStepIndex(app);
  const timeline = buildTimeline(app);

  const statusConfig: Record<string, { label: string; cls: string; icon: string }> = {
    pending:   { label: 'Chờ duyệt đơn', cls: 'st-pending',   icon: '⏳' },
    working:   { label: 'Đang làm việc',  cls: 'st-accepted',  icon: '🔨' },
    submitted: { label: 'Đã nộp bài',     cls: 'st-info',      icon: '📤' },
    revision:  { label: 'Cần chỉnh sửa',  cls: 'st-warning',   icon: '🔁' },
    approved:  { label: 'Đã duyệt',       cls: 'st-completed', icon: '✅' },
    completed: { label: 'Hoàn thành',      cls: 'st-completed', icon: '🏆' },
    rejected:  { label: 'Không được chọn', cls: 'st-rejected',  icon: '❌' },
  };

  const sc = statusConfig[status] || statusConfig.pending;

  return (
    <div className={`stask-card${expanded ? ' stask-expanded' : ''}`}>
      {/* Header */}
      <div className="stask-header" onClick={onToggle}>
        <div className="stask-job-info">
          {job ? (
            <div className="jc-logo" style={{ background: job.logoGradient, width: 48, height: 48, fontSize: 17, flexShrink: 0 }}>
              {job.logoText}
            </div>
          ) : (
            <div className="jc-logo" style={{ background: 'linear-gradient(135deg,#8B90A5,#A4A9BE)', width: 48, height: 48, fontSize: 17, flexShrink: 0 }}>?</div>
          )}
          <div>
            <h3 className="stask-title">{job?.title || `Job #${app.jobId}`}</h3>
            <div className="stask-meta">
              {job?.company}{job?.verified && ' ✅'} · {job?.location} · 💰 {job?.pay}
            </div>
          </div>
        </div>
        <div className="stask-status-area">
          <span className={`dash-status ${sc.cls}`}>{sc.icon} {sc.label}</span>
          <span className="stask-toggle">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Mini progress bar (always visible) */}
      <div className="stask-flow-mini">
        {FLOW_STEPS.map((step, i) => (
          <div key={step.key} className={`stask-fm-step${i <= flowIdx ? ' done' : ''}${i === flowIdx ? ' current' : ''}`}>
            <div className="stask-fm-dot">{i <= flowIdx ? '✓' : ''}</div>
            {i < FLOW_STEPS.length - 1 && <div className={`stask-fm-line${i < flowIdx ? ' done' : ''}`} />}
          </div>
        ))}
        <div className="stask-fm-labels">
          <span>{FLOW_STEPS[0].label}</span>
          <span>{FLOW_STEPS[Math.min(flowIdx, FLOW_STEPS.length - 1)].label}</span>
          <span>{FLOW_STEPS[FLOW_STEPS.length - 1].label}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="stask-detail">
          {/* Full flow visualization */}
          <div className="stask-flow-full">
            <h4>📍 Tiến trình công việc</h4>
            <div className="stask-flow-steps">
              {FLOW_STEPS.map((step, i) => (
                <div key={step.key} className={`stask-fs${i <= flowIdx ? ' done' : ''}${i === flowIdx ? ' current' : ''}`}>
                  <div className="stask-fs-icon">{i <= flowIdx ? '✓' : step.icon}</div>
                  <div className="stask-fs-info">
                    <strong>{step.label}</strong>
                    <span>{step.sub}</span>
                  </div>
                  {i === flowIdx && <span className="stask-fs-badge">Hiện tại</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Job requirements & deliverables */}
          {job && (status === 'working' || status === 'revision') && (
            <div className="stask-requirements">
              <h4>📋 Yêu cầu công việc</h4>
              {job.requirements.length > 0 && (
                <div className="stask-req-section">
                  <strong>Yêu cầu:</strong>
                  <ul>
                    {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {job.deliverables.length > 0 && (
                <div className="stask-req-section">
                  <strong>Sản phẩm cần nộp:</strong>
                  <ul>
                    {job.deliverables.map((d, i) => (
                      <li key={i} className="stask-deliverable">
                        <span className="stask-del-check">☐</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {job.deadline && (
                <div className="stask-deadline-info">
                  ⏰ Hạn nộp: <strong>{job.deadline}</strong>
                  <span className="stask-deadline-left">Còn {daysUntil(job.deadline)}</span>
                </div>
              )}
            </div>
          )}

          {/* Revision notice */}
          {status === 'revision' && app.submission && (
            <div className="stask-revision-notice">
              <div className="stask-rev-header">
                <span>🔁</span>
                <strong>Doanh nghiệp yêu cầu chỉnh sửa</strong>
              </div>
              <p>{app.submission.reviewNote || 'Vui lòng cập nhật và nộp lại sản phẩm.'}</p>
              <div className="stask-rev-prev">
                <strong>Bài nộp trước:</strong>
                <p>{app.submission.summary}</p>
                {app.submission.deliverableUrl && (
                  <a href={app.submission.deliverableUrl} target="_blank" rel="noreferrer">🔗 {app.submission.deliverableUrl}</a>
                )}
              </div>
            </div>
          )}

          {/* Current submission info */}
          {app.submission && status === 'submitted' && (
            <div className="stask-submission-info">
              <h4>📦 Bài nộp của bạn</h4>
              <div className="stask-sub-content">
                <p>{app.submission.summary}</p>
                {app.submission.deliverableUrl && (
                  <a href={app.submission.deliverableUrl} target="_blank" rel="noreferrer" className="stask-sub-link">
                    🔗 {app.submission.deliverableUrl}
                  </a>
                )}
                {app.submission.note && <p className="stask-sub-note">📝 {app.submission.note}</p>}
              </div>
              <div className="stask-waiting-badge">
                <span className="stask-wait-pulse" />
                Doanh nghiệp đang xem xét bài nộp của bạn...
              </div>
            </div>
          )}

          {/* Completed + payment info */}
          {status === 'completed' && (
            <div className="stask-completed-info">
              <div className="stask-comp-icon">🎉</div>
              <h4>Công việc hoàn thành!</h4>
              <p>Doanh nghiệp đã duyệt sản phẩm và thanh toán qua Escrow.</p>
              <div className="stask-comp-amount">
                💰 {job?.pay || 'Đã thanh toán'}
              </div>
              <Link to="/wallet" className="btn btn-primary btn-sm">Xem ví tiền →</Link>
            </div>
          )}

          {/* Activity timeline */}
          <div className="stask-timeline">
            <h4>📜 Lịch sử hoạt động</h4>
            <div className="stask-tl-list">
              {timeline.map((ev) => (
                <div key={ev.id} className={`stask-tl-item stask-tl-${ev.type}`}>
                  <div className="stask-tl-dot" />
                  <div className="stask-tl-content">
                    <div className="stask-tl-head">
                      <strong>{ev.label}</strong>
                      <span className="stask-tl-date">{ev.date}</span>
                    </div>
                    {ev.detail && <p className="stask-tl-detail">{ev.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="stask-actions">
            {(status === 'working' || status === 'revision') && (
              <button className="btn btn-primary" onClick={() => onSubmit(app)}>
                📤 {status === 'revision' ? 'Nộp lại sản phẩm' : 'Nộp sản phẩm'}
              </button>
            )}
            {job && (
              <Link to={`/jobs/${job.id}`} className="btn btn-ghost btn-sm">
                Xem chi tiết job →
              </Link>
            )}
            {job?.companyUserId && (
              <Link to={`/messages`} className="btn btn-ghost btn-sm">
                💬 Nhắn tin doanh nghiệp
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SUBMIT MODAL ───────────────────────────────── */

function SubmitModal({
  target,
  onClose,
  onSubmit,
  loading,
}: {
  target: EnrichedApplication;
  onClose: () => void;
  onSubmit: (summary: string, url: string, note: string) => void;
  loading: boolean;
}) {
  const [summary, setSummary] = useState(target.submission?.summary || '');
  const [url, setUrl] = useState(target.submission?.deliverableUrl || '');
  const [note, setNote] = useState(target.submission?.note || '');

  const isRevision = target.submission?.reviewStatus === 'revision_requested';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box stask-submit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stask-sm-header">
          <h3>📤 {isRevision ? 'Nộp lại sản phẩm' : 'Nộp sản phẩm'}</h3>
          <button className="stask-sm-close" onClick={onClose}>✕</button>
        </div>

        <div className="stask-sm-job">
          <strong>{target.job?.title || `Job #${target.jobId}`}</strong>
          <span>{target.job?.company} · {target.job?.pay}</span>
        </div>

        {isRevision && target.submission?.reviewNote && (
          <div className="stask-sm-revision-note">
            <strong>🔁 Phản hồi từ doanh nghiệp:</strong>
            <p>{target.submission.reviewNote}</p>
          </div>
        )}

        {/* Deliverables checklist */}
        {target.job?.deliverables && target.job.deliverables.length > 0 && (
          <div className="stask-sm-checklist">
            <strong>Checklist sản phẩm:</strong>
            {target.job.deliverables.map((d, i) => (
              <label key={i} className="stask-sm-check-item">
                <input type="checkbox" />
                <span>{d}</span>
              </label>
            ))}
          </div>
        )}

        <div className="stask-sm-field">
          <label>Mô tả kết quả đã làm *</label>
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="VD: Em đã hoàn thành 10 bài viết theo outline, tối ưu SEO onpage và meta đầy đủ. Tất cả bài viết đã qua kiểm tra plagiarism."
          />
          <span className="stask-sm-count">{summary.length}/2000</span>
        </div>

        <div className="stask-sm-field">
          <label>Link sản phẩm * (Google Drive, GitHub, Figma...)</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
          />
        </div>

        <div className="stask-sm-field">
          <label>Ghi chú thêm cho doanh nghiệp</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Những lưu ý, giải thích thêm..."
          />
        </div>

        <div className="stask-sm-info">
          <span>🛡️</span>
          <span>Sau khi nộp, doanh nghiệp sẽ review và duyệt. Tiền Escrow sẽ được giải phóng vào ví bạn khi được duyệt.</span>
        </div>

        <div className="stask-sm-actions">
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button
            className="btn btn-primary"
            onClick={() => onSubmit(summary, url, note)}
            disabled={!summary.trim() || !url.trim() || loading}
          >
            {loading ? (
              <><span className="btn-spinner" /> Đang gửi...</>
            ) : (
              '📤 Gửi sản phẩm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────── */

export default function StudentTasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const tabParam = (searchParams.get('tab') as TabKey) || 'active';
  const [tab, setTab] = useState<TabKey>(TABS.some(t => t.key === tabParam) ? tabParam : 'active');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitTarget, setSubmitTarget] = useState<EnrichedApplication | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'student') navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      applicationService.getByUser(user.id),
      jobService.getAll(),
    ]).then(([apps, allJobs]) => {
      if (cancelled) return;
      const submissions = loadSubmissionMap();
      const merged = apps.map((app) => {
        const sub = submissions[String(app.id)];
        return sub ? { ...app, submission: sub } : app;
      });
      setApplications(merged);
      setJobs(allJobs);
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [user]);

  // Sync tab to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (tab !== 'active') params.set('tab', tab);
    setSearchParams(params, { replace: true });
  }, [tab, setSearchParams]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const jobsById = useMemo(() => new Map(jobs.map(j => [j.id, j])), [jobs]);

  const enriched: EnrichedApplication[] = useMemo(
    () => applications.map(app => ({ ...app, job: jobsById.get(app.jobId) })),
    [applications, jobsById]
  );

  // Only show accepted/completed (not pending or rejected — those are in MyApplications)
  const tasks = useMemo(() => {
    return enriched.filter(a => a.status === 'accepted' || a.status === 'completed');
  }, [enriched]);

  const filtered = useMemo(() => {
    if (tab === 'all') return tasks;
    return tasks.filter(app => {
      const s = getTaskStatus(app);
      switch (tab) {
        case 'active': return s === 'working';
        case 'submitted': return s === 'submitted';
        case 'revision': return s === 'revision';
        case 'completed': return s === 'completed' || s === 'approved';
        default: return true;
      }
    });
  }, [tasks, tab]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { active: 0, submitted: 0, revision: 0, completed: 0, all: tasks.length };
    tasks.forEach(app => {
      const s = getTaskStatus(app);
      if (s === 'working') c.active++;
      else if (s === 'submitted') c.submitted++;
      else if (s === 'revision') c.revision++;
      else if (s === 'completed' || s === 'approved') c.completed++;
    });
    return c;
  }, [tasks]);

  const handleSubmit = useCallback(async (summary: string, url: string, note: string) => {
    if (!submitTarget || !user) return;
    setSubmitLoading(true);

    const submission: TaskSubmission = {
      summary: summary.trim(),
      deliverableUrl: url.trim(),
      note: note.trim() || undefined,
      submittedAt: new Date().toISOString().slice(0, 10),
      reviewStatus: 'submitted',
    };

    setApplications(prev => prev.map(a =>
      a.id === submitTarget.id ? { ...a, submission } : a
    ));

    const map = loadSubmissionMap();
    map[String(submitTarget.id)] = submission;
    saveSubmissionMap(map);

    try {
      await applicationService.updateStatus(submitTarget.id, 'completed');
    } catch {
      // localStorage saved — backend syncs later
    }

    setSubmitLoading(false);
    setSubmitTarget(null);
    setToast({ msg: 'Đã nộp sản phẩm thành công! Doanh nghiệp sẽ review sớm.', type: 'success' });
  }, [submitTarget, user]);

  if (!user) return null;

  return (
    <section className="page-student-tasks">
      <div className="container">
        {/* Journey map */}
        <div className="stask-journey fade-up">
          <div className="stask-journey-header">
            <h1>📋 Quản lý công việc</h1>
            <p>Theo dõi tiến độ từ ứng tuyển → làm việc → nộp bài → nhận tiền</p>
          </div>
          <div className="stask-journey-flow">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.key} className="stask-jf-step">
                <div className="stask-jf-icon">{step.icon}</div>
                <div className="stask-jf-label">{step.label}</div>
                <div className="stask-jf-sub">{step.sub}</div>
                {i < FLOW_STEPS.length - 1 && <div className="stask-jf-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Stats overview */}
        <div className="stask-stats fade-up">
          <div className="stask-stat-card">
            <div className="stask-stat-num">{counts.active}</div>
            <div className="stask-stat-label">🔨 Đang làm</div>
          </div>
          <div className="stask-stat-card">
            <div className="stask-stat-num">{counts.submitted}</div>
            <div className="stask-stat-label">📤 Đã nộp</div>
          </div>
          <div className="stask-stat-card stask-stat-warn">
            <div className="stask-stat-num">{counts.revision}</div>
            <div className="stask-stat-label">🔁 Cần sửa</div>
          </div>
          <div className="stask-stat-card stask-stat-success">
            <div className="stask-stat-num">{counts.completed}</div>
            <div className="stask-stat-label">✅ Hoàn thành</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="stask-tabs fade-up">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`stask-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
              {counts[t.key] > 0 && <span className="stask-tab-count">{counts[t.key]}</span>}
            </button>
          ))}
        </div>

        {/* Urgent notice */}
        {counts.revision > 0 && tab !== 'revision' && (
          <div className="stask-urgent fade-up">
            <span>⚠️</span>
            <span>Bạn có <strong>{counts.revision}</strong> công việc cần chỉnh sửa.</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setTab('revision')}>
              Xem ngay →
            </button>
          </div>
        )}

        {/* Task list */}
        {isLoading ? (
          <div className="stask-list fade-up">
            {[1, 2, 3].map(i => (
              <div key={i} className="stask-card stask-skeleton">
                <div className="stask-header">
                  <div className="stask-job-info">
                    <div className="skeleton-circle" style={{ width: 48, height: 48 }} />
                    <div>
                      <div className="skeleton-line" style={{ width: 200, height: 18, marginBottom: 6 }} />
                      <div className="skeleton-line" style={{ width: 150, height: 12 }} />
                    </div>
                  </div>
                </div>
                <div className="skeleton-line" style={{ width: '100%', height: 8, borderRadius: 4, marginTop: 12 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="stask-empty fade-up">
            {tab === 'active' && tasks.length === 0 ? (
              <>
                <div className="stask-empty-icon">🚀</div>
                <h3>Chưa có công việc nào</h3>
                <p>Khi doanh nghiệp chấp nhận đơn ứng tuyển, công việc sẽ xuất hiện ở đây.</p>
                <div className="stask-empty-flow">
                  <div className="stask-ef-step">
                    <span>1️⃣</span>
                    <Link to="/jobs">Tìm và ứng tuyển job</Link>
                  </div>
                  <span className="stask-ef-arrow">→</span>
                  <div className="stask-ef-step">
                    <span>2️⃣</span>
                    <Link to="/my-applications">Theo dõi đơn ứng tuyển</Link>
                  </div>
                  <span className="stask-ef-arrow">→</span>
                  <div className="stask-ef-step">
                    <span>3️⃣</span>
                    <span>Nhận việc & làm ở đây</span>
                  </div>
                </div>
                <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 20 }}>
                  🔍 Tìm việc ngay
                </Link>
              </>
            ) : (
              <>
                <div className="stask-empty-icon">{TABS.find(t => t.key === tab)?.icon || '📋'}</div>
                <h3>Không có task "{TABS.find(t => t.key === tab)?.label}"</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setTab('all')}>
                  Xem tất cả
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="stask-list fade-up">
            {filtered.map(app => (
              <TaskCard
                key={app.id}
                app={app}
                onSubmit={setSubmitTarget}
                expanded={expandedId === String(app.id)}
                onToggle={() => setExpandedId(expandedId === String(app.id) ? null : String(app.id))}
              />
            ))}
          </div>
        )}

        {/* Connection to other pages */}
        <div className="stask-nav-links fade-up">
          <Link to="/my-applications" className="stask-nav-card">
            <span className="stask-nav-icon">📋</span>
            <div>
              <strong>Đơn ứng tuyển</strong>
              <span>Xem tất cả đơn đã nộp, đang chờ duyệt</span>
            </div>
            <span className="stask-nav-arrow">→</span>
          </Link>
          <Link to="/wallet" className="stask-nav-card">
            <span className="stask-nav-icon">💰</span>
            <div>
              <strong>Ví tiền</strong>
              <span>Xem thu nhập và rút tiền</span>
            </div>
            <span className="stask-nav-arrow">→</span>
          </Link>
          <Link to="/jobs" className="stask-nav-card">
            <span className="stask-nav-icon">🔍</span>
            <div>
              <strong>Tìm thêm việc</strong>
              <span>Khám phá job phù hợp với bạn</span>
            </div>
            <span className="stask-nav-arrow">→</span>
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/dashboard" className="btn btn-ghost">← Về Dashboard</Link>
        </div>
      </div>

      {/* Submit modal */}
      {submitTarget && (
        <SubmitModal
          target={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSubmit={handleSubmit}
          loading={submitLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`apps-toast apps-toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.msg}
          <button className="apps-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </section>
  );
}
