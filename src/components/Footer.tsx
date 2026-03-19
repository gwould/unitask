import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              Uni<span>Task</span>
            </Link>
            <p>
              Nền tảng kết nối sinh viên Việt Nam với cơ hội thực tập ngắn hạn
              và freelance từ các startup & SME.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">📘</a>
              <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
              <a href="#" className="social-link" aria-label="TikTok">🎵</a>
              <a href="#" className="social-link" aria-label="YouTube">▶️</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Sinh viên</h4>
            <Link to="/jobs">Tìm việc</Link>
            <Link to="/profile">Tạo hồ sơ</Link>
            <Link to="/my-applications">Đơn ứng tuyển</Link>
            <Link to="/wallet">Ví & Giao dịch</Link>
          </div>
          <div className="footer-col">
            <h4>Doanh nghiệp</h4>
            <Link to="/post-job">Đăng việc</Link>
            <Link to="/manage-jobs">Quản lý ứng viên</Link>
            <Link to="/wallet">Escrow & Thanh toán</Link>
            <Link to="/register">Đăng ký miễn phí</Link>
          </div>
          <div className="footer-col">
            <h4>UniTask</h4>
            <Link to="/about">Về chúng tôi</Link>
            <Link to="/contact">Liên hệ</Link>
            <a href="#">Điều khoản</a>
            <a href="#">Bảo mật</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 UniTask. Made with 💜 for Vietnamese students.</p>
          <div className="footer-badges">
            <span className="f-badge">🔒 SSL Secured</span>
            <span className="f-badge">✅ DMCA Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
