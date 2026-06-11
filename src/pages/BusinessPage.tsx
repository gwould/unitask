import { Link } from 'react-router-dom';

const benefits = [
  { icon: '🎯', title: 'Tuyển đúng người', desc: 'Smart Matching gợi ý sinh viên phù hợp với chuyên ngành và kỹ năng bạn cần.' },
  { icon: '💰', title: 'Tiết kiệm 60% chi phí', desc: 'So với headhunter truyền thống. Chỉ trả khi hài lòng với sản phẩm.' },
  { icon: '🛡️', title: 'Escrow an toàn', desc: 'Tiền nạp vào hệ thống an toàn. Chỉ giải phóng khi bạn duyệt kết quả.' },
  { icon: '⚡', title: 'Nhanh chóng', desc: 'Đăng job hôm nay, nhận ứng viên chất lượng trong 24-48 giờ.' },
  { icon: '📊', title: 'Dashboard quản lý', desc: 'Theo dõi tiến độ, đánh giá ứng viên, quản lý thanh toán một nơi.' },
  { icon: '🏆', title: 'Xây dựng thương hiệu', desc: 'Badge "Nhà tuyển dụng uy tín" giúp thu hút ứng viên giỏi hơn.' },
];

const steps = [
  { num: '01', title: 'Đăng ký & Xác thực', desc: 'Tạo tài khoản doanh nghiệp, xác thực thông tin trong ngày.' },
  { num: '02', title: 'Nạp tiền Escrow', desc: 'Nạp ngân sách vào hệ thống. Tiền được bảo vệ, chỉ trả khi duyệt.' },
  { num: '03', title: 'Đăng Job & Chọn ứng viên', desc: 'Mô tả task, hệ thống gợi ý sinh viên. Bạn chọn và phê duyệt.' },
  { num: '04', title: 'Duyệt & Thanh toán', desc: 'Review sản phẩm, đánh giá kỹ năng. Giải phóng tiền khi hài lòng.' },
];

const caseStudies = [
  { company: 'TechNova VN', result: 'Tuyển 5 dev frontend trong 3 ngày, tiết kiệm 12 triệu so với headhunter', avatar: 'TN', gradient: 'linear-gradient(135deg,#5B4FFF,#7C72FF)' },
  { company: 'GreenBowl Restaurant', result: 'Chạy campaign FB Ads tăng 200% order trong 2 tuần', avatar: 'GR', gradient: 'linear-gradient(135deg,#FFB340,#FF8C00)' },
  { company: 'CreativeBox Studio', result: '3 bộ nhận diện thương hiệu chất lượng, hoàn thành đúng hạn', avatar: 'CR', gradient: 'linear-gradient(135deg,#FF6B35,#FF4D6B)' },
];

export default function BusinessPage() {
  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="biz-hero">
        <div className="container">
          <div className="biz-hero-content fade-up">
            <div className="section-eyebrow">Dành cho Doanh nghiệp</div>
            <h1 className="section-title" style={{ fontSize: 'clamp(32px,5vw,52px)' }}>
              Tuyển dụng sinh viên <span style={{ color: 'var(--accent)' }}>chất lượng</span>
              <br />với chi phí tối ưu
            </h1>
            <p className="section-sub" style={{ maxWidth: 600 }}>
              Tiếp cận hơn 12.000 sinh viên đã xác thực từ 50+ trường Đại học. Đăng job, chọn ứng viên, thanh toán an toàn — tất cả trên một nền tảng.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 32 }}>
              <Link to="/register" className="btn btn-accent">🏢 Đăng ký Doanh nghiệp</Link>
              <a href="#biz-pricing" className="btn btn-ghost">Xem bảng giá →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '96px 0' }}>
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-eyebrow">Lợi ích</div>
            <h2 className="section-title">Tại sao chọn UniTask?</h2>
          </div>
          <div className="biz-benefits-grid">
            {benefits.map((b, i) => (
              <div key={i} className="biz-benefit-card fade-up">
                <div className="biz-benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '96px 0', background: 'var(--s1)' }}>
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-eyebrow">Quy trình</div>
            <h2 className="section-title">4 bước đơn giản</h2>
          </div>
          <div className="how-steps">
            {steps.map((s) => (
              <div key={s.num} className="how-step fade-up">
                <div className="step-num">{s.num}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section style={{ padding: '96px 0' }}>
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-eyebrow">Case Studies</div>
            <h2 className="section-title">Doanh nghiệp nói gì?</h2>
          </div>
          <div className="testi-grid">
            {caseStudies.map((c, i) => (
              <div key={i} className="testi-card fade-up">
                <div className="testi-stars">★★★★★</div>
                <p className="testi-text">"{c.result}"</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: c.gradient }}>{c.avatar}</div>
                  <div>
                    <div className="testi-name">{c.company}</div>
                    <div className="testi-role">Doanh nghiệp đối tác</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 0' }} id="biz-pricing">
        <div className="container">
          <div className="cta-box fade-up">
            <h2>Bắt đầu tuyển dụng hiệu quả</h2>
            <p>Đăng ký miễn phí, đăng job đầu tiên trong 5 phút</p>
            <div className="cta-btns">
              <Link to="/register" className="btn btn-white">Đăng ký Doanh nghiệp</Link>
              <Link to="/contact" className="btn btn-outline-white">Liên hệ tư vấn</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
