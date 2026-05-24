import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { serviceRegistry, type MatchedJob } from '../services';

const { aiMatching: aiMatchingService } = serviceRegistry;

interface AIMatchingPanelProps {
  title?: string;
  subtitle?: string;
  query?: string;
  topK?: number;
  compact?: boolean;
}

export default function AIMatchingPanel({
  title = 'AI matching dành cho bạn',
  subtitle = 'Hệ thống tự động gợi ý job theo hồ sơ, ngành học, kỹ năng và từ khóa bạn đang tìm kiếm.',
  query,
  topK = 6,
  compact = false,
}: AIMatchingPanelProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    aiMatchingService.getRecommendations(user, query, topK)
      .then((data) => {
        if (!cancelled) setMatches(data);
      })
      .catch(() => {
        if (!cancelled) setMatches([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, query, topK]);

  return (
    <section className="ai-match-section fade-up" style={{ marginTop: 28, marginBottom: compact ? 18 : 40 }}>
      <div className="container">
        <div
          style={{
            padding: 'clamp(20px, 3vw, 32px)',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(91,79,255,.16), rgba(0,212,170,.08))',
            border: '1px solid rgba(255,255,255,.08)',
            boxShadow: '0 18px 50px rgba(0,0,0,.18)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20 }}>
            <div>
              <div className="section-eyebrow" style={{ marginBottom: 8 }}>AI Matching</div>
              <h2 className="section-title" style={{ marginBottom: 8, fontSize: compact ? '28px' : undefined }}>{title}</h2>
              <p className="section-sub" style={{ maxWidth: 820, marginBottom: 0 }}>{subtitle}</p>
            </div>
            {query && (
              <div style={{ color: 'var(--t2)', fontSize: 13, padding: '10px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.04)' }}>
                Từ khóa đang dùng: <strong style={{ color: '#fff' }}>{query}</strong>
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ color: 'var(--t2)', textAlign: 'center', padding: '22px 0' }}>Đang tính điểm phù hợp từ hồ sơ của bạn...</div>
          ) : matches.length === 0 ? (
            <div style={{ color: 'var(--t2)', textAlign: 'center', padding: '22px 0' }}>
              Chưa có job phù hợp đủ mạnh. Hãy cập nhật hồ sơ hoặc thử từ khóa khác.
            </div>
          ) : (
            <div className="jobs-grid" style={{ gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))' }}>
          {matches.map((job) => (
            <Link to={`/jobs/${job.id}`} key={job.id} className={`job-card${job.featured ? ' featured' : ''}`}>
              <div className="jc-header">
                <div className="jc-logo" style={{ background: job.logoGradient }}>{job.logoText}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(91,79,255,.14)', color: '#C8C2FF', fontSize: 12, fontWeight: 800 }}>
                    {Math.round(job.matchScore)}% match
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--t3)' }}>AI đề xuất</span>
                </div>
              </div>
              <div className="jc-title">{job.title}</div>
              <div className="jc-company">
                {job.company} {job.verified && <span className="verified">✅</span>} · {job.location}
              </div>
              <div className="jc-tags">
                {job.tags.slice(0, 3).map((tag, index) => (
                  <span key={`${job.id}-${index}`} className={`tag tag-${tag.variant}`}>{tag.label}</span>
                ))}
              </div>
              <div className="jc-spots">
                <span>Còn {job.spotsLeft}/{job.spotsTotal} chỗ</span>
                <div className="spots-bar">
                  <div className="spots-fill" style={{ width: `${((job.spotsTotal - job.spotsLeft) / job.spotsTotal) * 100}%` }} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, job.matchScore)}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--teal), var(--p))' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {job.matchReasons.map((reason) => (
                  <span key={reason} style={{ fontSize: 11, padding: '5px 9px', borderRadius: 999, background: 'rgba(255,255,255,.04)', color: 'var(--t2)', border: '1px solid rgba(255,255,255,.06)' }}>
                    {reason}
                  </span>
                ))}
              </div>
              <div className="jc-footer">
                <div className="jc-deadline">⏰ {job.deadline}</div>
                <span className="jc-btn">Xem chi tiết →</span>
              </div>
            </Link>
          ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}