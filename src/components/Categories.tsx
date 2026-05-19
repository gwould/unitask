import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { observeFadeUpElements } from '../hooks/useScroll';
import { siteService } from '../services/siteService';
import type { Category } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    siteService.getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
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
    <section className="categories" id="categories">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Khám phá ngành nghề</div>
          <h2 className="section-title">Chọn đúng ngành — Nhận đúng job</h2>
          <p className="section-sub">
            Hệ thống Smart Matching gợi ý job phù hợp với chuyên ngành bạn đang học
          </p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-2)' }}>Đang tải danh mục...</div>
        ) : (
          <div className="cat-grid">
            {categories.map((cat, i) => (
              <Link to={`/jobs?cat=${cat.slug}`} className="cat-card fade-up" key={i}>
                <div className="cat-icon" style={{ background: cat.bg }}>{cat.icon}</div>
                <div>
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-count">{cat.count}</div>
                </div>
                <span className="cat-arrow">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
