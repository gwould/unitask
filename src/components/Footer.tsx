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
              <a href="#" className="social-link" aria-label="Facebook"><i className="bx bxl-facebook" /></a>
              <a href="#" className="social-link" aria-label="LinkedIn"><i className="bx bxl-linkedin" /></a>
              <a href="#" className="social-link" aria-label="TikTok"><i className="bx bxl-tiktok" /></a>
              <a href="#" className="social-link" aria-label="YouTube"><i className="bx bxl-youtube" /></a>
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
            <Link to="/terms">Điều khoản</Link>
            <Link to="/policy">Chính sách UniTask</Link>
            <Link to="/privacy">Bảo mật</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 UniTask. Made with <span style={{ color: 'var(--pl)' }}>&hearts;</span> for Vietnamese students.</p>
          <div className="footer-badges">
            <span className="f-badge"><i className="bx bx-lock-alt" /> SSL Secured</span>
            <span className="f-badge"><i className="bx bx-check-shield" /> DMCA Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
