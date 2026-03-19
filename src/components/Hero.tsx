import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCounterObserver } from '../hooks/useScroll';

export default function Hero() {
  const statsRef = useRef<HTMLDivElement>(null);
  useCounterObserver(statsRef);

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-grid" />
        <div className="hero-orb orb1" />
        <div className="hero-orb orb2" />
        <div className="hero-orb orb3" />
      </div>
      <div
        className="container"
        style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', width: '100%' }}
      >
        <div className="hero-content">
          <div className="hero-badge">
            <div className="pulse" />
            🎓 Nền tảng #1 cho Sinh viên Việt Nam
          </div>
          <h1>
            Thực tập <span className="highlight">thực chiến</span>
            <br />
            Kiếm tiền <span className="accent-word">ngay hôm nay</span>
          </h1>
          <p className="hero-sub">
            UniTask kết nối sinh viên với Startup &amp; SME thông qua các Micro-job chuyên môn.
            Tích lũy kinh nghiệm, xây CV thực tế — không cần kinh nghiệm trước đó.
          </p>
          <div className="hero-cta">
            <Link to="/jobs" className="btn btn-accent">🚀 Tìm việc ngay</Link>
            <a href="#how" className="btn btn-ghost">Xem cách hoạt động →</a>
          </div>
          <div className="hero-stats" ref={statsRef}>
            <div className="stat-item">
              <div className="stat-num">
                12<span>K+</span>
              </div>
              <div className="stat-label">Sinh viên đã đăng ký</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">
                850<span>+</span>
              </div>
              <div className="stat-label">Doanh nghiệp hợp tác</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">
                4.9<span>★</span>
              </div>
              <div className="stat-label">Điểm đánh giá</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-cards">
            <div className="float-card">
              <div className="fc-company">
                <div className="fc-logo" style={{ background: 'linear-gradient(135deg,#5B4FFF,#7C72FF)' }}>T</div>
                <div>
                  <strong>TechNova VN</strong>
                  <div className="fc-name">Startup · HCM ✅</div>
                </div>
              </div>
              <div className="fc-title">UI/UX Designer</div>
              <div className="fc-pay">1.500.000 – 2.500.000 ₫</div>
              <div className="fc-foot">
                <span className="fc-tag">🎨 Thiết kế</span>
                <span className="fc-time">⏱ 2 tuần</span>
              </div>
            </div>
            <div className="float-card">
              <div className="fc-company">
                <div className="fc-logo" style={{ background: 'linear-gradient(135deg,#00D4AA,#00A882)' }}>M</div>
                <div>
                  <strong>MarketHub</strong>
                  <div className="fc-name">SME · Hà Nội ✅</div>
                </div>
              </div>
              <div className="fc-title">Content Writer (SEO)</div>
              <div className="fc-pay">800.000 – 1.200.000 ₫</div>
              <div className="fc-foot">
                <span className="fc-tag">✍️ Content</span>
                <span className="fc-time">⏱ 1 tuần</span>
              </div>
            </div>
            <div className="float-card">
              <div className="fc-company">
                <div className="fc-logo" style={{ background: 'linear-gradient(135deg,#FF6B35,#FF4D6B)' }}>D</div>
                <div>
                  <strong>DevStack</strong>
                  <div className="fc-name">Startup · Remote ✅</div>
                </div>
              </div>
              <div className="fc-title">Fix Bug — React Web</div>
              <div className="fc-pay">2.000.000 – 3.500.000 ₫</div>
              <div className="fc-foot">
                <span className="fc-tag">💻 IT</span>
                <span className="fc-time">⏱ 3 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
