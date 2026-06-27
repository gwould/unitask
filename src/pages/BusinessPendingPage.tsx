import { Link } from 'react-router-dom';

/**
 * Trang hiển thị sau khi doanh nghiệp đăng ký thành công — chờ admin xác thực.
 * Có nút quay lại trang chính.
 */
export default function BusinessPendingPage() {
  return (
    <section className="page-pending">
      <div
        className="container"
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
        }}
      >
        <div
          className="glass"
          style={{
            maxWidth: 560,
            width: '100%',
            textAlign: 'center',
            padding: '48px 40px',
            borderRadius: 'var(--r20)',
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'rgba(124,58,237,.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
            }}
          >
            ⏳
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 14,
              color: 'var(--t0)',
            }}
          >
            Đăng ký thành công!
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--t2)', marginBottom: 8 }}>
            Tài khoản doanh nghiệp của bạn đang <strong style={{ color: 'var(--pl)' }}>chờ admin xác thực</strong>.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--t2)', marginBottom: 28 }}>
            Chúng tôi sẽ kiểm tra thông tin và gửi email thông báo tới bạn ngay khi tài khoản được phê duyệt.
            Quá trình này thường mất từ vài giờ đến 1 ngày làm việc.
          </p>

          <div
            style={{
              background: 'rgba(255,255,255,.04)',
              border: '1px solid var(--bd)',
              borderRadius: 'var(--r14)',
              padding: '16px 20px',
              marginBottom: 28,
              textAlign: 'left',
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--t2)',
            }}
          >
            💡 Trong thời gian chờ, bạn có thể chuẩn bị sẵn thông tin dự án và mô tả công việc để
            đăng tuyển ngay sau khi được kích hoạt.
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary">
              ← Quay lại trang chính
            </Link>
            <Link to="/login" className="btn btn-ghost">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
