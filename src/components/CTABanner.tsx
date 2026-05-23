import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';

const ThreeBackground = lazy(() => import('./three/ThreeBackground'));

export default function CTABanner() {
  return (
    <section id="cta" className="cta-section">
      <div className="container">
        <div className="cta-box fade-up">
          <Suspense fallback={null}>
            <ThreeBackground variant="cta" className="cta-three" />
          </Suspense>
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
