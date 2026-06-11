import { useState } from 'react';

interface PricingPlan {
  name: string;
  icon: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  popular?: boolean;
  gradient?: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Starter',
    icon: '🚀',
    price: 'Miễn phí',
    period: '',
    desc: 'Phù hợp cho doanh nghiệp nhỏ muốn thử nghiệm',
    features: [
      'Đăng tối đa 3 job/tháng',
      'Xem 15 hồ sơ ứng viên',
      'Hỗ trợ qua email',
      'Escrow bảo vệ thanh toán',
      'Dashboard cơ bản',
    ],
    cta: 'Bắt đầu miễn phí',
  },
  {
    name: 'Growth',
    icon: '⚡',
    price: '499.000 ₫',
    period: '/tháng',
    desc: 'Cho startup & SME đang mở rộng quy mô',
    features: [
      'Đăng tối đa 15 job/tháng',
      'Xem không giới hạn hồ sơ',
      'Smart Matching ứng viên',
      'Escrow bảo vệ thanh toán',
      'Hỗ trợ ưu tiên 24/7',
      'Badge "Nhà tuyển dụng uy tín"',
      'Analytics & báo cáo chi tiết',
    ],
    cta: 'Dùng thử 14 ngày',
    popular: true,
    gradient: 'linear-gradient(135deg,rgba(91,79,255,.12),rgba(0,212,170,.08))',
  },
  {
    name: 'Pro',
    icon: '👑',
    price: '999.000 ₫',
    period: '/tháng',
    desc: 'Giải pháp toàn diện cho doanh nghiệp lớn',
    features: [
      'Đăng không giới hạn job',
      'Xem không giới hạn hồ sơ',
      'Smart Matching nâng cao + AI',
      'Escrow bảo vệ thanh toán',
      'Account Manager riêng',
      'Badge "Top Employer"',
      'API tích hợp hệ thống HR',
      'Custom branding trang tuyển dụng',
    ],
    cta: 'Liên hệ tư vấn',
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Bảng giá</div>
          <h2 className="section-title">Đầu tư thông minh cho tuyển dụng</h2>
          <p className="section-sub">
            Sinh viên luôn miễn phí. Doanh nghiệp chọn gói phù hợp với nhu cầu
          </p>
        </div>
        <div className="pricing-toggle fade-up">
          <span className={!annual ? 'active' : ''}>Hàng tháng</span>
          <button
            className={`toggle-switch${annual ? ' on' : ''}`}
            onClick={() => setAnnual(!annual)}
          >
            <div className="toggle-knob" />
          </button>
          <span className={annual ? 'active' : ''}>
            Hàng năm <span className="save-badge">Tiết kiệm 20%</span>
          </span>
        </div>
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card fade-up${plan.popular ? ' popular' : ''}`}
              style={plan.gradient ? { background: plan.gradient } : undefined}
            >
              {plan.popular && <div className="popular-badge">🔥 Phổ biến nhất</div>}
              <div className="pricing-icon">{plan.icon}</div>
              <h3 className="pricing-name">{plan.name}</h3>
              <p className="pricing-desc">{plan.desc}</p>
              <div className="pricing-price">
                <span className="price-amount">
                  {plan.price === 'Miễn phí'
                    ? plan.price
                    : annual
                      ? (parseInt(plan.price.replace(/\D/g, '')) * 0.8).toLocaleString('vi-VN') + ' ₫'
                      : plan.price}
                </span>
                {plan.period && <span className="price-period">{plan.period}</span>}
              </div>
              <ul className="pricing-features">
                {plan.features.map((feat, j) => (
                  <li key={j}>
                    <span className="check">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <button className={`btn ${plan.popular ? 'btn-accent' : 'btn-ghost'}`} style={{ width: '100%', justifyContent: 'center' }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
