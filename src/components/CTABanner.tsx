import { Link } from 'react-router-dom';

export default function CTABanner() {
  return (
    <section id="cta">
      <div className="container">
        <div className="cta-box fade-up">
          <h2>Sẵn sàng bắt đầu chưa?</h2>
          <p>
            Tham gia cùng hàng nghìn sinh viên và doanh nghiệp đang kết nối mỗi
            ngày trên UniTask
          </p>
          <div className="cta-btns">
            <Link to="/register" className="btn btn-white">
              🎓 Đăng ký Sinh viên — Miễn phí
            </Link>
            <Link to="/post-job" className="btn btn-outline-white">
              🏢 Đăng việc cho Doanh nghiệp
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
