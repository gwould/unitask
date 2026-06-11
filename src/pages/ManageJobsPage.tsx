import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Job, Transaction, User } from '../types';
import type { AppStatus, Applicant, AssignedTask, TaskSubmission } from '../types/application';
import { APPLICANT_STATUS_MAP, STORAGE_KEYS } from '../constants';
import { formatMoney } from '../utils/format';
import { BulkActions } from '../components/BulkActions';
import { AutomationSuggestions } from '../components/AutomationSuggestions';
import { createNotification } from '../services/automationEngine';
import { serviceRegistry } from '../services';
import { paymentService } from '../services/paymentService';
import { conversationService } from '../services/conversationService';
import { hasAuthToken } from '../utils/auth';

/* ─── TYPES ───────────────────────────────────────── */

type ApplicantStatus = AppStatus;

const { applications: applicationService, jobs: jobService } = serviceRegistry;


/* ─── CONSTANTS ───────────────────────────────────── */

const STATUS_MAP = APPLICANT_STATUS_MAP;

/* ─── HELPERS ─────────────────────────────────────── */

function loadSubmissionMap(): Record<string, TaskSubmission> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATION_SUBMISSIONS) || '{}') as Record<string, TaskSubmission>;
  } catch {
    return {};
  }
}

function saveSubmissionMap(map: Record<string, TaskSubmission>) {
  localStorage.setItem(STORAGE_KEYS.APPLICATION_SUBMISSIONS, JSON.stringify(map));
}

function loadUserTransactionsMap(): Record<string, Transaction[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_TRANSACTIONS) || '{}');
  } catch {
    return {};
  }
}

function saveUserTransactionsMap(map: Record<string, Transaction[]>) {
  localStorage.setItem(STORAGE_KEYS.USER_TRANSACTIONS, JSON.stringify(map));
}

function appendUserTransaction(userId: string, tx: Transaction) {
  const map = loadUserTransactionsMap();
  map[userId] = [tx, ...(map[userId] || [])];
  saveUserTransactionsMap(map);
}

function appendGlobalTransaction(tx: Transaction) {
  const current = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]') as Transaction[];
    } catch {
      return [] as Transaction[];
    }
  })();
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([tx, ...current]));
}

function updateAccountBalance(userId: string, delta: number) {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]') as Array<User & { password: string }>;
    const updated = raw.map((acc) => {
      if (acc.id !== userId) return acc;
      return { ...acc, balance: (acc.balance || 0) + delta };
    });
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
  } catch {
    // no-op in demo mode
  }
}

/* ─── SUB COMPONENTS ──────────────────────────────── */

/* ─── FLOW STEPS ─────────────────────────────────── */

const BIZ_FLOW_STEPS = [
  { key: 'post',    icon: '📝', label: 'Đăng job',      sub: 'Tạo mô tả & yêu cầu' },
  { key: 'review',  icon: '👀', label: 'Xem ứng viên',   sub: 'Xem CV & hồ sơ số' },
  { key: 'accept',  icon: '✅', label: 'Duyệt ứng viên', sub: 'Chấp nhận + gửi tin nhắn' },
  { key: 'assign',  icon: '📋', label: 'Giao task',      sub: 'Giao việc theo mốc' },
  { key: 'check',   icon: '🔍', label: 'Kiểm tra bài',   sub: 'Review sản phẩm' },
  { key: 'pay',     icon: '💰', label: 'Thanh toán',     sub: 'Escrow giải phóng' },
];

function getApplicantFlowStep(ap: Applicant): number {
  if (ap.status === 'pending') return 1;
  if (ap.status === 'rejected') return -1;
  if (ap.status === 'completed') return 5;
  // accepted
  if (!ap.submission) return 3;
  if (ap.submission.reviewStatus === 'submitted') return 4;
  if (ap.submission.reviewStatus === 'revision_requested') return 3;
  if (ap.submission.reviewStatus === 'approved') return 5;
  return 3;
}

/* ─── PROFILE MODAL ──────────────────────────────── */

function ProfileModal({ ap, onClose }: { ap: Applicant; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box biz-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="biz-pm-header">
          <h3>📄 Hồ sơ ứng viên</h3>
          <button className="stask-sm-close" onClick={onClose}>✕</button>
        </div>

        <div className="biz-pm-top">
          <div className="biz-pm-avatar">{ap.name.charAt(0)}</div>
          <div className="biz-pm-info">
            <h2>{ap.name}</h2>
            {ap.university && <div className="biz-pm-uni">🎓 {ap.university}</div>}
            {ap.rating != null && ap.rating > 0 && (
              <div className="biz-pm-rating">⭐ {ap.rating}/5.0</div>
            )}
          </div>
        </div>

        {ap.skills && ap.skills.length > 0 && (
          <div className="biz-pm-section">
            <h4>🎯 Kỹ năng</h4>
            <div className="biz-pm-skills">
              {ap.skills.map(s => <span key={s} className="pj-skill">{s}</span>)}
            </div>
          </div>
        )}

        {ap.coverLetter && (
          <div className="biz-pm-section">
            <h4>✍️ Cover Letter</h4>
            <div className="biz-pm-letter">{ap.coverLetter}</div>
          </div>
        )}

        <div className="biz-pm-section">
          <h4>📊 Thống kê</h4>
          <div className="biz-pm-stats">
            <div className="biz-pm-stat">
              <span className="biz-pm-stat-num">{ap.rating?.toFixed(1) || '—'}</span>
              <span className="biz-pm-stat-label">Đánh giá</span>
            </div>
            <div className="biz-pm-stat">
              <span className="biz-pm-stat-num">{ap.skills?.length || 0}</span>
              <span className="biz-pm-stat-label">Kỹ năng</span>
            </div>
            <div className="biz-pm-stat">
              <span className="biz-pm-stat-num">📅</span>
              <span className="biz-pm-stat-label">{ap.appliedAt}</span>
            </div>
          </div>
        </div>

        <div className="biz-pm-actions">
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

/* ─── TASK ASSIGN MODAL ──────────────────────────── */

function TaskAssignModal({ ap, job, existingTasks, onSave, onClose }: {
  ap: Applicant;
  job: Job | null;
  existingTasks: AssignedTask[];
  onSave: (tasks: AssignedTask[]) => void;
  onClose: () => void;
}) {
  const [tasks, setTasks] = useState<AssignedTask[]>(existingTasks);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: AssignedTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      deadline: newDeadline || 'Không giới hạn',
      status: 'pending',
      assignedAt: new Date().toISOString().slice(0, 10),
    };
    setTasks([...tasks, task]);
    setNewTitle('');
    setNewDesc('');
    setNewDeadline('');
  };

  const removeTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const toggleStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t;
      const next = t.status === 'pending' ? 'in_progress' : t.status === 'in_progress' ? 'done' : 'pending';
      return { ...t, status: next };
    }));
  };

  const addFromDeliverables = () => {
    if (!job?.deliverables) return;
    const existing = new Set(tasks.map(t => t.title));
    const newTasks = job.deliverables
      .filter(d => !existing.has(d))
      .map((d, i) => ({
        id: `task-del-${Date.now()}-${i}`,
        title: d,
        description: `Sản phẩm cần nộp: ${d}`,
        deadline: job.deadline || 'Theo deadline job',
        status: 'pending' as const,
        assignedAt: new Date().toISOString().slice(0, 10),
      }));
    if (newTasks.length > 0) setTasks([...tasks, ...newTasks]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box biz-task-modal" onClick={e => e.stopPropagation()}>
        <div className="biz-tm-header">
          <h3>📋 Giao task cho {ap.name}</h3>
          <button className="stask-sm-close" onClick={onClose}>✕</button>
        </div>

        {job && job.deliverables && job.deliverables.length > 0 && (
          <button className="btn btn-ghost btn-sm biz-tm-auto" onClick={addFromDeliverables} type="button">
            ⚡ Tạo task từ deliverables của job ({job.deliverables.length} mục)
          </button>
        )}

        {/* Existing tasks */}
        {tasks.length > 0 && (
          <div className="biz-tm-list">
            {tasks.map((t, i) => (
              <div key={t.id} className={`biz-tm-item biz-tm-${t.status}`}>
                <div className="biz-tm-num">{i + 1}</div>
                <div className="biz-tm-content">
                  <strong>{t.title}</strong>
                  {t.description && <p>{t.description}</p>}
                  <span className="biz-tm-deadline">📅 {t.deadline}</span>
                </div>
                <div className="biz-tm-item-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(t.id)} title="Đổi trạng thái">
                    {t.status === 'pending' ? '⏳' : t.status === 'in_progress' ? '🔄' : '✅'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeTask(t.id)} title="Xóa">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new task form */}
        <div className="biz-tm-form">
          <div className="biz-tm-form-title">➕ Thêm task mới</div>
          <input
            type="text"
            className="apps-search-input"
            placeholder="Tên task (VD: Thiết kế logo v1)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <textarea
            className="pj-textarea"
            placeholder="Mô tả chi tiết (tùy chọn)"
            rows={2}
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            style={{ resize: 'vertical', minHeight: 48 }}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="date"
              className="apps-search-input"
              value={newDeadline}
              onChange={e => setNewDeadline(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary btn-sm" onClick={addTask} disabled={!newTitle.trim()}>
              Thêm
            </button>
          </div>
        </div>

        <div className="biz-tm-footer">
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => { onSave(tasks); onClose(); }}>
            💾 Lưu danh sách task ({tasks.length})
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SUBMISSION VIEWER MODAL ────────────────────── */

function SubmissionViewerModal({ ap, job, onApprove, onRequestRevision, onClose }: {
  ap: Applicant;
  job: Job | null;
  onApprove: () => void;
  onRequestRevision: () => void;
  onClose: () => void;
}) {
  const sub = ap.submission;
  if (!sub) return null;

  const deliverables = job?.deliverables || [];
  const isImage = (url: string) => /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url);
  const isPdf = (url: string) => /\.pdf(\?|$)/i.test(url);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box biz-sv-modal" onClick={e => e.stopPropagation()}>
        <div className="biz-sv-header">
          <h3>📦 Bài nộp của {ap.name}</h3>
          <button className="stask-sm-close" onClick={onClose}>✕</button>
        </div>

        {/* Status bar */}
        <div className={`biz-sv-status biz-sv-${sub.reviewStatus}`}>
          {sub.reviewStatus === 'submitted' && '⏳ Đang chờ duyệt'}
          {sub.reviewStatus === 'revision_requested' && '🔁 Đã yêu cầu chỉnh sửa'}
          {sub.reviewStatus === 'approved' && '✅ Đã duyệt hoàn tất'}
          <span className="biz-sv-date">Nộp lúc: {sub.submittedAt}</span>
        </div>

        {/* Summary */}
        <div className="biz-sv-section">
          <h4>📝 Tóm tắt công việc</h4>
          <div className="biz-sv-text">{sub.summary}</div>
        </div>

        {/* Deliverable link with preview */}
        {sub.deliverableUrl && (
          <div className="biz-sv-section">
            <h4>🔗 Sản phẩm đã nộp</h4>
            <div className="biz-sv-deliverable">
              {isImage(sub.deliverableUrl) && (
                <div className="biz-sv-preview">
                  <img src={sub.deliverableUrl} alt="Preview" />
                </div>
              )}
              {isPdf(sub.deliverableUrl) && (
                <div className="biz-sv-preview biz-sv-pdf">
                  <iframe src={sub.deliverableUrl} title="PDF Preview" />
                </div>
              )}
              <a href={sub.deliverableUrl} target="_blank" rel="noreferrer" className="biz-sv-link">
                🔗 {sub.deliverableUrl}
              </a>
              <a href={sub.deliverableUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: 6 }}>
                📥 Mở / Tải về
              </a>
            </div>
          </div>
        )}

        {/* Note from student */}
        {sub.note && (
          <div className="biz-sv-section">
            <h4>💬 Ghi chú từ sinh viên</h4>
            <div className="biz-sv-text biz-sv-note">{sub.note}</div>
          </div>
        )}

        {/* Deliverable checklist */}
        {deliverables.length > 0 && (
          <div className="biz-sv-section">
            <h4>✅ Checklist sản phẩm (từ Job)</h4>
            <div className="biz-sv-checklist">
              {deliverables.map((d, i) => (
                <label key={i} className="biz-sv-check-item">
                  <input type="checkbox" defaultChecked={false} />
                  <span>{d}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Previous revision note */}
        {sub.reviewStatus === 'revision_requested' && sub.reviewNote && (
          <div className="biz-sv-section">
            <h4>🔁 Phản hồi trước đó</h4>
            <div className="biz-sv-text" style={{ borderLeft: '3px solid var(--a)', paddingLeft: 14 }}>
              {sub.reviewNote}
            </div>
          </div>
        )}

        {/* Assigned tasks status */}
        {ap.assignedTasks && ap.assignedTasks.length > 0 && (
          <div className="biz-sv-section">
            <h4>📋 Tiến độ task đã giao</h4>
            <div className="biz-sv-tasks">
              {ap.assignedTasks.map((t, i) => (
                <div key={t.id} className={`biz-sv-task-row biz-sv-t-${t.status}`}>
                  <span className="biz-sv-t-num">{i + 1}</span>
                  <span className="biz-sv-t-title">{t.title}</span>
                  <span className={`biz-sv-t-badge`}>
                    {t.status === 'done' ? '✅' : t.status === 'in_progress' ? '🔄' : '⏳'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {sub.reviewStatus === 'submitted' && (
          <div className="biz-sv-actions">
            <button className="btn btn-primary" onClick={onApprove}>
              ✅ Duyệt & Thanh toán
            </button>
            <button className="btn btn-ghost" onClick={onRequestRevision}>
              🔁 Yêu cầu chỉnh sửa
            </button>
          </div>
        )}

        <div className="biz-sv-footer">
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

/* ─── APPLICANT CARD ─────────────────────────────── */

function ApplicantCard({ ap, onAccept, onReject, onApprove, onRequestRevision, onMessage, onViewProfile, onAssignTask, onViewSubmission, isActioning, isSelected, onSelectChange }: {
  ap: Applicant;
  onAccept: (id: number | string) => void;
  onReject: (id: number | string) => void;
  onApprove: (id: number | string) => void;
  onRequestRevision: (id: number | string) => void;
  onMessage: (userId: string) => void;
  onViewProfile: (ap: Applicant) => void;
  onAssignTask: (ap: Applicant) => void;
  onViewSubmission: (ap: Applicant) => void;
  isActioning: boolean;
  isSelected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_MAP[ap.status];
  const flowStep = getApplicantFlowStep(ap);

  return (
    <div className={`manage-applicant-card${isActioning ? ' manage-ap-loading' : ''}${isSelected ? ' selected' : ''}`}>
      <div className="manage-ap-top">
        {onSelectChange && (
          <div style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={isSelected || false}
              onChange={(e) => onSelectChange(String(ap.id), e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        )}
        <div className="manage-ap-avatar" onClick={() => onViewProfile(ap)} title="Xem hồ sơ" style={{ cursor: 'pointer' }}>
          {ap.name.charAt(0)}
        </div>
        <div className="manage-ap-info">
          <div className="manage-ap-name">
            {ap.name}
            {ap.rating && <span className="manage-ap-rating">⭐ {ap.rating}</span>}
          </div>
          <div className="manage-ap-date">
            {ap.university && <>{ap.university} · </>}
            Ứng tuyển: {ap.appliedAt}
          </div>
        </div>
        <span className={`dash-status ${st.cls}`}>{st.label}</span>
      </div>

      {/* Mini flow for this applicant */}
      <div className="biz-ap-flow">
        {BIZ_FLOW_STEPS.map((step, i) => (
          <div key={step.key} className={`biz-af-dot${i <= flowStep ? ' done' : ''}${i === flowStep ? ' current' : ''}`} title={step.label}>
            {i <= flowStep ? '✓' : ''}
          </div>
        ))}
      </div>

      {/* Skills */}
      {ap.skills && ap.skills.length > 0 && (
        <div className="manage-ap-skills">
          {ap.skills.map((s) => (
            <span key={s} className="apps-skill-tag">{s}</span>
          ))}
        </div>
      )}

      {/* Expandable cover letter */}
      {ap.coverLetter && (
        <div className={`manage-ap-letter${expanded ? ' expanded' : ''}`}>
          <div className="apps-letter-header" onClick={() => setExpanded(!expanded)}>
            <strong>Cover Letter</strong>
            <button className="apps-expand-btn" type="button">
              {expanded ? '▲ Thu gọn' : '▼ Xem thêm'}
            </button>
          </div>
          <div className={`manage-ap-letter-body${expanded ? '' : ' collapsed'}`}>
            {ap.coverLetter}
          </div>
        </div>
      )}

      {/* Assigned tasks summary */}
      {ap.assignedTasks && ap.assignedTasks.length > 0 && (
        <div className="biz-ap-tasks">
          <div className="biz-ap-tasks-header">
            <strong>📋 Task đã giao ({ap.assignedTasks.length})</strong>
            <span className="biz-ap-tasks-progress">
              {ap.assignedTasks.filter(t => t.status === 'done').length}/{ap.assignedTasks.length} hoàn thành
            </span>
          </div>
          <div className="biz-ap-tasks-bar">
            <div
              className="biz-ap-tasks-fill"
              style={{ width: `${(ap.assignedTasks.filter(t => t.status === 'done').length / ap.assignedTasks.length) * 100}%` }}
            />
          </div>
          <div className="biz-ap-tasks-list">
            {ap.assignedTasks.slice(0, 3).map((t) => (
              <div key={t.id} className={`biz-ap-task-mini biz-tm-${t.status}`}>
                <span>{t.status === 'done' ? '✅' : t.status === 'in_progress' ? '🔄' : '⏳'}</span>
                <span>{t.title}</span>
              </div>
            ))}
            {ap.assignedTasks.length > 3 && (
              <div className="biz-ap-task-mini" style={{ opacity: 0.6 }}>
                +{ap.assignedTasks.length - 3} task khác
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submission review section */}
      {ap.submission && (
        <div className="biz-submission-card" onClick={() => onViewSubmission(ap)} style={{ cursor: 'pointer' }} title="Nhấn để xem chi tiết">
          <div className="biz-sub-header">
            <strong>📦 Bài nộp nhiệm vụ</strong>
            <span className={`dash-status ${
              ap.submission.reviewStatus === 'submitted' ? 'st-info' :
              ap.submission.reviewStatus === 'revision_requested' ? 'st-warning' : 'st-completed'
            }`}>
              {ap.submission.reviewStatus === 'submitted' ? '⏳ Chờ duyệt' :
               ap.submission.reviewStatus === 'revision_requested' ? '🔁 Đã yêu cầu sửa' : '✅ Đã duyệt'}
            </span>
          </div>
          <div className="biz-sub-body">
            <p>{ap.submission.summary}</p>
            {ap.submission.deliverableUrl && (
              <div className="biz-sub-link">
                🔗 {ap.submission.deliverableUrl}
              </div>
            )}
            <div className="biz-sub-meta">
              Nộp lúc: {ap.submission.submittedAt}
              <span className="biz-sub-view-more">👁️ Nhấn để xem chi tiết →</span>
            </div>
          </div>
        </div>
      )}

      <div className="manage-ap-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onViewProfile(ap)} title="Xem hồ sơ số">
          📄 CV
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onMessage(String(ap.userId))}>
          💬 Nhắn tin
        </button>
        {ap.status === 'pending' && (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => onAccept(ap.id)}>
              ✅ Chấp nhận
            </button>
            <button className="btn btn-danger-ghost btn-sm" onClick={() => onReject(ap.id)}>
              ❌ Từ chối
            </button>
          </>
        )}
        {ap.status === 'accepted' && (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onAssignTask(ap)}>
              📋 Giao task {ap.assignedTasks?.length ? `(${ap.assignedTasks.length})` : ''}
            </button>
            {ap.submission ? (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => onViewSubmission(ap)}>
                  👁️ Xem bài nộp
                </button>
                {ap.submission.reviewStatus === 'submitted' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => onApprove(ap.id)}>
                      ✅ Duyệt & Thanh toán
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onRequestRevision(ap.id)}>
                      🔁 Yêu cầu sửa
                    </button>
                  </>
                )}
                {ap.submission.reviewStatus === 'revision_requested' && (
                  <span className="manage-ap-hint">🔁 Chờ sinh viên nộp lại</span>
                )}
              </>
            ) : (
              <span className="manage-ap-hint">⏳ Chờ sinh viên nộp sản phẩm...</span>
            )}
          </>
        )}
        {ap.status === 'completed' && (
          <>
            {ap.submission && (
              <button className="btn btn-ghost btn-sm" onClick={() => onViewSubmission(ap)}>
                👁️ Xem bài nộp
              </button>
            )}
            <span className="manage-ap-hint" style={{ color: 'var(--t)' }}>✅ Đã hoàn thành & thanh toán</span>
          </>
        )}
        {ap.status === 'rejected' && (
          <span className="manage-ap-hint" style={{ opacity: 0.6 }}>Đã từ chối ứng viên này</span>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, isSelected, applicantCount, pendingCount, onClick }: {
  job: Job;
  isSelected: boolean;
  applicantCount: number;
  pendingCount: number;
  onClick: () => void;
}) {
  return (
    <div
      className={`manage-job-card${isSelected ? ' active' : ''}`}
      onClick={onClick}
    >
      <div className="manage-job-top">
        <div className="manage-job-title">{job.title}</div>
        {pendingCount > 0 && (
          <span className="manage-badge">{pendingCount} mới</span>
        )}
      </div>
      <div className="manage-job-meta">
        <span>📍 {job.location}</span>
        <span>💰 {job.pay}</span>
        <span>👥 {applicantCount} ứng viên</span>
      </div>
      <div className="manage-job-meta">
        <span>⏰ {job.deadline}</span>
        <span>📅 Đăng: {job.postedAt}</span>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────── */

export default function ManageJobsPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // States
  const [selectedJobId, setSelectedJobId] = useState<number | string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<number | string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | 'all'>('all');
  const [confirmAction, setConfirmAction] = useState<{ id: number | string; name: string; action: 'accept' | 'reject' | 'approve' | 'revision' } | null>(null);
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [profileModal, setProfileModal] = useState<Applicant | null>(null);
  const [taskAssignModal, setTaskAssignModal] = useState<Applicant | null>(null);
  const [submissionViewer, setSubmissionViewer] = useState<Applicant | null>(null);

  // Redirect
  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'business') navigate('/dashboard');
  }, [user, navigate]);

  // Load data
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      jobService.getByCompanyUser(String(user.id)),
      applicationService.getApplicantsForManager(String(user.id)),
    ])
      .then(([allJobs, allApplicants]) => {
        if (cancelled) return;
        setJobs(allJobs);
        const submissionMap = loadSubmissionMap();
        let tasksMap: Record<string, AssignedTask[]> = {};
        try {
          tasksMap = JSON.parse(localStorage.getItem('unitask_assigned_tasks') || '{}');
        } catch { /* ignore */ }
        const mappedApplicants: Applicant[] = allApplicants.map((app) => ({
          ...app,
          submission: submissionMap[String(app.id)],
          assignedTasks: tasksMap[String(app.id)] || undefined,
        }));
        setApplicants(mappedApplicants);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Computed
  const myJobs = useMemo(() => jobs, [jobs]);

  const selectedJob = selectedJobId !== null
    ? myJobs.find((j) => j.id === selectedJobId) || null
    : null;

  const jobApplicants = useMemo(() => {
    if (selectedJobId === null) return [];
    let list = applicants.filter((a) => a.jobId === selectedJobId);

    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.coverLetter.toLowerCase().includes(q) ||
        a.university?.toLowerCase().includes(q)
      );
    }

    // Sort: pending first, then by date newest
    list.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    });

    return list;
  }, [applicants, selectedJobId, statusFilter, searchQuery]);

  const buildAcceptMessage = useCallback((job: Job | null) => {
    if (!job) {
      return 'Chúc mừng! Bạn đã được chấp nhận. Vui lòng theo dõi hướng dẫn tiếp theo trong hệ thống.';
    }
    const deadline = job.deadline || 'Đang cập nhật';
    const duration = job.duration || 'Linh hoạt';
    return `Chúc mừng! Bạn được nhận job "${job.title}". Lương: ${job.pay} · Hạn: ${deadline} · Thời lượng: ${duration}. Vui lòng vào hệ thống để nộp bài đúng hạn.`;
  }, []);

  const buildRejectMessage = useCallback((job: Job | null) => {
    if (!job) {
      return 'Cảm ơn bạn đã ứng tuyển. Hồ sơ chưa phù hợp ở thời điểm này. Chúc bạn may mắn với cơ hội khác.';
    }
    return `Cảm ơn bạn đã ứng tuyển job "${job.title}". Hồ sơ chưa phù hợp ở thời điểm này. Chúc bạn may mắn với cơ hội khác.`;
  }, []);

  const buildJobActionUrl = useCallback((job: Job | null) => {
    if (!job) return '/my-applications';
    return `/jobs/${job.id}`;
  }, []);

  // Handlers
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const handleSelectApplicant = useCallback((id: string, selected: boolean) => {
    setSelectedApplicantIds(prev => {
      const updated = new Set(prev);
      if (selected) {
        updated.add(id);
      } else {
        updated.delete(id);
      }
      return updated;
    });
  }, []);

  const handleBulkAction = useCallback(async (action: 'accept' | 'reject' | 'notify', ids: string[], message?: string) => {
    setIsBulkLoading(true);
    try {
      const targetApplicants = applicants.filter(a => ids.includes(String(a.id)));
      const jobForNotify = selectedJob || null;
      
      if (action === 'accept' || action === 'reject') {
        const newStatus = action === 'accept' ? 'accepted' : 'rejected';
        await Promise.all(ids.map((id) => applicationService.updateStatus(id, newStatus as AppStatus)));
        setApplicants(prev => prev.map(a => ids.includes(String(a.id)) ? { ...a, status: newStatus as AppStatus } : a));

        // Create notifications
        for (const ap of targetApplicants) {
          createNotification({
            recipientId: String(ap.userId),
            recipientType: 'student',
            title: action === 'accept' ? '✅ Bạn đã được chấp nhận' : '❌ Hồ sơ không được chấp nhận',
            message: action === 'accept'
              ? buildAcceptMessage(jobForNotify)
              : buildRejectMessage(jobForNotify),
            type: 'application_status',
            relatedJobId: jobForNotify ? jobForNotify.id : undefined,
            relatedApplicationId: ap.appId ? String(ap.appId) : undefined,
            actionUrl: buildJobActionUrl(jobForNotify),
          });
        }

        showToast(`${action === 'accept' ? 'Chấp nhận' : 'Từ chối'} ${ids.length} ứng viên ✅`);
      } else if (action === 'notify' && message) {
        for (const ap of targetApplicants) {
          createNotification({
            recipientId: String(ap.userId),
            recipientType: 'student',
            title: '🔔 Thông báo từ công ty',
            message,
            type: 'system',
            actionUrl: '/my-applications',
          });
        }
        showToast(`Gửi thông báo đến ${ids.length} ứng viên ✅`);
      }

      setSelectedApplicantIds(new Set());
    } catch {
      showToast('Lỗi khi xử lý hàng loạt', 'error');
    } finally {
      setIsBulkLoading(false);
    }
  }, [applicants, buildAcceptMessage, buildJobActionUrl, buildRejectMessage, selectedJob, showToast]);

  const handleStatusChange = useCallback(async (id: number | string, newStatus: ApplicantStatus) => {
    setConfirmAction(null);
    setActioningId(id);

    const targetApplicant = applicants.find((a) => String(a.id) === String(id));
    if (!targetApplicant) {
      setActioningId(null);
      showToast('Không tìm thấy ứng viên để cập nhật.', 'error');
      return;
    }
    try {
      await applicationService.updateStatus(id, newStatus);
    } catch {
      setActioningId(null);
      showToast('Không thể cập nhật trạng thái. Vui lòng thử lại.', 'error');
      return;
    }

    setApplicants((prev) => prev.map((a) => String(a.id) === String(id) ? { ...a, status: newStatus } : a));

    const targetJob = selectedJob || myJobs.find((j) => j.id === targetApplicant.jobId) || null;

    createNotification({
      recipientId: String(targetApplicant.userId),
      recipientType: 'student',
      title: newStatus === 'accepted' ? '✅ Bạn đã được chấp nhận' : '❌ Hồ sơ không được chấp nhận',
      message: newStatus === 'accepted'
        ? buildAcceptMessage(targetJob)
        : buildRejectMessage(targetJob),
      type: 'application_status',
      relatedJobId: targetJob ? targetJob.id : undefined,
      relatedApplicationId: targetApplicant.appId ? String(targetApplicant.appId) : undefined,
      actionUrl: buildJobActionUrl(targetJob),
    });

    setActioningId(null);

    if (newStatus === 'accepted') {
      // Auto-send welcome message to chat
      try {
        const conv = await conversationService.start(String(targetApplicant.userId));
        await conversationService.sendMessage(conv.id, buildAcceptMessage(targetJob));
      } catch { /* messaging is best-effort */ }
      showToast(`Đã chấp nhận ${targetApplicant.name || 'ứng viên'} 🎉 Tin nhắn tự động đã gửi!`);
    } else {
      try {
        const conv = await conversationService.start(String(targetApplicant.userId));
        await conversationService.sendMessage(conv.id, buildRejectMessage(targetJob));
      } catch { /* messaging is best-effort */ }
      showToast(`Đã từ chối ${targetApplicant.name || 'ứng viên'}`);
    }
  }, [applicants, buildAcceptMessage, buildJobActionUrl, buildRejectMessage, myJobs, selectedJob, showToast]);

  const handleRequestRevision = useCallback(async (id: number | string) => {
    const note = window.prompt('Nhập góp ý để sinh viên sửa bài:', 'Vui lòng chỉnh lại format và bổ sung hạng mục còn thiếu.');
    if (note === null) return;

    setConfirmAction(null);
    setActioningId(id);

    const targetApplicant = applicants.find((a) => String(a.id) === String(id));
    if (!targetApplicant) {
      setActioningId(null);
      showToast('Không tìm thấy ứng viên.', 'error');
      return;
    }
    if (!targetApplicant.submission) {
      setActioningId(null);
      showToast('Ứng viên chưa nộp bài để yêu cầu chỉnh sửa.', 'error');
      return;
    }

    const nextSubmission: TaskSubmission = {
      ...targetApplicant.submission,
      reviewStatus: 'revision_requested',
      reviewNote: note.trim(),
      reviewedAt: new Date().toISOString().slice(0, 10),
    };

    setApplicants((prev) => prev.map((a) =>
      String(a.id) === String(id) ? { ...a, submission: nextSubmission } : a
    ));

    const submissions = loadSubmissionMap();
    submissions[String(targetApplicant.id)] = nextSubmission;
    saveSubmissionMap(submissions);

    setActioningId(null);
    showToast(`Đã gửi yêu cầu chỉnh sửa cho ${targetApplicant.name}.`);
  }, [applicants, showToast]);

  const handleApproveAndPay = useCallback(async (id: number | string) => {
    if (!selectedJob || !user) return;

    setConfirmAction(null);
    setActioningId(id);

    const targetApplicant = applicants.find((a) => String(a.id) === String(id));
    if (!targetApplicant) {
      setActioningId(null);
      showToast('Không tìm thấy ứng viên.', 'error');
      return;
    }

    try {
      await applicationService.updateStatus(id, 'completed');
    } catch {
      setActioningId(null);
      showToast('Không thể cập nhật trạng thái. Vui lòng thử lại.', 'error');
      return;
    }

    const updatedSubmission = targetApplicant.submission
      ? {
        ...targetApplicant.submission,
        reviewStatus: 'approved' as const,
        reviewNote: 'Đã duyệt hoàn tất.',
        reviewedAt: new Date().toISOString().slice(0, 10),
      }
      : undefined;

    setApplicants((prev) => prev.map((a) => {
      if (String(a.id) !== String(id)) return a;
      return {
        ...a,
        status: 'completed' as const,
        submission: updatedSubmission ?? a.submission,
      };
    }));

    if (updatedSubmission) {
      const submissions = loadSubmissionMap();
      submissions[String(targetApplicant.id)] = updatedSubmission;
      saveSubmissionMap(submissions);
    }

    const payout = selectedJob.payMax || selectedJob.payMin || 0;
    const applicationId = String(targetApplicant.appId ?? targetApplicant.id);

    if (hasAuthToken()) {
      try {
        const payment = await paymentService.create({
          jobApplicationId: applicationId,
          amount: payout,
          paymentMethod: 'escrow',
        });
        await paymentService.release(payment.id);
      } catch {
        setActioningId(null);
        showToast('Không thể xử lý thanh toán qua API. Vui lòng thử lại.', 'error');
        return;
      }
    }

    const date = new Date().toISOString().slice(0, 10);
    const businessTx: Transaction = {
      id: `tx-release-${Date.now()}`,
      userId: String(user.id),
      counterpartyId: String(targetApplicant.userId),
      type: 'escrow_release',
      label: `Giải phóng Escrow: ${selectedJob.title}`,
      amount: -payout,
      date,
      status: 'completed',
      jobTitle: selectedJob.title,
    };
    const studentTx: Transaction = {
      id: `tx-income-${Date.now()}`,
      userId: String(targetApplicant.userId),
      counterpartyId: String(user.id),
      type: 'income',
      label: `Thanh toán job: ${selectedJob.title}`,
      amount: payout,
      date,
      status: 'completed',
      jobTitle: selectedJob.title,
    };

    appendUserTransaction(String(user.id), businessTx);
    appendUserTransaction(String(targetApplicant.userId), studentTx);
    appendGlobalTransaction(businessTx);
    appendGlobalTransaction(studentTx);
    updateAccountBalance(String(user.id), -payout);
    updateAccountBalance(String(targetApplicant.userId), payout);
    updateProfile({ balance: (user.balance || 0) - payout });

    createNotification({
      recipientId: String(targetApplicant.userId),
      recipientType: 'student',
      title: '💰 Đã duyệt & thanh toán',
      message: `Job "${selectedJob.title}" đã được duyệt. Bạn nhận ${formatMoney(payout)} vào ví.`,
      type: 'payment',
      relatedJobId: selectedJob.id,
      relatedApplicationId: targetApplicant.appId ? String(targetApplicant.appId) : undefined,
      actionUrl: '/wallet',
    });

    setActioningId(null);
    showToast(`Đã duyệt bài và thanh toán ${formatMoney(payout)} cho ${targetApplicant.name} ✅`);
  }, [applicants, selectedJob, showToast, updateProfile, user]);

  const handleMessage = useCallback(async (userId: string) => {
    try {
      const conv = await conversationService.start(userId);
      navigate(`/messages/${conv.id}`);
    } catch {
      showToast('Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.', 'error');
    }
  }, [navigate, showToast]);

  const handleAccept = useCallback((id: number | string) => {
    const ap = applicants.find((a) => a.id === id);
    setConfirmAction({ id, name: ap?.name || 'ứng viên', action: 'accept' });
  }, [applicants]);

  const handleReject = useCallback((id: number | string) => {
    const ap = applicants.find((a) => a.id === id);
    setConfirmAction({ id, name: ap?.name || 'ứng viên', action: 'reject' });
  }, [applicants]);

  const handleApprove = useCallback((id: number | string) => {
    const ap = applicants.find((a) => a.id === id);
    setConfirmAction({ id, name: ap?.name || 'ứng viên', action: 'approve' });
  }, [applicants]);

  const handleRevision = useCallback((id: number | string) => {
    const ap = applicants.find((a) => a.id === id);
    setConfirmAction({ id, name: ap?.name || 'ứng viên', action: 'revision' });
  }, [applicants]);

  const handleViewProfile = useCallback((ap: Applicant) => {
    setProfileModal(ap);
  }, []);

  const handleAssignTask = useCallback((ap: Applicant) => {
    setTaskAssignModal(ap);
  }, []);

  const handleSaveTasks = useCallback((apId: number | string, tasks: AssignedTask[]) => {
    setApplicants(prev => prev.map(a =>
      String(a.id) === String(apId) ? { ...a, assignedTasks: tasks } : a
    ));
    // Persist to localStorage
    try {
      const key = `unitask_assigned_tasks`;
      const map = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, AssignedTask[]>;
      map[String(apId)] = tasks;
      localStorage.setItem(key, JSON.stringify(map));
    } catch { /* ignore */ }
    showToast(`Đã lưu ${tasks.length} task cho ứng viên ✅`);
  }, [showToast]);

  const handleViewSubmission = useCallback((ap: Applicant) => {
    setSubmissionViewer(ap);
  }, []);

  // Stats for flow
  const totalApplicants = applicants.length;
  const pendingCount = applicants.filter(a => a.status === 'pending').length;
  const acceptedCount = applicants.filter(a => a.status === 'accepted').length;
  const completedCount = applicants.filter(a => a.status === 'completed').length;
  const submittedCount = applicants.filter(a => a.submission?.reviewStatus === 'submitted').length;

  // Determine current biz flow step
  const bizFlowCurrent = completedCount > 0 ? 5
    : submittedCount > 0 ? 4
    : acceptedCount > 0 ? 3
    : pendingCount > 0 ? 1
    : myJobs.length > 0 ? 1
    : 0;

  if (!user || user.role !== 'business') return null;

  return (
    <section className="page-manage">
      <div className="container">
        {/* ─── BUSINESS FLOW VISUALIZATION ─── */}
        <div className="biz-flow-banner fade-up">
          <div className="biz-flow-title">📊 Quy trình tuyển dụng</div>
          <div className="biz-flow-steps">
            {BIZ_FLOW_STEPS.map((step, i) => (
              <div key={step.key} className={`biz-fs-item${i <= bizFlowCurrent ? ' done' : ''}${i === bizFlowCurrent ? ' current' : ''}`}>
                <div className="biz-fs-icon">{step.icon}</div>
                <div className="biz-fs-label">{step.label}</div>
                <div className="biz-fs-sub">{step.sub}</div>
                {i < BIZ_FLOW_STEPS.length - 1 && <div className="biz-fs-connector" />}
              </div>
            ))}
          </div>
          <div className="biz-flow-stats">
            <span>📋 {myJobs.length} job</span>
            <span>👥 {totalApplicants} ứng viên</span>
            <span>⏳ {pendingCount} chờ duyệt</span>
            <span>✅ {acceptedCount} đã nhận</span>
            <span>📦 {submittedCount} chờ review</span>
            <span>💰 {completedCount} hoàn thành</span>
          </div>
        </div>

        <div className="manage-header fade-up">
          <div>
            <h1>📂 Quản lý Job đã đăng</h1>
            <p>Xem danh sách job, quản lý ứng viên và theo dõi tiến trình</p>
          </div>
          <Link to="/post-job" className="btn btn-primary">+ Đăng việc mới</Link>
        </div>

        <div className="manage-grid">
          {/* Job list sidebar */}
          <div className="manage-jobs fade-up">
            <div className="manage-section-title">
              Job của bạn ({myJobs.length})
            </div>
            {isLoading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>Đang tải...</div>
            ) : myJobs.length === 0 ? (
              <div className="apps-empty">
                <p>Bạn chưa đăng job nào.</p>
                <Link to="/post-job" className="btn btn-primary" style={{ marginTop: 16 }}>📝 Đăng việc ngay</Link>
              </div>
            ) : (
              <div className="manage-job-list">
                {myJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJobId === job.id}
                    applicantCount={applicants.filter((a) => a.jobId === job.id).length}
                    pendingCount={applicants.filter((a) => a.jobId === job.id && a.status === 'pending').length}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Applicant panel */}
          <div className="manage-panel fade-up">
            {!selectedJob ? (
              <div className="manage-panel-empty">
                <div style={{ fontSize: 48 }}>👈</div>
                <p>Chọn một job để xem danh sách ứng viên</p>
              </div>
            ) : (
              <>
                <div className="manage-panel-header">
                  <h2>{selectedJob.title}</h2>
                  <span className="manage-app-count">
                    {applicants.filter((a) => a.jobId === selectedJobId).length} ứng viên
                  </span>
                </div>

                {/* Automation Suggestions */}
                <AutomationSuggestions applicants={jobApplicants} />

                {/* Bulk Actions */}
                <BulkActions
                  selectedIds={selectedApplicantIds}
                  applicants={jobApplicants}
                  onApplyAction={handleBulkAction}
                  isLoading={isBulkLoading}
                />

                {/* Panel toolbar */}
                <div className="manage-panel-toolbar">
                  <div className="apps-search" style={{ flex: 1 }}>
                    <span className="apps-search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Tìm ứng viên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="apps-search-input"
                    />
                    {searchQuery && (
                      <button className="apps-search-clear" onClick={() => setSearchQuery('')} type="button">✕</button>
                    )}
                  </div>
                  <select
                    className="apps-sort-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ApplicantStatus | 'all')}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                {/* Applicant stats */}
                <div className="manage-panel-stats">
                  {Object.entries(STATUS_MAP).map(([key, val]) => {
                    const count = applicants.filter((a) => a.jobId === selectedJobId && a.status === key).length;
                    return (
                      <button
                        key={key}
                        className={`manage-stat-chip ${val.cls}`}
                        onClick={() => setStatusFilter(statusFilter === key ? 'all' : key as ApplicantStatus)}
                      >
                        {val.label}: {count}
                      </button>
                    );
                  })}
                </div>

                {isLoading ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)' }}>Đang tải ứng viên...</div>
                ) : jobApplicants.length === 0 ? (
                  <div className="manage-panel-empty">
                    {searchQuery || statusFilter !== 'all' ? (
                      <>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                        <p>Không tìm thấy ứng viên phù hợp.</p>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ marginTop: 12 }}
                          onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                        >
                          Xóa bộ lọc
                        </button>
                      </>
                    ) : (
                      <p>Chưa có ai ứng tuyển vào job này.</p>
                    )}
                  </div>
                ) : (
                  <div className="manage-applicant-list">
                    {jobApplicants.map((ap) => (
                      <ApplicantCard
                        key={ap.id}
                        ap={ap}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onApprove={handleApprove}
                        onRequestRevision={handleRevision}
                        onMessage={handleMessage}
                        onViewProfile={handleViewProfile}
                        onAssignTask={handleAssignTask}
                        onViewSubmission={handleViewSubmission}
                        isActioning={actioningId !== null && String(actioningId) === String(ap.id)}
                        isSelected={selectedApplicantIds.has(String(ap.id))}
                        onSelectChange={handleSelectApplicant}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/dashboard" className="btn btn-ghost">← Về Dashboard</Link>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>
              {confirmAction.action === 'accept' && '✅ Chấp nhận ứng viên?'}
              {confirmAction.action === 'reject' && '❌ Từ chối ứng viên?'}
              {confirmAction.action === 'approve' && '💸 Duyệt bài & thanh toán?'}
              {confirmAction.action === 'revision' && '🔁 Yêu cầu chỉnh sửa?'}
            </h3>
            <p>
              {confirmAction.action === 'accept' && `Bạn muốn chấp nhận "${confirmAction.name}" vào job "${selectedJob?.title}"?`}
              {confirmAction.action === 'reject' && `Bạn muốn từ chối "${confirmAction.name}"? Hành động này có thể thay đổi sau.`}
              {confirmAction.action === 'approve' && `Bạn xác nhận duyệt bài của "${confirmAction.name}" và giải phóng tiền trong escrow?`}
              {confirmAction.action === 'revision' && `Bạn muốn gửi phản hồi yêu cầu "${confirmAction.name}" chỉnh sửa bài nộp?`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmAction(null)}>Hủy</button>
              <button
                className={`btn btn-sm ${confirmAction.action === 'reject' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => {
                  if (confirmAction.action === 'accept') {
                    handleStatusChange(confirmAction.id, 'accepted');
                    return;
                  }
                  if (confirmAction.action === 'reject') {
                    handleStatusChange(confirmAction.id, 'rejected');
                    return;
                  }
                  if (confirmAction.action === 'approve') {
                    handleApproveAndPay(confirmAction.id);
                    return;
                  }
                  handleRequestRevision(confirmAction.id);
                }}
              >
                {confirmAction.action === 'accept' && '✅ Chấp nhận'}
                {confirmAction.action === 'reject' && '❌ Từ chối'}
                {confirmAction.action === 'approve' && '💸 Duyệt & Thanh toán'}
                {confirmAction.action === 'revision' && '🔁 Gửi yêu cầu sửa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile modal */}
      {profileModal && <ProfileModal ap={profileModal} onClose={() => setProfileModal(null)} />}

      {/* Task assign modal */}
      {taskAssignModal && (
        <TaskAssignModal
          ap={taskAssignModal}
          job={selectedJob}
          existingTasks={taskAssignModal.assignedTasks || []}
          onSave={(tasks) => handleSaveTasks(taskAssignModal.id, tasks)}
          onClose={() => setTaskAssignModal(null)}
        />
      )}

      {/* Submission viewer modal */}
      {submissionViewer && submissionViewer.submission && (
        <SubmissionViewerModal
          ap={submissionViewer}
          job={selectedJob}
          onApprove={() => { setSubmissionViewer(null); handleApprove(submissionViewer.id); }}
          onRequestRevision={() => { setSubmissionViewer(null); handleRevision(submissionViewer.id); }}
          onClose={() => setSubmissionViewer(null)}
        />
      )}

      {/* Toast */}
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
