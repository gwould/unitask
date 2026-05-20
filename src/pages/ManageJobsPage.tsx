import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Job, Transaction, User } from '../types';
import type { AppStatus, Applicant, TaskSubmission } from '../types/application';
import { APPLICANT_STATUS_MAP, STORAGE_KEYS } from '../constants';
import { formatMoney } from '../utils/format';
import { BulkActions } from '../components/BulkActions';
import { AutomationSuggestions } from '../components/AutomationSuggestions';
import { createNotification } from '../services/automationEngine';
import { applicationService } from '../services/applicationService';
import { jobService } from '../services/jobService';
import { buildUsersByDbId, userApiService } from '../services/userApiService';

/* ─── TYPES ───────────────────────────────────────── */

type ApplicantStatus = AppStatus;


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

function ApplicantCard({ ap, onAccept, onReject, onApprove, onRequestRevision, isActioning, isSelected, onSelectChange }: {
  ap: Applicant;
  onAccept: (id: number | string) => void;
  onReject: (id: number | string) => void;
  onApprove: (id: number | string) => void;
  onRequestRevision: (id: number | string) => void;
  isActioning: boolean;
  isSelected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_MAP[ap.status];

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
        <div className="manage-ap-avatar">
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

      {ap.submission && (
        <div className="apps-card-letter" style={{ marginTop: 10 }}>
          <div className="apps-letter-header">
            <strong>📦 Bài nộp nhiệm vụ</strong>
          </div>
          <div className="apps-letter-body" style={{ whiteSpace: 'pre-wrap' }}>
            {ap.submission.summary}
            {ap.submission.deliverableUrl && (
              <div style={{ marginTop: 8 }}>
                🔗 <a href={ap.submission.deliverableUrl} target="_blank" rel="noreferrer">{ap.submission.deliverableUrl}</a>
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              Nộp lúc: {ap.submission.submittedAt}
            </div>
            {ap.submission.reviewStatus === 'revision_requested' && (
              <div style={{ marginTop: 6, color: 'var(--a)' }}>
                Đã yêu cầu sửa: {ap.submission.reviewNote || 'Cần cập nhật thêm trước khi duyệt.'}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="manage-ap-actions">
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
          ap.submission?.reviewStatus === 'submitted' ? (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => onApprove(ap.id)}>
                ✅ Duyệt & Thanh toán
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => onRequestRevision(ap.id)}>
                🔁 Yêu cầu chỉnh sửa
              </button>
            </>
          ) : (
            <span className="manage-ap-hint">
              {ap.submission?.reviewStatus === 'revision_requested'
                ? '🔁 Đã yêu cầu chỉnh sửa, chờ sinh viên nộp lại.'
                : '💬 Ứng viên đã được chấp nhận, đang chờ nộp bài.'}
            </span>
          )
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
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
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
      jobService.getAll(),
      applicationService.getAll(),
      userApiService.getAllRaw(),
    ])
      .then(([allJobs, allApps, rawUsers]) => {
        if (cancelled) return;
        setJobs(allJobs);
        const submissionMap = loadSubmissionMap();
        const usersByDbId = buildUsersByDbId(rawUsers);
        const mappedApplicants: Applicant[] = allApps.map((app) => {
          const dbId = typeof app.userId === 'number' ? app.userId : Number(app.userId);
          const apUser = Number.isFinite(dbId) ? usersByDbId.get(dbId) : undefined;
          return {
            id: app.id,
            appId: app.id,
            jobId: app.jobId,
            userId: app.userId,
            coverLetter: app.coverLetter,
            status: app.status,
            appliedAt: app.appliedAt,
            name: apUser?.name || 'Ứng viên',
            university: apUser?.university,
            skills: apUser?.skills,
            rating: apUser?.rating,
            submission: submissionMap[String(app.id)],
          };
        });
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
  const myJobs = useMemo(() => {
    if (!user) return [];
    return jobs.filter((j) => String(j.companyId) === String(user.id));
  }, [jobs, user]);

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
      showToast(`Đã chấp nhận ${targetApplicant.name || 'ứng viên'} 🎉`);
    } else {
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

  if (!user || user.role !== 'business') return null;

  return (
    <section className="page-manage">
      <div className="container">
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
