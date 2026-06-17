import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-orb orb1" />
        <div className="hero-orb orb2" />
        <div className="hero-grid" />
      </div>
      <div className="container hero-container">
        <div className="hero-content">
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
        </div>
      </div>
    </section>
  );
}
