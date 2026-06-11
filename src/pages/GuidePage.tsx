import { Link } from 'react-router-dom';

const guides = [
  {
    icon: '🎓',
    title: 'Hướng dẫn cho Sinh viên mới',
    steps: [
      'Đăng ký tài khoản với email .edu hoặc thẻ sinh viên',
      'Hoàn thiện hồ sơ: thêm kỹ năng, ngành học, giới thiệu',
      'Duyệt qua các job được Smart Matching gợi ý',
      'Ứng tuyển và chờ doanh nghiệp duyệt',
      'Nhận task, làm việc, nộp sản phẩm',
      'Nhận thanh toán qua Escrow và đánh giá',
    ],
  },
  {
    icon: '📋',
    title: 'Cách tạo hồ sơ ấn tượng',
    steps: [
      'Sử dụng ảnh đại diện chuyên nghiệp',
      'Viết phần giới thiệu ngắn gọn, nổi bật kỹ năng',
      'Liệt kê kỹ năng chính xác theo project đã làm',
      'Thêm link portfolio, GitHub, Behance nếu có',
      'Cập nhật hồ sơ sau mỗi project hoàn thành',
    ],
  },
  {
    icon: '🛡️',
    title: 'Hệ thống Escrow — Thanh toán an toàn',
    steps: [
      'Doanh nghiệp nạp tiền vào Escrow trước khi job bắt đầu',
      'Sinh viên nhận task và bắt đầu làm việc',
      'Nộp sản phẩm qua hệ thống UniTask',
      'Doanh nghiệp review và duyệt kết quả',
      'Tiền được giải phóng ngay vào ví UniTask',
      'Rút tiền về tài khoản ngân hàng trong 24h',
    ],
  },
  {
    icon: '🏢',
    title: 'Hướng dẫn cho Doanh nghiệp',
    steps: [
      'Đăng ký tài khoản doanh nghiệp và xác thực',
      'Nạp ngân sách vào hệ thống Escrow',
      'Tạo job: mô tả task, yêu cầu, deadline, mức trả',
      'Hệ thống gợi ý sinh viên phù hợp, chọn ứng viên',
      'Review sản phẩm và đánh giá sinh viên',
      'Tiền tự động chuyển khi duyệt, hoặc yêu cầu chỉnh sửa',
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="page-header fade-up" style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Hướng dẫn</div>
          <h1 className="section-title">Bắt đầu với UniTask</h1>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            Hướng dẫn chi tiết từng bước giúp bạn sử dụng UniTask hiệu quả nhất
          </p>
        </div>

        <div className="guides-grid">
          {guides.map((g, i) => (
            <div key={i} className="guide-card fade-up">
              <div className="guide-icon">{g.icon}</div>
              <h3 className="guide-title">{g.title}</h3>
              <ol className="guide-steps">
                {g.steps.map((step, j) => (
                  <li key={j}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="guide-cta fade-up">
          <div className="cta-box" style={{ padding: '48px 40px' }}>
            <h2 style={{ fontSize: 'clamp(22px,3vw,32px)' }}>Vẫn cần hỗ trợ?</h2>
            <p>Đội ngũ UniTask luôn sẵn sàng giúp đỡ bạn</p>
            <div className="cta-btns">
              <Link to="/contact" className="btn btn-white">💬 Liên hệ hỗ trợ</Link>
              <Link to="/register" className="btn btn-outline-white">Đăng ký ngay</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
