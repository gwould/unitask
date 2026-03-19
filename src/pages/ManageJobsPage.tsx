import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobsData } from '../data/mockData';
import type { Job } from '../types';
import type { AppStatus, Applicant } from '../types/application';
import { APPLICANT_STATUS_MAP, STORAGE_KEYS } from '../constants';
import { formatMoney } from '../utils/format';
import { simulateDelay } from '../utils/async';

/* ─── TYPES ───────────────────────────────────────── */

type ApplicantStatus = AppStatus;

interface StoredJob {
  id: number;
  title: string;
  category: string;
  payMin: number;
  payMax: number;
  deadline: string;
  company: string;
  location: string;
  postedAt: string;
}

/* ─── CONSTANTS ───────────────────────────────────── */

const STATUS_MAP = APPLICANT_STATUS_MAP;

/* ─── SEED DATA ───────────────────────────────────── */

function getDefaultApplicants(): Applicant[] {
  return [
    { id: 'ap-1', jobId: 1, userId: 'stu-1', coverLetter: 'Em rất hứng thú với vị trí Frontend Developer. Em đã có 1 năm kinh nghiệm React + TypeScript qua các dự án cá nhân. Em tin rằng mình có thể đóng góp hiệu quả.', status: 'accepted', appliedAt: '2026-03-01', name: 'Nguyễn Minh Anh', university: 'ĐH Bách Khoa HCM', skills: ['React', 'TypeScript', 'Tailwind'], rating: 4.9 },
    { id: 'ap-2', jobId: 1, userId: 'stu-2', coverLetter: 'Em có 1 năm kinh nghiệm React và đang muốn tham gia dự án thực tế. Em thành thạo HTML/CSS/JS và đã làm 3 project cá nhân.', status: 'pending', appliedAt: '2026-03-02', name: 'Trần Văn Bình', university: 'ĐH KHTN HCM', skills: ['React', 'JavaScript', 'CSS'], rating: 4.5 },
    { id: 'ap-3', jobId: 1, userId: 'stu-3', coverLetter: 'Em muốn học hỏi thêm về React và sản phẩm thực tế. Em đang học năm 3 CNTT, có nền tảng tốt về lập trình và đam mê frontend.', status: 'rejected', appliedAt: '2026-03-03', name: 'Lê Thị Cẩm', university: 'ĐH Công Nghệ HCM', skills: ['HTML', 'CSS', 'JavaScript'], rating: 4.2 },
    { id: 'ap-4', jobId: 4, userId: 'stu-4', coverLetter: 'Em chuyên về video editing, thành thạo Premiere Pro và CapCut. Em có kênh TikTok cá nhân 15K followers. Em rất muốn thử sức với dự án này.', status: 'pending', appliedAt: '2026-03-04', name: 'Phạm Đức Dũng', university: 'ĐH Hoa Sen', skills: ['Premiere Pro', 'CapCut', 'After Effects'], rating: 4.7 },
    { id: 'ap-5', jobId: 1, userId: 'stu-5', coverLetter: 'Em có kinh nghiệm 6 tháng làm intern frontend tại một startup. Em thành thạo React, Redux và có hiểu biết về UI/UX.', status: 'pending', appliedAt: '2026-03-04', name: 'Hoàng Thị Dung', university: 'ĐH FPT HCM', skills: ['React', 'Redux', 'Figma'], rating: 4.6 },
  ];
}

/* ─── HELPERS ─────────────────────────────────────── */

function loadApplicants(): Applicant[] {
  try {
    const stored: Applicant[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MANAGE_APPLICANTS) || '[]');
    if (stored.length > 0) return stored;
  } catch { /* use seed */ }
  return getDefaultApplicants();
}

function saveApplicants(apps: Applicant[]) {
  localStorage.setItem(STORAGE_KEYS.MANAGE_APPLICANTS, JSON.stringify(apps));
}

/* ─── SUB COMPONENTS ──────────────────────────────── */

function ApplicantCard({ ap, onAccept, onReject, isActioning }: {
  ap: Applicant;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isActioning: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_MAP[ap.status];

  return (
    <div className={`manage-applicant-card${isActioning ? ' manage-ap-loading' : ''}`}>
      <div className="manage-ap-top">
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
          <span className="manage-ap-hint">💬 Ứng viên đã được chấp nhận — hãy liên hệ qua email!</span>
        )}
        {ap.status === 'rejected' && (
          <span className="manage-ap-hint" style={{ opacity: 0.6 }}>Đã từ chối ứng viên này</span>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, isSelected, applicantCount, pendingCount, onClick }: {
  job: Job | (StoredJob & Record<string, unknown>);
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
        <span>💰 {'pay' in job && typeof (job as Job).pay === 'string' ? (job as Job).pay : formatMoney((job as StoredJob).payMin)}</span>
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
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | 'all'>('all');
  const [confirmAction, setConfirmAction] = useState<{ id: string; name: string; action: 'accept' | 'reject' } | null>(null);

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
    simulateDelay(600).then(() => {
      if (cancelled) return;
      setApplicants(loadApplicants());
      setIsLoading(false);
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
    const fromData = jobsData.filter((j) => j.companyId === user.id);
    const custom: StoredJob[] = (() => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_JOBS) || '[]');
      } catch { return []; }
    })();
    return [...fromData, ...custom.map((c) => ({
      ...c,
      logoText: c.company.slice(0, 2).toUpperCase(),
      logoGradient: 'linear-gradient(135deg,#5B4FFF,#7C72FF)',
      verified: false,
      tags: [] as Job['tags'],
      spotsLeft: 3,
      spotsTotal: 5,
      pay: `${formatMoney(c.payMin)} – ${formatMoney(c.payMax)}`,
      featured: false,
      description: '',
      requirements: [] as string[],
      deliverables: [] as string[],
      duration: '',
      skills: [] as string[],
      companyId: user.id,
    }))];
  }, [user]);

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

  // Handlers
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const handleStatusChange = useCallback(async (id: string, newStatus: ApplicantStatus) => {
    setConfirmAction(null);
    setActioningId(id);
    await simulateDelay(800);

    setApplicants((prev) => {
      const updated = prev.map((a) => a.id === id ? { ...a, status: newStatus } : a);
      saveApplicants(updated);
      return updated;
    });
    setActioningId(null);

    const ap = applicants.find((a) => a.id === id);
    if (newStatus === 'accepted') {
      showToast(`Đã chấp nhận ${ap?.name || 'ứng viên'} 🎉`);
    } else {
      showToast(`Đã từ chối ${ap?.name || 'ứng viên'}`);
    }
  }, [applicants, showToast]);

  const handleAccept = useCallback((id: string) => {
    const ap = applicants.find((a) => a.id === id);
    setConfirmAction({ id, name: ap?.name || 'ứng viên', action: 'accept' });
  }, [applicants]);

  const handleReject = useCallback((id: string) => {
    const ap = applicants.find((a) => a.id === id);
    setConfirmAction({ id, name: ap?.name || 'ứng viên', action: 'reject' });
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
                        isActioning={actioningId === ap.id}
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
            <h3>{confirmAction.action === 'accept' ? '✅ Chấp nhận ứng viên?' : '❌ Từ chối ứng viên?'}</h3>
            <p>
              {confirmAction.action === 'accept'
                ? `Bạn muốn chấp nhận "${confirmAction.name}" vào job "${selectedJob?.title}"?`
                : `Bạn muốn từ chối "${confirmAction.name}"? Hành động này có thể thay đổi sau.`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmAction(null)}>Hủy</button>
              <button
                className={`btn btn-sm ${confirmAction.action === 'accept' ? 'btn-primary' : 'btn-danger'}`}
                onClick={() => handleStatusChange(
                  confirmAction.id,
                  confirmAction.action === 'accept' ? 'accepted' : 'rejected'
                )}
              >
                {confirmAction.action === 'accept' ? '✅ Chấp nhận' : '❌ Từ chối'}
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
