import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCounterObserver } from '../hooks/useScroll';

export default function Hero() {
  const statsRef = useRef<HTMLDivElement>(null);
  useCounterObserver(statsRef);

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-orb orb1" />
        <div className="hero-orb orb2" />
        <div className="hero-grid" />
      </div>
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            🏆 Nền tảng #1 cho Sinh viên Việt Nam
          </div>
          <h1>
            Thực tập thực chiến —{' '}
            <span className="highlight">Kiếm tiền</span>
            <br />
            <span className="highlight">ngay</span>{' '}hôm nay
          </h1>
          <p className="hero-sub">
            Kết nối sinh viên Việt Nam với hàng trăm doanh nghiệp qua micro-job chuyên
            môn thực tế. Thanh toán bảo mật, AI matching, cơ hội thăng tiến.
          </p>
          <div className="hero-cta">
            <Link to="/jobs" className="btn btn-primary btn-lg">Tìm việc ngay <span className="arrow">→</span></Link>
            <a href="#how" className="btn btn-ghost">Xem cách hoạt động</a>
          </div>
          <div className="hero-stats" ref={statsRef}>
            <div className="stat-item">
              <div className="stat-num">12<span>K+</span></div>
              <div className="stat-label">Sinh viên</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">850<span>+</span></div>
              <div className="stat-label">Doanh nghiệp</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">4.9<span>★</span></div>
              <div className="stat-label">Đánh giá</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">98<span>%</span></div>
              <div className="stat-label">Thanh toán đúng hạn</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
