import { featuresData } from '../data/mockData';

export default function Features() {
  return (
    <section id="features">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Tính năng cốt lõi</div>
          <h2 className="section-title">Được xây dựng vì sinh viên</h2>
          <p className="section-sub">
            Mọi tính năng đều giải quyết một vấn đề thực tế mà sinh viên đang gặp phải
          </p>
        </div>
        <div className="features-grid">
          {featuresData.map((feat, i) => (
            <div
              key={i}
              className={`feature-card fade-up${feat.large ? ' large' : ''}`}
            >
              <div className="feat-icon" style={{ background: feat.iconBg }}>
                {feat.icon}
              </div>
              <h3 className="feat-title">{feat.title}</h3>
              <p className="feat-desc">{feat.desc}</p>
              {feat.list && (
                <ul className="feat-list">
                  {feat.list.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
