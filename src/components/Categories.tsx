import { Link } from 'react-router-dom';
import { categoriesData } from '../data/mockData';

export default function Categories() {
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
        <div className="cat-grid">
          {categoriesData.map((cat, i) => (
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
      </div>
    </section>
  );
}
