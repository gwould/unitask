import { testimonialsData } from '../data/mockData';

export default function Testimonials() {
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
        <div className="testi-grid">
          {testimonialsData.map((t, i) => (
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
      </div>
    </section>
  );
}
