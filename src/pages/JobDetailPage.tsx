import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { jobsData } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_KEYS } from '../constants';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const job = jobsData.find((j) => j.id === Number(id));

  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied] = useState(false);

  if (!job) {
    return (
      <section className="page-detail">
        <div className="container" style={{ textAlign: 'center', paddingTop: 160 }}>
          <h2 className="section-title">Job không tồn tại</h2>
          <p className="section-sub" style={{ margin: '0 auto 24px' }}>
            Có thể job đã bị xóa hoặc link không đúng.
          </p>
          <Link to="/jobs" className="btn btn-primary">← Quay lại danh sách</Link>
        </div>
      </section>
    );
  }

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!coverLetter.trim()) return;

    // Save to localStorage mock "database"
    const apps = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
    const applicants = JSON.parse(localStorage.getItem(STORAGE_KEYS.MANAGE_APPLICANTS) || '[]');
    const timestamp = Date.now();
    const appliedDate = new Date().toISOString().slice(0, 10);
    const appId = `app-${timestamp}`;

    apps.push({
      id: `app-${timestamp}`,
      jobId: job.id,
      userId: user.id,
      coverLetter,
      status: 'pending',
      appliedAt: appliedDate,
    });

    applicants.push({
      id: `ap-${timestamp}`,
      appId,
      jobId: job.id,
      userId: user.id,
      coverLetter,
      status: 'pending',
      appliedAt: appliedDate,
      name: user.name,
      university: user.university,
      skills: user.skills || [],
      rating: user.rating,
    });

    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    localStorage.setItem(STORAGE_KEYS.MANAGE_APPLICANTS, JSON.stringify(applicants));
    setApplied(true);
    setShowApply(false);
  };

  return (
    <section className="page-detail">
      <div className="container">
        <Link to="/jobs" className="pd-back fade-up">← Quay lại danh sách việc làm</Link>

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
                  <span className="pd-info-value">{job.duration}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">⏰ Hạn ứng tuyển</span>
                  <span className="pd-info-value">{job.deadline}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">👥 Còn lại</span>
                  <span className="pd-info-value">{job.spotsLeft}/{job.spotsTotal} chỗ</span>
                </div>
              </div>
            </div>

            <div className="pd-section">
              <h2>Mô tả công việc</h2>
              <p>{job.description}</p>
            </div>

            <div className="pd-section">
              <h2>Yêu cầu</h2>
              <ul className="pd-list">
                {job.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="pd-section">
              <h2>Sản phẩm cần nộp</h2>
              <ul className="pd-list">
                {job.deliverables.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="pd-section">
              <h2>Kỹ năng cần thiết</h2>
              <div className="pd-skills">
                {job.skills.map((s) => (
                  <span key={s} className="pj-skill">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* sidebar */}
          <div className="pd-sidebar fade-up">
            <div className="pd-sticky">
              {applied ? (
                <div className="pd-applied-box">
                  <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                  <h3>Đã ứng tuyển!</h3>
                  <p>Doanh nghiệp sẽ xem hồ sơ và phản hồi bạn qua hệ thống.</p>
                  <Link to="/dashboard" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                    Xem Dashboard
                  </Link>
                </div>
              ) : showApply ? (
                <div className="pd-apply-form">
                  <h3>Viết thư ứng tuyển</h3>
                  <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 12 }}>
                    Giới thiệu ngắn gọn vì sao bạn phù hợp với job này.
                  </p>
                  <textarea
                    placeholder="VD: Em là sinh viên năm 4 CNTT, có kinh nghiệm 2 năm React..."
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={handleApply}
                      disabled={!coverLetter.trim()}
                    >
                      Gửi ứng tuyển
                    </button>
                    <button className="btn btn-ghost" onClick={() => setShowApply(false)}>
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pd-action-box">
                  <div className="pd-action-pay">💰 {job.pay}</div>
                  <div className="pd-action-duration">⏱ {job.duration}</div>
                  <button
                    className="btn btn-accent"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => user ? setShowApply(true) : navigate('/login')}
                  >
                    🚀 Ứng tuyển ngay
                  </button>
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                    🔖 Lưu job
                  </button>
                  <div className="pd-escrow-note">
                    🛡️ Job này được bảo vệ bởi <strong>Escrow UniTask</strong>. Tiền đã được giữ — bạn sẽ nhận đủ khi hoàn thành.
                  </div>
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
    </section>
  );
}
