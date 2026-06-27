import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HOME_PLANS = [
  {
    key: 'free-starter',
    name: 'Free Starter',
    price: '0 đ',
    period: '/ tháng',
    badge: 'Khởi động',
    highlight: false,
    features: [
      '5 job/tháng',
      'Hiển thị cơ bản',
      'Gợi ý việc làm phù hợp',
      'Hỗ trợ email',
    ],
    cta: 'Bắt đầu miễn phí',
  },
  {
    key: 'starter',
    name: 'Starter Package',
    price: '299.000 đ',
    period: '/ tháng',
    badge: 'Linh hoạt',
    highlight: true,
    features: [
      '30 job/tháng',
      'Ưu tiên hiển thị bài đăng',
      'Gợi ý ứng viên phù hợp',
      'Giảm phí giao dịch',
      'Thống kê hiệu quả tuyển dụng',
    ],
    cta: 'Nâng cấp Starter',
  },
  {
    key: 'growth',
    name: 'Growth Package',
    price: '799.000 đ',
    period: '/ tháng',
    badge: 'Không giới hạn',
    highlight: false,
    features: [
      'Job không giới hạn',
      'Ưu tiên hiển thị bài đăng',
      'Gợi ý ứng viên phù hợp',
      'Giảm phí giao dịch',
      'Thống kê hiệu quả tuyển dụng',
    ],
    cta: 'Nâng cấp Growth',
  },
] as const;

export default function PricingSection() {
  const { user } = useAuth();

  // Đã đăng nhập → đi thẳng tới trang thanh toán gói
  const ctaTarget = (planKey: string) => {
    if (!user) return '/register';
    if (planKey === 'free-starter') return '/dashboard';
    return `/upgrade/${planKey}`;
  };
  const ctaLabel = (plan: (typeof HOME_PLANS)[number]) => {
    if (!user) return plan.cta;
    if (plan.key === 'free-starter') return 'Gói hiện tại của bạn';
    return plan.cta;
  };

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Bảng giá</div>
          <h2 className="section-title">Gói đăng ký cho Doanh nghiệp</h2>
          <p className="section-sub">
            Bắt đầu miễn phí, sau đó chọn gói phù hợp. Có thể nâng cấp hoặc hạ cấp linh hoạt theo tháng.
          </p>
        </div>

        <div className="pricing-note fade-up">
          <div className="pricing-note-card">
            <div className="pricing-note-title">Phí giao dịch (Commission Fee)</div>
            <p>
              UniTask thu phí hoa hồng khi giao dịch hoàn tất qua Escrow. Sinh viên được miễn phí 5 giao dịch đầu tiên.
            </p>
            <ul>
              <li>Job dưới 2.000.000 VNĐ: phí 10%</li>
              <li>Job từ 2.000.000 VNĐ trở lên: phí 8%</li>
            </ul>
            <div className="pricing-note-example">
              Ví dụ: Job 1.000.000 VNĐ → Sinh viên nhận 900.000 VNĐ, UniTask thu 100.000 VNĐ.
            </div>
          </div>
        </div>

        <div className="pricing-grid">
          {HOME_PLANS.map((plan) => (
            <article key={plan.key} className={`pricing-card fade-up${plan.highlight ? ' featured' : ''}`}>
              <div className="pricing-top">
                <div>
                  <h3>{plan.name}</h3>
                  <p>{plan.badge}</p>
                </div>
                {plan.highlight && <span className="pricing-chip">Phổ biến nhất</span>}
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
                to={ctaTarget(plan.key)}
                className={`btn ${plan.highlight ? 'btn-primary' : 'btn-ghost'}`}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {ctaLabel(plan)}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
