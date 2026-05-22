import { useEffect, useState } from 'react';
import { observeFadeUpElements } from '../hooks/useScroll';
import { serviceRegistry } from '../services';
import type { Testimonial } from '../types';

const { site: siteService } = serviceRegistry;

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    siteService.getTestimonials()
      .then((data) => {
        if (!cancelled) setTestimonials(data);
      })
      .catch(() => {
        if (!cancelled) setTestimonials([]);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          requestAnimationFrame(() => observeFadeUpElements());
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="testimonials" className="testimonials-bg">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Câu chuyện thành công</div>
          <h2 className="section-title">Sinh viên nói gì?</h2>
          <p className="section-sub">
            Những trải nghiệm thực tế từ cộng đồng UniTask
          </p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-2)' }}>Đang tải đánh giá...</div>
        ) : (
          <div className="testi-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testi-card fade-up">
                <div className="testi-stars">
                  {'★'.repeat(t.stars)}
                </div>
                <p className="testi-text">{t.text}</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: t.avatarGradient }}>{t.avatarLetter}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
