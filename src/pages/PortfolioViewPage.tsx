import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { portfolioService } from '../services/portfolioService';
import type { PortfolioPublic } from '../types/portfolio';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="pv-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </span>
  );
}

export default function PortfolioViewPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('all');

  const isOwner = user && String(user.id) === userId;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    portfolioService.getPublicPortfolio(userId)
      .then(setData)
      .catch(() => setError('Không tìm thấy portfolio'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <section className="pv-page"><div className="container"><div className="pf-loading"><div className="spinner" /></div></div></section>;
  if (error || !data) return (
    <section className="pv-page">
      <div className="container">
        <div className="pf-empty">
          <div className="pf-empty-icon">📋</div>
          <h3>{error || 'Không tìm thấy portfolio'}</h3>
          <a href="/" className="btn btn-primary" style={{ marginTop: 16 }}>← Trang chủ</a>
        </div>
      </div>
    </section>
  );

  const sections = [
    { key: 'all', label: 'Tất cả' },
    ...(data.projects.length ? [{ key: 'projects', label: 'Dự án' }] : []),
    ...(data.educations.length ? [{ key: 'education', label: 'Học vấn' }] : []),
    ...(data.certifications.length ? [{ key: 'certifications', label: 'Chứng chỉ' }] : []),
    ...(data.reviews.length ? [{ key: 'reviews', label: 'Đánh giá' }] : []),
  ];

  const show = (s: string) => activeSection === 'all' || activeSection === s;

  return (
    <section className="pv-page">
      <div className="container">
        {/* Hero */}
        <div className="pv-hero">
          <div className="pv-hero-bg" />
          <div className="pv-hero-content">
            <div className="pv-avatar">
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt={data.fullName} />
              ) : (
                <span>{data.fullName.charAt(0).toUpperCase()}</span>
              )}
              {data.isVerified && <span className="pv-verified" title="Đã xác thực">✓</span>}
            </div>
            <div className="pv-hero-info">
              <h1>{data.fullName}</h1>
              {data.title && <p className="pv-title">{data.title}</p>}
              {data.university && (
                <p className="pv-university">
                  🎓 {data.university}{data.major ? ` — ${data.major}` : ''}
                </p>
              )}
              {data.bio && <p className="pv-bio">{data.bio}</p>}
              <div className="pv-stats">
                <div className="pv-stat">
                  <strong>{data.completedJobs}</strong>
                  <span>Dự án hoàn thành</span>
                </div>
                <div className="pv-stat">
                  <strong>{data.averageRating > 0 ? data.averageRating.toFixed(1) : '—'}</strong>
                  <span>Đánh giá</span>
                </div>
                <div className="pv-stat">
                  <strong>{data.reviewCount}</strong>
                  <span>Lượt đánh giá</span>
                </div>
              </div>
              <div className="pv-hero-actions">
                {data.email && <a href={`mailto:${data.email}`} className="btn btn-primary btn-sm">✉ Liên hệ</a>}
                {data.cvUrl && <a href={data.cvUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">📄 Tải CV</a>}
                {data.portfolioUrl && <a href={data.portfolioUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">🌐 Website</a>}
                {isOwner && <button className="btn btn-outline btn-sm" onClick={() => navigate('/portfolio-builder')}>✏️ Chỉnh sửa</button>}
              </div>
            </div>
          </div>
        </div>

        {/* Section Filter */}
        {sections.length > 2 && (
          <div className="pv-section-nav">
            {sections.map(s => (
              <button key={s.key} className={`pv-nav-btn ${activeSection === s.key ? 'active' : ''}`} onClick={() => setActiveSection(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && show('all') && (
          <div className="pv-section">
            <h2 className="pv-section-title">💡 Kỹ năng</h2>
            <div className="pv-skills">
              {data.skills.map(s => (
                <div key={s.id} className="pv-skill-chip">
                  <span className="pv-skill-name">{s.name}</span>
                  {s.proficiency && <span className="pv-skill-level">{s.proficiency}</span>}
                  {s.endorsementCount > 0 && <span className="pv-skill-endorse">+{s.endorsementCount}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && show('projects') && (
          <div className="pv-section">
            <h2 className="pv-section-title">🚀 Dự án</h2>
            <div className="pv-projects-grid">
              {data.projects.map(p => (
                <div key={p.id} className={`pv-project-card ${p.isHighlighted ? 'highlighted' : ''}`}>
                  {p.imageUrl && (
                    <div className="pv-project-img">
                      <img src={p.imageUrl} alt={p.title} />
                      {p.isHighlighted && <span className="pv-highlight-badge">⭐ Nổi bật</span>}
                    </div>
                  )}
                  <div className="pv-project-body">
                    <h3>{p.title}</h3>
                    {p.role && <span className="pf-role-tag">{p.role}</span>}
                    {p.description && <p className="pv-project-desc">{p.description}</p>}
                    {p.tags && (
                      <div className="pf-tags">
                        {p.tags.split(',').map((t, i) => <span key={i} className="pf-tag">{t.trim()}</span>)}
                      </div>
                    )}
                    {(p.startDate || p.endDate) && (
                      <p className="pv-project-date">
                        {p.startDate ? new Date(p.startDate).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }) : ''}
                        {p.endDate ? ` — ${new Date(p.endDate).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}` : ' — Hiện tại'}
                      </p>
                    )}
                    <div className="pv-project-links">
                      {p.projectUrl && <a href={p.projectUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">🔗 Xem demo</a>}
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">💻 GitHub</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.educations.length > 0 && show('education') && (
          <div className="pv-section">
            <h2 className="pv-section-title">🎓 Học vấn</h2>
            <div className="pv-timeline">
              {data.educations.map(e => (
                <div key={e.id} className="pv-timeline-item">
                  <div className="pv-timeline-dot" />
                  <div className="pv-timeline-content">
                    <h3>{e.institution}</h3>
                    <p className="pv-timeline-sub">
                      {[e.degree, e.fieldOfStudy].filter(Boolean).join(' — ')}
                    </p>
                    <p className="pv-timeline-date">
                      {e.startYear ?? '?'} — {e.isCurrent ? 'Hiện tại' : (e.endYear ?? '?')}
                      {e.gpa != null && <span className="pf-gpa">GPA: {e.gpa}</span>}
                    </p>
                    {e.description && <p className="pv-timeline-desc">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && show('certifications') && (
          <div className="pv-section">
            <h2 className="pv-section-title">📜 Chứng chỉ</h2>
            <div className="pv-certs-grid">
              {data.certifications.map(c => (
                <div key={c.id} className="pv-cert-card">
                  {c.imageUrl && <div className="pv-cert-img"><img src={c.imageUrl} alt={c.name} /></div>}
                  <div className="pv-cert-body">
                    <h3>{c.name}</h3>
                    {c.issuingOrganization && <p className="pv-cert-org">{c.issuingOrganization}</p>}
                    <p className="pv-cert-date">
                      {c.issueDate ? new Date(c.issueDate).toLocaleDateString('vi-VN') : ''}
                      {c.expirationDate && ` — ${new Date(c.expirationDate).toLocaleDateString('vi-VN')}`}
                    </p>
                    {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="pv-cert-link">Xác thực →</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {data.reviews.length > 0 && show('reviews') && (
          <div className="pv-section">
            <h2 className="pv-section-title">⭐ Đánh giá ({data.reviewCount})</h2>
            <div className="pv-reviews">
              {data.reviews.map(r => (
                <div key={r.id} className="pv-review-card">
                  <div className="pv-review-header">
                    <div className="pv-review-avatar">
                      {r.reviewerAvatar ? <img src={r.reviewerAvatar} alt="" /> : <span>👤</span>}
                    </div>
                    <div>
                      <strong>{r.reviewerName || 'Ẩn danh'}</strong>
                      {r.jobTitle && <p className="pv-review-job">{r.jobTitle}</p>}
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.comment && <p className="pv-review-comment">{r.comment}</p>}
                  {r.createdAt && <p className="pv-review-date">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for new portfolio */}
        {data.projects.length === 0 && data.educations.length === 0 && data.certifications.length === 0 && data.skills.length === 0 && (
          <div className="pf-empty" style={{ marginTop: 40 }}>
            <div className="pf-empty-icon">📋</div>
            <h3>Portfolio đang được xây dựng</h3>
            <p>Sinh viên chưa thêm nội dung vào portfolio</p>
            {isOwner && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/portfolio-builder')}>
                Bắt đầu xây dựng portfolio
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
