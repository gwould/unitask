import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { serviceRegistry } from '../services';

/* ─── DATA ────────────────────────────────────────── */

const STATS = [
  { target: 12000, suffix: '+', label: 'Sinh viên đã tham gia', icon: 'bxs-graduation' },
  { target: 350,   suffix: '+', label: 'Doanh nghiệp đối tác', icon: 'bxs-building-house' },
  { target: 5600,  suffix: '+', label: 'Job đã hoàn thành',    icon: 'bx-check-circle' },
  { target: 98,    suffix: '%', label: 'Tỷ lệ hài lòng',      icon: 'bxs-star' },
];

const TEAM = [
  { name: 'Ngô Minh Hạnh Dung', role: 'Founder & CEO', avatar: 'D', gradient: 'linear-gradient(135deg,#7C3AED,#A78BFA)', desc: 'Người sáng lập UniTask, định hướng chiến lược và phát triển nền tảng.', bio: 'Hạnh Dung là người khởi xướng và sáng lập UniTask với mục tiêu kết nối sinh viên với cơ hội việc làm thực tế. Cô dẫn dắt toàn bộ định hướng chiến lược và phát triển của công ty.' },
  { name: 'Nguyễn Duy Lương', role: 'CTO', avatar: 'L', gradient: 'linear-gradient(135deg,#10B981,#059669)', desc: 'Phụ trách công nghệ, xây dựng và vận hành hệ thống kỹ thuật của UniTask.', bio: 'Duy Lương chịu trách nhiệm về kiến trúc kỹ thuật và đội ngũ phát triển, đảm bảo nền tảng UniTask hoạt động ổn định, an toàn và mở rộng được.' },
  { name: 'Đinh Gia Huy', role: 'CPO', avatar: 'H', gradient: 'linear-gradient(135deg,#F97316,#F43F5E)', desc: 'Phụ trách sản phẩm, đảm bảo trải nghiệm người dùng tốt nhất trên UniTask.', bio: 'Gia Huy dẫn dắt định hướng sản phẩm của UniTask, từ nghiên cứu nhu cầu người dùng đến thiết kế và phát triển tính năng mới.' },
  { name: 'Vũ Thị Lan Anh', role: 'CMO', avatar: 'A', gradient: 'linear-gradient(135deg,#FFB340,#FF8E3C)', desc: 'Phụ trách marketing, xây dựng thương hiệu và phát triển cộng đồng UniTask.', bio: 'Lan Anh chịu trách nhiệm về chiến lược marketing và truyền thông, giúp UniTask tiếp cận sinh viên và doanh nghiệp trên toàn quốc.' },
  { name: 'Lê Thị Hà Trang', role: 'CSO', avatar: 'T', gradient: 'linear-gradient(135deg,#3B82F6,#06B6D4)', desc: 'Phụ trách chiến lược phát triển và mở rộng kinh doanh của UniTask.', bio: 'Hà Trang xây dựng và triển khai các chiến lược phát triển dài hạn, mở rộng quy mô và quan hệ đối tác cho UniTask.' },
  { name: 'Bùi Thị Tuyết Ngân', role: 'COO', avatar: 'N', gradient: 'linear-gradient(135deg,#EC4899,#8B5CF6)', desc: 'Phụ trách vận hành, đảm bảo chất lượng và hiệu quả hoạt động hàng ngày.', bio: 'Tuyết Ngân quản lý vận hành tổng thể của UniTask, đảm bảo mọi quy trình từ tuyển dụng đến giao dịch đều diễn ra suôn sẻ và minh bạch.' },
];

const VALUES = [
  { icon: 'bx-target-lock', title: 'Thực chiến, không lý thuyết', desc: 'Mỗi job trên UniTask đều là dự án thật, không phải bài tập mô phỏng.' },
  { icon: 'bx-shield-quarter', title: 'An toàn với Escrow', desc: 'Hệ thống giữ tiền đảm bảo sinh viên được trả công, doanh nghiệp nhận sản phẩm chất lượng.' },
  { icon: 'bx-handshake', title: 'Win-win cho cả hai bên', desc: 'Sinh viên có kinh nghiệm + thu nhập. Doanh nghiệp có nhân lực chất lượng giá hợp lý.' },
  { icon: 'bx-rocket', title: 'Nhanh chóng & Hiệu quả', desc: 'Hệ thống tự động kết nối bạn với job/ứng viên phù hợp trong vài phút.' },
];

const SUBSCRIPTION_PLANS = [
  {
    key: 'free-starter',
    name: 'Free Starter',
    price: '0 đ',
    period: '/ tháng',
    badge: 'Khởi động',
    features: [
      '5 job/tháng',
      'Hiển thị cơ bản trong kết quả tìm kiếm',
      'Gợi ý việc làm phù hợp',
      'Hỗ trợ email trong giờ hành chính',
    ],
    cta: 'Dùng miễn phí',
    highlight: false,
  },
  {
    key: 'starter',
    name: 'Starter Package',
    price: '299.000 đ',
    period: '/ tháng',
    badge: 'Linh hoạt',
    features: [
      '30 job/tháng',
      'Ưu tiên hiển thị bài đăng',
      'Gợi ý ứng viên phù hợp',
      'Giảm phí giao dịch',
      'Thống kê hiệu quả tuyển dụng',
    ],
    cta: 'Nâng cấp Starter',
    highlight: true,
  },
  {
    key: 'growth',
    name: 'Growth Package',
    price: '799.000 đ',
    period: '/ tháng',
    badge: 'Không giới hạn',
    features: [
      'Job không giới hạn',
      'Ưu tiên hiển thị bài đăng',
      'Gợi ý ứng viên phù hợp',
      'Giảm phí giao dịch',
      'Thống kê hiệu quả tuyển dụng',
    ],
    cta: 'Nâng cấp Growth',
    highlight: false,
  },
] as const;

/* ─── ANIMATED COUNTER HOOK ───────────────────────── */

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 40;
    const stepDuration = duration / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Ease-out effect
      const progress = step / steps;
      current = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      setCount(current);
      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

/* ─── STAT CARD ───────────────────────────────────── */

function StatCard({ target, suffix, label, icon }: typeof STATS[0]) {
  const { count, ref } = useCountUp(target);
  const formatted = count >= 1000
    ? new Intl.NumberFormat('en').format(count)
    : String(count);

  return (
    <div ref={ref} className="about-stat-card">
      <div className="about-stat-icon"><i className={`bx ${icon}`} /></div>
      <div className="about-stat-num">{formatted}{suffix}</div>
      <div className="about-stat-label">{label}</div>
    </div>
  );
}

/* ─── TEAM CARD ───────────────────────────────────── */

function TeamCard({ member }: { member: typeof TEAM[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`about-team-card${expanded ? ' expanded' : ''}`}>
      <div className="about-team-avatar" style={{ background: member.gradient }}>
        {member.avatar}
      </div>
      <h3>{member.name}</h3>
      <div className="about-team-role">{member.role}</div>
      <p>{member.desc}</p>
      <button
        className="btn btn-ghost btn-sm about-team-toggle"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        {expanded ? '▲ Thu gọn' : '▼ Xem thêm'}
      </button>
      <div className={`about-team-bio${expanded ? ' show' : ''}`}>
        <p>{member.bio}</p>
      </div>
    </div>
  );
}

/* ─── VALUE CARD ──────────────────────────────────── */

function ValueCard({ value, index }: { value: typeof VALUES[0]; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="about-value-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
      }}
    >
      <div className="about-value-icon"><i className={`bx ${value.icon}`} /></div>
      <h3>{value.title}</h3>
      <p>{value.desc}</p>
    </div>
  );
}

function PlanCard({ plan }: { plan: (typeof SUBSCRIPTION_PLANS)[number] }) {
  const { user } = useAuth();

  // Đã đăng nhập → đi thẳng tới trang thanh toán gói
  const target = !user ? '/register' : plan.key === 'free-starter' ? '/dashboard' : `/upgrade/${plan.key}`;
  const label = !user || plan.key !== 'free-starter' ? plan.cta : 'Gói hiện tại của bạn';

  return (
    <div className={`about-plan-card${plan.highlight ? ' featured' : ''}`}>
      <div className="about-plan-top">
        <div>
          <div className="about-plan-name">{plan.name}</div>
          <div className="about-plan-badge">{plan.badge}</div>
        </div>
        {plan.highlight && <span className="about-plan-hot">Recommended</span>}
      </div>
      <div className="about-plan-price">
        <strong>{plan.price}</strong>
        <span>{plan.period}</span>
      </div>
      <ul className="about-plan-features">
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <Link to={target} className={`btn ${plan.highlight ? 'btn-primary' : 'btn-ghost'}`} style={{ width: '100%', justifyContent: 'center' }}>
        {label}
      </Link>
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────────── */

export default function AboutPage() {
  const [ctaHover, setCtaHover] = useState<'student' | 'business' | null>(null);

  // Số liệu thật từ API thay cho con số fix cứng (tránh cảm giác "ảo").
  const [platform, setPlatform] = useState({ totalStudents: 0, totalBusinesses: 0, totalJobs: 0 });
  useEffect(() => {
    let cancelled = false;
    serviceRegistry.site.getPlatformStats()
      .then((s) => { if (!cancelled) setPlatform(s); })
      .catch(() => { /* giữ 0 nếu lỗi */ });
    return () => { cancelled = true; };
  }, []);

  const stats = [
    { target: platform.totalStudents, suffix: '+', label: 'Sinh viên đã tham gia', icon: 'bxs-graduation' },
    { target: platform.totalBusinesses, suffix: '+', label: 'Doanh nghiệp đối tác', icon: 'bxs-building-house' },
    { target: platform.totalJobs, suffix: '+', label: 'Việc làm đang mở', icon: 'bx-check-circle' },
    { target: 98, suffix: '%', label: 'Tỷ lệ hài lòng', icon: 'bxs-star' },
  ];

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  return (
    <section className="page-about">
      <div className="container">
        {/* hero */}
        <div className="about-hero fade-up">
          <div className="section-eyebrow">Về UniTask</div>
          <h1>Kết nối <span className="highlight">Sinh viên</span> với <span className="accent-word">Startup & SME</span></h1>
          <p className="about-hero-sub">
            UniTask là nền tảng micro-job đầu tiên tại Việt Nam,
            được thiết kế riêng cho sinh viên muốn tích lũy kinh nghiệm thực tế
            và doanh nghiệp startup/SME cần nhân lực trẻ chất lượng cao.
          </p>
        </div>

        {/* animated stats */}
        <div className="about-stats fade-up">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* mission */}
        <div className="about-section fade-up">
          <h2>🎯 Sứ mệnh của chúng tôi</h2>
          <div className="about-mission">
            <p>
              Mỗi năm, hàng trăm nghìn sinh viên Việt Nam tốt nghiệp mà <strong>không có kinh nghiệm thực tế</strong>.
              Trong khi đó, các Startup & SME rất khó tìm được <strong>nhân lực trẻ chất lượng với chi phí hợp lý</strong>.
            </p>
            <p>
              UniTask ra đời để giải quyết bài toán này: tạo cầu nối giữa sinh viên đang học và doanh nghiệp
              cần người thực hiện các công việc ngắn hạn, chuyên môn. Sinh viên tích lũy được kinh nghiệm,
              thu nhập và mối quan hệ; doanh nghiệp có sản phẩm chất lượng đúng deadline.
            </p>
          </div>
        </div>

        {/* values with staggered animation */}
        <div className="about-section">
          <h2 className="fade-up">💡 Giá trị cốt lõi</h2>
          <div className="about-values-grid">
            {VALUES.map((v, i) => (
              <ValueCard key={i} value={v} index={i} />
            ))}
          </div>
        </div>

        <div id="pricing" className="about-section fade-up">
          <h2>💼 Gói đăng ký doanh nghiệp</h2>
          <p className="about-plan-sub">
            Chọn gói phù hợp với nhu cầu tuyển dụng. Có thể nâng cấp hoặc hạ cấp linh hoạt mỗi tháng.
          </p>
          <div className="about-plan-grid">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PlanCard key={plan.key} plan={plan} />
            ))}
          </div>
        </div>

        {/* team with expand */}
        <div className="about-section fade-up">
          <h2>👥 Đội ngũ sáng lập</h2>
          <div className="about-team-grid">
            {TEAM.map((t, i) => (
              <TeamCard key={i} member={t} />
            ))}
          </div>
        </div>

        {/* contact CTA */}
        <div className="about-section fade-up" style={{ textAlign: 'center' }}>
          <h3>📬 Liên hệ nhanh</h3>
          <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>
            Email: <button className="btn-link" onClick={() => handleCopy('contact@unitask.io.vn')} type="button" title="Copy email">contact@unitask.io.vn 📋</button>
          </p>
        </div>

        {/* CTA */}
        <div className="about-cta fade-up">
          <h2>Sẵn sàng tham gia?</h2>
          <p>Hãy trở thành một phần của hệ sinh thái UniTask ngay hôm nay.</p>
          <div className="about-cta-btns">
            <Link
              to="/register"
              className="btn btn-accent"
              onMouseEnter={() => setCtaHover('student')}
              onMouseLeave={() => setCtaHover(null)}
            >
              <i className="bx bxs-graduation" /> Đăng ký Sinh viên
              {ctaHover === 'student' && <span className="cta-hint">Miễn phí 100%</span>}
            </Link>
            <Link
              to="/register"
              className="btn btn-ghost"
              onMouseEnter={() => setCtaHover('business')}
              onMouseLeave={() => setCtaHover(null)}
            >
              <i className="bx bxs-building-house" /> Đăng ký Doanh nghiệp
              {ctaHover === 'business' && <span className="cta-hint">5 job miễn phí</span>}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
