import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createNotification } from '../services/automationEngine';
import { serviceRegistry } from '../services';
import { conversationService } from '../services/conversationService';
import { useNotifications } from '../contexts/NotificationContext';
import type { Job } from '../types';
import { ReportModal } from '../components/ui';

const { applications: applicationService, jobs: jobService } = serviceRegistry;

function timeUntilDeadline(deadline: string): string {
  if (!deadline) return '';
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return 'Đã hết hạn';
  const days = Math.floor(diff / 86_400_000);
  if (days > 30) return `${Math.floor(days / 30)} tháng`;
  if (days > 0) return `${days} ngày`;
  const hours = Math.floor(diff / 3_600_000);
  return `${hours} giờ`;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshBadge } = useNotifications();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);

  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState('');
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleCvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvError('');
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setCvError('Chỉ hỗ trợ file PDF hoặc DOCX');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('File không được lớn hơn 5MB');
      return;
    }
    setCvFile(file);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    jobService.getById(id)
      .then((data) => {
        if (!cancelled) {
          setJob(data ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setJob(null);
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  // Load related jobs
  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    jobService.getAll()
      .then((all) => {
        if (cancelled) return;
        const related = all
          .filter((j) => j.id !== job.id)
          .filter((j) =>
            j.category === job.category ||
            j.skills.some((s) => job.skills.includes(s))
          )
          .slice(0, 3);
        setRelatedJobs(related);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [job]);

  if (isLoading) {
    return (
      <section className="page-detail">
        <div className="container" style={{ paddingTop: 120 }}>
          <div className="pd-loading">
            <div className="pd-loading-card">
              <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 14 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '60%', height: 24, borderRadius: 6, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 4 }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, margin: '20px 0' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />
              ))}
            </div>
            <div className="skeleton" style={{ height: 120, borderRadius: 14, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 80, borderRadius: 14 }} />
          </div>
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="page-detail">
        <div className="container" style={{ textAlign: 'center', paddingTop: 160 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
          <h2 className="section-title">Job không tồn tại</h2>
          <p className="section-sub" style={{ margin: '0 auto 24px' }}>
            Có thể job đã bị xóa hoặc link không đúng.
          </p>
          <Link to="/jobs" className="btn btn-primary">← Quay lại danh sách</Link>
        </div>
      </section>
    );
  }

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!coverLetter.trim() || submitting) return;

    setSubmitting(true);
    let appId: number | string | null = null;
    try {
      const created = await applicationService.apply({
        jobId: job.id,
        userId: user.id,
        coverLetter: coverLetter.trim(),
      });
      appId = created.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('hết hạn') || msg.includes('401')) {
        setToast('Phiên đăng nhập hết hạn. Vui lòng đăng xuất và đăng nhập lại.');
      } else {
        setToast(msg || 'Không thể gửi ứng tuyển. Kiểm tra kết nối và thử lại.');
      }
      setSubmitting(false);
      return;
    }

    if (job.companyId) {
      createNotification({
        recipientId: String(job.companyId),
        recipientType: 'business',
        title: '📥 Có ứng viên mới',
        message: `${user.name} vừa ứng tuyển vào job "${job.title}".`,
        type: 'system',
        relatedJobId: job.id,
        relatedApplicationId: appId ? String(appId) : undefined,
        actionUrl: '/manage-jobs',
      });
    }

    createNotification({
      recipientId: String(user.id),
      recipientType: 'student',
      title: '📨 Ứng tuyển thành công',
      message: `Bạn đã ứng tuyển job "${job.title}" · Lương: ${job.pay} · Hạn: ${job.deadline}.`,
      type: 'application_status',
      relatedJobId: job.id,
      relatedApplicationId: appId ? String(appId) : undefined,
      actionUrl: `/jobs/${job.id}`,
    });

    setSubmitting(false);
    setToast('Đã gửi ứng tuyển thành công! 🎉');
    setApplied(true);
    setShowApply(false);
    refreshBadge();
  };

  const deadlineText = timeUntilDeadline(job.deadline);
  const spotsPercent = job.spotsTotal > 0 ? ((job.spotsTotal - job.spotsLeft) / job.spotsTotal) * 100 : 0;

  return (
    <section className="page-detail">
      <div className="container">
        {/* Breadcrumb */}
        <div className="pd-breadcrumb fade-up">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/jobs">Việc làm</Link>
          <span>/</span>
          <span className="pd-bread-current">{job.title}</span>
        </div>

        <div className="pd-layout">
          {/* main */}
          <div className="pd-main fade-up">
            <div className="pd-hero-card">
              <div className="pd-top">
                <div className="jc-logo" style={{ background: job.logoGradient, width: 56, height: 56, fontSize: 22 }}>
                  {job.logoText}
                </div>
                <div>
                  <h1 className="pd-title">{job.title}</h1>
                  <div className="pd-company">
                    {job.company} {job.verified && '✅'} · {job.location}
                  </div>
                </div>
              </div>
              <div className="jc-tags" style={{ margin: '16px 0' }}>
                {job.tags.map((t, i) => (
                  <span key={i} className={`tag tag-${t.variant}`}>{t.label}</span>
                ))}
              </div>
              <div className="pd-quick-info">
                <div className="pd-info-item">
                  <span className="pd-info-label">💰 Mức lương</span>
                  <span className="pd-info-value">{job.pay}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">⏱ Thời gian</span>
                  <span className="pd-info-value">{job.duration || 'Linh hoạt'}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">⏰ Hạn ứng tuyển</span>
                  <span className="pd-info-value">
                    {deadlineText && <span className={deadlineText === 'Đã hết hạn' ? 'pd-expired' : ''}>{deadlineText}</span>}
                    {!deadlineText && job.deadline}
                  </span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">👥 Còn lại</span>
                  <span className="pd-info-value">{job.spotsLeft}/{job.spotsTotal} chỗ</span>
                  <div className="pd-spots-bar">
                    <div className="pd-spots-fill" style={{ width: `${spotsPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {job.description && (
              <div className="pd-section">
                <h2>Mô tả công việc</h2>
                <p>{job.description}</p>
              </div>
            )}

            {job.requirements.length > 0 && (
              <div className="pd-section">
                <h2>Yêu cầu</h2>
                <ul className="pd-list">
                  {job.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.deliverables.length > 0 && (
              <div className="pd-section">
                <h2>Sản phẩm cần nộp</h2>
                <ul className="pd-list">
                  {job.deliverables.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills.length > 0 && (
              <div className="pd-section">
                <h2>Kỹ năng cần thiết</h2>
                <div className="pd-skills">
                  {job.skills.map((s) => (
                    <span key={s} className="pj-skill">{s}</span>
                  ))}
                </div>
                {user?.role === 'student' && user.skills && user.skills.length > 0 && (
                  <div className="pd-skill-match">
                    <span className="pd-skill-match-label">Kỹ năng phù hợp:</span>
                    {job.skills.filter(s => user.skills?.some(us => us.toLowerCase() === s.toLowerCase())).length > 0 ? (
                      <span className="pd-skill-match-count pd-match-good">
                        ✓ {job.skills.filter(s => user.skills?.some(us => us.toLowerCase() === s.toLowerCase())).length}/{job.skills.length}
                      </span>
                    ) : (
                      <span className="pd-skill-match-count pd-match-none">
                        0/{job.skills.length} — Hãy cập nhật kỹ năng trong <Link to="/profile">hồ sơ</Link>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Related jobs */}
            {relatedJobs.length > 0 && (
              <div className="pd-section pd-related">
                <h2>Job tương tự</h2>
                <div className="pd-related-grid">
                  {relatedJobs.map((rj) => (
                    <Link to={`/jobs/${rj.id}`} key={rj.id} className="pd-related-card">
                      <div className="jc-logo" style={{ background: rj.logoGradient, width: 36, height: 36, fontSize: 13 }}>
                        {rj.logoText}
                      </div>
                      <div className="pd-related-info">
                        <div className="pd-related-title">{rj.title}</div>
                        <div className="pd-related-meta">{rj.company} · {rj.pay}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* sidebar */}
          <div className="pd-sidebar fade-up">
            <div className="pd-sticky">
              {applied ? (
                <div className="pd-applied-box">
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                  <h3>Ứng tuyển thành công!</h3>
                  <p>Doanh nghiệp sẽ xem hồ sơ và phản hồi bạn qua hệ thống.</p>

                  {/* Next steps guide */}
                  <div className="pd-next-steps">
                    <h4>Bước tiếp theo:</h4>
                    <div className="pd-ns-list">
                      <div className="pd-ns-item pd-ns-done">
                        <span className="pd-ns-num">✓</span>
                        <span>Gửi cover letter</span>
                      </div>
                      <div className="pd-ns-item pd-ns-current">
                        <span className="pd-ns-num">2</span>
                        <span>Chờ doanh nghiệp xét duyệt</span>
                      </div>
                      <div className="pd-ns-item">
                        <span className="pd-ns-num">3</span>
                        <span>Nhận task & bắt đầu làm</span>
                      </div>
                      <div className="pd-ns-item">
                        <span className="pd-ns-num">4</span>
                        <span>Nộp sản phẩm & nhận tiền</span>
                      </div>
                    </div>
                  </div>

                  <div className="pd-applied-actions">
                    <Link to="/my-applications" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      📋 Theo dõi đơn
                    </Link>
                    <Link to="/my-tasks" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      🔨 Công việc
                    </Link>
                  </div>
                </div>
              ) : showApply ? (
                <div className="pd-apply-form">
                  <h3>✍️ Ứng tuyển vị trí này</h3>
                  <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 12 }}>
                    Giới thiệu ngắn gọn vì sao bạn phù hợp với job này.
                  </p>
                  <textarea
                    placeholder="VD: Em là sinh viên năm 4 CNTT, có kinh nghiệm 2 năm React. Em rất hứng thú với dự án này vì..."
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    maxLength={1000}
                  />
                  <div className="pd-apply-footer">
                    <span className={`pd-char-count${coverLetter.length > 800 ? ' pd-char-warn' : ''}`}>
                      {coverLetter.length}/1000
                    </span>
                    {coverLetter.length < 30 && coverLetter.length > 0 && (
                      <span className="pd-hint-text">Nên viết ít nhất 30 ký tự</span>
                    )}
                  </div>

                  {/* CV Upload */}
                  <div className="pd-cv-upload">
                    <label className="pd-cv-label">
                      📎 Đính kèm CV (PDF, DOCX — tối đa 5MB)
                    </label>
                    <div className="pd-cv-dropzone">
                      <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleCvSelect}
                        id="cv-upload-input"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="cv-upload-input" className="pd-cv-btn">
                        {cvFile ? `📄 ${cvFile.name}` : '📤 Chọn file CV từ máy tính'}
                      </label>
                      {cvFile && (
                        <button
                          type="button"
                          className="pd-cv-remove"
                          onClick={() => setCvFile(null)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {cvError && <span className="pd-cv-error">{cvError}</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={handleApply}
                      disabled={!coverLetter.trim() || coverLetter.trim().length < 10 || submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="btn-spinner" />
                          Đang gửi...
                        </>
                      ) : (
                        '📨 Nộp CV & Ứng tuyển'
                      )}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setShowApply(false)}>
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pd-action-box">
                  <div className="pd-action-pay">💰 {job.pay}</div>
                  <div className="pd-action-duration">⏱ {job.duration || 'Linh hoạt'}</div>
                  {deadlineText === 'Đã hết hạn' ? (
                    <div className="pd-expired-notice">
                      ⏰ Job này đã hết hạn ứng tuyển
                    </div>
                  ) : (
                    <button
                      className="btn btn-accent"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => user ? setShowApply(true) : navigate('/login')}
                    >
                      🚀 Ứng tuyển ngay
                    </button>
                  )}
                  {user && job.companyUserId && String(job.companyUserId) !== String(user.id) && (
                    <button
                      className="btn btn-ghost"
                      style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                      onClick={async () => {
                        try {
                          const conv = await conversationService.start(String(job.companyUserId));
                          navigate(`/messages/${conv.id}`);
                        } catch {
                          setToast('Không thể bắt đầu cuộc trò chuyện. Thử lại sau.');
                        }
                      }}
                    >
                      💬 Nhắn tin cho doanh nghiệp
                    </button>
                  )}
                  {!user && (
                    <p className="pd-login-hint">
                      <Link to="/login">Đăng nhập</Link> hoặc <Link to="/register">đăng ký</Link> để ứng tuyển
                    </p>
                  )}
                  <div className="pd-escrow-note">
                    🛡️ Job này được bảo vệ bởi <strong>Escrow UniTask</strong>. Tiền đã được giữ — bạn sẽ nhận đủ khi hoàn thành.
                  </div>
                  {user && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'center', marginTop: 8, color: 'var(--red)' }}
                      onClick={() => setShowReport(true)}
                    >
                      🚩 Báo cáo job này
                    </button>
                  )}
                </div>
              )}

              <div className="pd-company-card">
                <div className="jc-logo" style={{ background: job.logoGradient, width: 40, height: 40, fontSize: 16 }}>
                  {job.logoText}
                </div>
                <div>
                  <strong>{job.company}</strong>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                    {job.verified ? '✅ Đã xác thực' : 'Chưa xác thực'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className="apps-toast apps-toast-success">
          <span>✅</span>
          {toast}
          <button className="apps-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
      {showReport && job && (
        <ReportModal
          targetLabel={`Job: ${job.title}`}
          reportedJobId={String(job.id)}
          reportedUserId={job.companyUserId ? String(job.companyUserId) : undefined}
          onClose={() => setShowReport(false)}
          onDone={(msg) => setToast(msg)}
        />
      )}
    </section>
  );
}
