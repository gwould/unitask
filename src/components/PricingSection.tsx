import { Link } from 'react-router-dom';

const HOME_PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 'Miễn phí',
    period: 'Không giới hạn',
    badge: 'Mới bắt đầu',
    highlight: false,
    features: [
      'Đăng tối đa 3 job/tháng',
      'Hiển thị cơ bản',
      'Quản lý ứng viên thủ công',
      'Hỗ trợ email',
    ],
    cta: 'Bắt đầu miễn phí',
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '499.000 đ',
    period: '/ tháng',
    badge: 'Phổ biến nhất',
    highlight: true,
    features: [
      'Đăng job không giới hạn',
      'Ưu tiên hiển thị trước Starter',
      'AI matching ứng viên',
      'Báo cáo tuyển dụng theo tuần',
      'Hỗ trợ phản hồi trong 24h',
    ],
    cta: 'Nâng cấp Growth',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '999.000 đ',
    period: '/ tháng',
    badge: 'Tăng tốc tuyển dụng',
    highlight: false,
    features: [
      'Tất cả quyền lợi Growth',
      'Ưu tiên top đầu danh sách',
      'Branding doanh nghiệp nổi bật',
      'Workflow duyệt bài tự động',
      'CSKH ưu tiên 1-1',
    ],
    cta: 'Nâng cấp Pro',
  },
] as const;

export default function PricingSection() {
  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Bảng giá</div>
          <h2 className="section-title">Gói đăng ký cho Doanh nghiệp</h2>
          <p className="section-sub">
            Xem nhanh các gói trước khi đăng ký. Bạn có thể bắt đầu miễn phí và nâng cấp bất cứ lúc nào.
          </p>
        </div>

        <div className="pricing-grid">
          {HOME_PLANS.map((plan) => (
            <article key={plan.key} className={`pricing-card fade-up${plan.highlight ? ' featured' : ''}`}>
              <div className="pricing-top">
                <div>
                  <h3>{plan.name}</h3>
                  <p>{plan.badge}</p>
                </div>
                {plan.highlight && <span className="pricing-chip">Recommended</span>}
              </div>

              <div className="pricing-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>

              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`btn ${plan.highlight ? 'btn-primary' : 'btn-ghost'}`}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
