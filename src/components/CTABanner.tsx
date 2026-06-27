import { Link } from 'react-router-dom';

export default function CTABanner() {
  return (
    <section id="cta" className="cta-section">
      <div className="container">
        <div className="cta-box fade-up">
          <div className="cta-bg-gradient" aria-hidden />
          <h2>Sẵn sàng bắt đầu chưa?</h2>
          <p>
            Tham gia cùng hàng nghìn sinh viên và doanh nghiệp đang kết nối mỗi
            ngày trên UniTask
          </p>
          <div className="cta-btns">
            <Link to="/register" className="btn btn-white">
              Đăng ký miễn phí
            </Link>
            <Link to="/register?role=business" className="btn btn-outline-white">
              Doanh nghiệp bắt đầu tại đây
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
