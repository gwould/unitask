import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── DATA ────────────────────────────────────────── */

const STATS = [
  { target: 12000, suffix: '+', label: 'Sinh viên đã tham gia', icon: '👨‍🎓' },
  { target: 350,   suffix: '+', label: 'Doanh nghiệp đối tác', icon: '🏢' },
  { target: 5600,  suffix: '+', label: 'Job đã hoàn thành',    icon: '✅' },
  { target: 98,    suffix: '%', label: 'Tỷ lệ hài lòng',      icon: '⭐' },
];

const TEAM = [
  { name: 'Trần Minh Quân', role: 'Founder & CEO', avatar: 'Q', gradient: 'linear-gradient(135deg,#5B4FFF,#7C72FF)', desc: 'Cựu sinh viên BK, 5 năm kinh nghiệm trong EdTech & Marketplace.', bio: 'Minh Quân tốt nghiệp ĐH Bách Khoa TP.HCM chuyên ngành CNTT. Anh từng làm việc tại Shopee và Tiki trước khi thành lập UniTask với mục tiêu kết nối sinh viên với cơ hội việc làm thực tế.' },
  { name: 'Nguyễn Thị Mai', role: 'CTO', avatar: 'M', gradient: 'linear-gradient(135deg,#00D4AA,#00A882)', desc: 'Full-stack Engineer, đam mê giải quyết bài toán kết nối sinh viên - doanh nghiệp.', bio: 'Mai có hơn 7 năm kinh nghiệm phát triển phần mềm tại các startup công nghệ. Cô dẫn dắt team kỹ thuật xây dựng nền tảng UniTask với kiến trúc microservices hiện đại.' },
  { name: 'Lê Hoàng Anh', role: 'Head of Product', avatar: 'A', gradient: 'linear-gradient(135deg,#FF6B35,#FF4D6B)', desc: 'Product Designer với kinh nghiệm từ các startup Y Combinator.', bio: 'Hoàng Anh từng tham gia chương trình Y Combinator 2022 và có kinh nghiệm thiết kế sản phẩm tại Silicon Valley. Anh đảm bảo mỗi tính năng trên UniTask đều hướng tới trải nghiệm người dùng tốt nhất.' },
  { name: 'Phạm Đức Long', role: 'Head of Operations', avatar: 'L', gradient: 'linear-gradient(135deg,#FFB340,#FF8E3C)', desc: 'Chuyên gia vận hành marketplace, đảm bảo chất lượng từng giao dịch.', bio: 'Đức Long chuyên về vận hành marketplace với kinh nghiệm từ Grab và Be. Anh xây dựng quy trình chất lượng đảm bảo mọi giao dịch trên UniTask đều an toàn và minh bạch.' },
];

const VALUES = [
  { icon: '🎯', title: 'Thực chiến, không lý thuyết', desc: 'Mỗi job trên UniTask đều là dự án thật, không phải bài tập mô phỏng.' },
  { icon: '🛡️', title: 'An toàn với Escrow', desc: 'Hệ thống giữ tiền đảm bảo sinh viên được trả công, doanh nghiệp nhận sản phẩm chất lượng.' },
  { icon: '🤝', title: 'Win-win cho cả hai bên', desc: 'Sinh viên có kinh nghiệm + thu nhập. Doanh nghiệp có nhân lực chất lượng giá hợp lý.' },
  { icon: '🚀', title: 'Nhanh chóng & Hiệu quả', desc: 'Smart Matching AI kết nối bạn với job/ứng viên phù hợp trong vài phút.' },
];

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
      <div className="about-stat-icon">{icon}</div>
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
      <div className="about-value-icon">{value.icon}</div>
      <h3>{value.title}</h3>
      <p>{value.desc}</p>
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────────── */

export default function AboutPage() {
  const [ctaHover, setCtaHover] = useState<'student' | 'business' | null>(null);

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
          {STATS.map((s, i) => (
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
              UniTask ra đời để giải quyết bài toán này — tạo cầu nối giữa sinh viên đang học và doanh nghiệp
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
            Email: <button className="btn-link" onClick={() => handleCopy('contact@unitask.vn')} type="button" title="Copy email">contact@unitask.vn 📋</button>
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
              🎓 Đăng ký Sinh viên
              {ctaHover === 'student' && <span className="cta-hint">Miễn phí 100%</span>}
            </Link>
            <Link
              to="/register"
              className="btn btn-ghost"
              onMouseEnter={() => setCtaHover('business')}
              onMouseLeave={() => setCtaHover(null)}
            >
              🏢 Đăng ký Doanh nghiệp
              {ctaHover === 'business' && <span className="cta-hint">3 job miễn phí</span>}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
