import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '../constants';
import { formatMoney } from '../utils/format';

// Nguồn dữ liệu giá dùng chung với UpgradePage (tránh lệch giá giữa các trang).
const HOME_PLANS = SUBSCRIPTION_PLANS;

export default function PricingSection() {
  const { user } = useAuth();

  // Đã đăng nhập → đi thẳng tới trang thanh toán gói
  const ctaTarget = (planKey: string) => {
    if (!user) return '/register';
    if (planKey === 'free-starter') return '/dashboard';
    return `/upgrade/${planKey}`;
  };
  const ctaLabel = (plan: SubscriptionPlan) => {
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
          <div className="pricing-launch-banner">
            <i className="bx bx-gift" /> Ưu đãi ra mắt: <strong>giảm 50%</strong> + <strong>30 ngày dùng thử miễn phí</strong> mọi gói trả phí.
          </div>
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
                {plan.originalPriceMonthly != null && (
                  <span className="pricing-price-original">{formatMoney(plan.originalPriceMonthly)}</span>
                )}
                <strong>{plan.priceMonthly === 0 ? 'Miễn phí' : formatMoney(plan.priceMonthly)}</strong>
                <span>{plan.priceMonthly === 0 ? '' : '/ tháng'}</span>
              </div>
              {plan.trialDays != null && (
                <div className="pricing-trial-badge">
                  <i className="bx bx-check-shield" /> Dùng thử {plan.trialDays} ngày miễn phí
                </div>
              )}

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
