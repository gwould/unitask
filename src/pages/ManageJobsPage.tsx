import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Job } from '../types';
import type { AppStatus, Applicant } from '../types/application';
import { APPLICANT_STATUS_MAP } from '../constants';
import { BulkActions } from '../components/BulkActions';
import { AutomationSuggestions } from '../components/AutomationSuggestions';
import { createNotification } from '../services/automationEngine';
import { serviceRegistry } from '../services';
import { conversationService } from '../services/conversationService';
import { milestoneService, type CreateContractInput } from '../services/milestoneService';
import CreateContractModal from '../components/CreateContractModal';

/* ─── TYPES ───────────────────────────────────────── */

type ApplicantStatus = AppStatus;

const { applications: applicationService, jobs: jobService } = serviceRegistry;


/* ─── CONSTANTS ───────────────────────────────────── */

const STATUS_MAP = APPLICANT_STATUS_MAP;

/* ─── HELPERS ─────────────────────────────────────── */

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

/* ─── APPLICANT CARD ─────────────────────────────── */

function ApplicantCard({ ap, onAccept, onReject, onMessage, onViewProfile, onManageContract, isActioning, isSelected, onSelectChange }: {
  ap: Applicant;
  onAccept: (id: number | string) => void;
  onReject: (id: number | string) => void;
  onMessage: (userId: string) => void;
  onViewProfile: (ap: Applicant) => void;
  onManageContract: (ap: Applicant) => void;
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
          <button className="btn btn-primary btn-sm" onClick={() => onManageContract(ap)}>
            🤝 Quản lý task & Milestone
          </button>
        )}
        {ap.status === 'completed' && (
          <button className="btn btn-ghost btn-sm" onClick={() => onManageContract(ap)}>
            📊 Xem hợp đồng
          </button>
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
  const { user } = useAuth();
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
  // Tìm kiếm & lọc cho DANH SÁCH JOB (sidebar)
  const [jobSearch, setJobSearch] = useState('');
  const [jobCategory, setJobCategory] = useState<string>('all');
  const [confirmAction, setConfirmAction] = useState<{ id: number | string; name: string; action: 'accept' | 'reject' } | null>(null);
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [profileModal, setProfileModal] = useState<Applicant | null>(null);
  // Modal tạo hợp đồng (mở khi ứng viên chưa có HĐ) + cờ đang gọi API
  const [contractModal, setContractModal] = useState<Applicant | null>(null);
  const [contractBusy, setContractBusy] = useState(false);

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
        setApplicants(allApplicants);
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

  // Danh mục có trong các job (để dựng dropdown lọc)
  const jobCategories = useMemo(
    () => Array.from(new Set(myJobs.map((j) => j.category).filter(Boolean))) as string[],
    [myJobs],
  );

  // Job sau khi áp dụng tìm kiếm (tên/địa điểm) + lọc danh mục
  const filteredJobs = useMemo(() => {
    const q = jobSearch.trim().toLowerCase();
    return myJobs.filter((j) => {
      const matchSearch = q === '' || j.title.toLowerCase().includes(q) || (j.location ?? '').toLowerCase().includes(q);
      const matchCategory = jobCategory === 'all' || j.category === jobCategory;
      return matchSearch && matchCategory;
    });
  }, [myJobs, jobSearch, jobCategory]);

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

  const handleViewProfile = useCallback((ap: Applicant) => {
    setProfileModal(ap);
  }, []);

  // Nút "Quản lý task & Milestone": nếu ứng viên đã có HĐ -> mở trang /contracts/:id,
  // chưa có -> mở modal tạo HĐ. appId chính là JobApplicationId ở backend.
  const handleManageContract = useCallback(async (ap: Applicant) => {
    const appId = String(ap.appId ?? ap.id);
    showToast('Đang kiểm tra hợp đồng…');
    const existing = await milestoneService.getContractByApplication(appId);
    if (existing) {
      navigate(`/contracts/${existing.id}`);
    } else {
      setContractModal(ap);
    }
  }, [navigate, showToast]);

  // Submit modal tạo HĐ -> gọi API -> điều hướng sang trang quản lý milestone.
  const handleCreateContract = useCallback(async (input: CreateContractInput) => {
    setContractBusy(true);
    try {
      const contract = await milestoneService.createContract(input);
      setContractModal(null);
      showToast('Đã tạo hợp đồng ✅');
      navigate(`/contracts/${contract.id}`);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Không tạo được hợp đồng.', 'error');
    } finally {
      setContractBusy(false);
    }
  }, [navigate, showToast]);

  // Stats
  const totalApplicants = applicants.length;
  const pendingCount = applicants.filter(a => a.status === 'pending').length;
  const acceptedCount = applicants.filter(a => a.status === 'accepted').length;
  const completedCount = applicants.filter(a => a.status === 'completed').length;

  if (!user || user.role !== 'business') return null;

  return (
    <section className="page-manage">
      <div className="container">
        {/* Tổng quan nhanh — chi tiết tiến trình nằm trong trang hợp đồng (Kanban milestone) */}
        <div className="biz-flow-stats biz-flow-stats-standalone fade-up">
          <span>📋 {myJobs.length} job</span>
          <span>👥 {totalApplicants} ứng viên</span>
          <span>⏳ {pendingCount} chờ duyệt</span>
          <span>✅ {acceptedCount} đã nhận</span>
          <span>💰 {completedCount} hoàn thành</span>
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
              Job của bạn ({filteredJobs.length}/{myJobs.length})
            </div>

            {/* Tìm kiếm & lọc danh sách job */}
            {myJobs.length > 0 && (
              <div className="manage-job-filters">
                <div className="apps-search">
                  <input
                    type="text"
                    placeholder="Tìm theo tên / địa điểm..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="apps-search-input"
                  />
                  {jobSearch && (
                    <button className="apps-search-clear" onClick={() => setJobSearch('')} type="button">✕</button>
                  )}
                </div>
                {jobCategories.length > 0 && (
                  <select className="apps-sort-select" value={jobCategory} onChange={(e) => setJobCategory(e.target.value)}>
                    <option value="all">Tất cả danh mục</option>
                    {jobCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {isLoading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>Đang tải...</div>
            ) : myJobs.length === 0 ? (
              <div className="apps-empty">
                <p>Bạn chưa đăng job nào.</p>
                <Link to="/post-job" className="btn btn-primary" style={{ marginTop: 16 }}>📝 Đăng việc ngay</Link>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="apps-empty">
                <p>Không có job khớp bộ lọc.</p>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => { setJobSearch(''); setJobCategory('all'); }}>Xóa bộ lọc</button>
              </div>
            ) : (
              <div className="manage-job-list">
                {filteredJobs.map((job) => (
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
                        onMessage={handleMessage}
                        onViewProfile={handleViewProfile}
                        onManageContract={handleManageContract}
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
            </h3>
            <p>
              {confirmAction.action === 'accept' && `Bạn muốn chấp nhận "${confirmAction.name}" vào job "${selectedJob?.title}"? Sau đó bạn có thể giao task & milestone cho ứng viên.`}
              {confirmAction.action === 'reject' && `Bạn muốn từ chối "${confirmAction.name}"? Hành động này có thể thay đổi sau.`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmAction(null)}>Hủy</button>
              <button
                className={`btn btn-sm ${confirmAction.action === 'reject' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => {
                  if (confirmAction.action === 'accept') {
                    handleStatusChange(confirmAction.id, 'accepted');
                  } else {
                    handleStatusChange(confirmAction.id, 'rejected');
                  }
                }}
              >
                {confirmAction.action === 'accept' && '✅ Chấp nhận'}
                {confirmAction.action === 'reject' && '❌ Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile modal */}
      {profileModal && <ProfileModal ap={profileModal} onClose={() => setProfileModal(null)} />}

      {/* Create contract modal */}
      {contractModal && (
        <CreateContractModal
          studentName={contractModal.name}
          jobApplicationId={String(contractModal.appId ?? contractModal.id)}
          loading={contractBusy}
          onSubmit={handleCreateContract}
          onCancel={() => setContractModal(null)}
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
