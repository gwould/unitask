import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const STATS = [
  { num: '12,000+', label: 'Sinh vien' },
  { num: '850+', label: 'Doanh nghiep' },
  { num: '5,200+', label: 'Job hoan thanh' },
  { num: '4.9/5', label: 'Danh gia' },
];

const STUDENT_BENEFITS = [
  { icon: '💰', title: 'Kiem tien tu ky nang', desc: 'Nhan viec thuc te tu doanh nghiep, lam tu nha hoac quan cafe. Thu nhap tu 500K - 10 trieu/thang.' },
  { icon: '📋', title: 'Xay CV that', desc: 'Moi project hoan thanh tu dong cap nhat vao ho so so. CV cua ban se khac biet khi di xin viec.' },
  { icon: '🛡️', title: '100% an toan', desc: 'Tien duoc giu trong Escrow truoc khi ban bat dau. Lam xong la nhan tien — khong so bi quit.' },
];

const BUSINESS_BENEFITS = [
  { icon: '⚡', title: 'Tuyen nhanh trong 24h', desc: 'Dang job — nhan don ung tuyen trong vai gio. Khong can phong van phuc tap cho micro-task.' },
  { icon: '🎓', title: 'Nhan luc chat luong', desc: 'Sinh vien da xac thuc, co ky nang thuc te. He thong goi y ung vien phu hop voi yeu cau cua ban.' },
  { icon: '💳', title: 'Chi tra linh hoat', desc: 'Chi tra khi hai long voi san pham. Escrow bao ve ca hai ben. Ho tro MoMo, chuyen khoan.' },
];

const TESTIMONIALS = [
  { text: 'Minh kiem duoc 3 trieu dau tien tu UniTask chi sau 2 tuan. Job thiet ke logo cho startup, lam 5 ngay la xong.', name: 'Minh Khoa', role: 'SV nam 3 · Thiet ke Do hoa', avatar: 'K', gradient: 'linear-gradient(135deg,#7C3AED,#A78BFA)' },
  { text: 'Tuyen 1 ban sinh vien viet 10 bai SEO, chi 1.6 trieu ma chat luong tot hon agency. Se quay lai UniTask.', name: 'Thanh Tung', role: 'Co-founder BrandSpace', avatar: 'T', gradient: 'linear-gradient(135deg,#10B981,#059669)' },
  { text: 'Escrow la tinh nang tot nhat. Minh biet tien da co san truoc khi bat dau lam, nen rat yen tam.', name: 'Thu Hang', role: 'SV nam 4 · Ngon ngu Anh', avatar: 'H', gradient: 'linear-gradient(135deg,#F97316,#F43F5E)' },
];

const STEPS = [
  { num: '1', title: 'Dang ky mien phi', desc: '30 giay — chi can email', icon: '📝' },
  { num: '2', title: 'Tim & ung tuyen', desc: 'He thong goi y job phu hop', icon: '🎯' },
  { num: '3', title: 'Lam viec & nop bai', desc: 'Lam tu bat cu dau, theo deadline', icon: '💻' },
  { num: '4', title: 'Nhan tien', desc: 'Rut ve MoMo hoac ngan hang', icon: '💰' },
];

export default function LandingPage() {
  const [searchParams] = useSearchParams();
  const target = searchParams.get('for') || 'student';
  const [tab, setTab] = useState<'student' | 'business'>(target === 'business' ? 'business' : 'student');

  const isStudent = tab === 'student';
  const benefits = isStudent ? STUDENT_BENEFITS : BUSINESS_BENEFITS;

  return (
    <div className="landing-ad">
      {/* Minimal top bar */}
      <header className="landing-topbar">
        <Link to="/" className="nav-logo" style={{ fontSize: 22 }}>
          Uni<span>Task</span><div className="dot" />
        </Link>
        <Link to="/register" className="btn btn-primary btn-sm">
          Dang ky mien phi
        </Link>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg" aria-hidden />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="landing-hero-content">
            {isStudent ? (
              <>
                <div className="landing-badge">Mien phi cho sinh vien</div>
                <h1>Sinh vien lam them<br /><span className="highlight">kiem tien that</span></h1>
                <p>Nhan job tu doanh nghiep, lam tu nha, thanh toan an toan qua Escrow. Khong can kinh nghiem — chi can ky nang va su san sang.</p>
              </>
            ) : (
              <>
                <div className="landing-badge">Tu 0d/thang</div>
                <h1>Tuyen sinh vien<br /><span className="highlight">nhanh & re</span></h1>
                <p>Dang micro-task, nhan ung vien trong vai gio. Chi tra khi hai long. Tiet kiem 70% so voi agency truyen thong.</p>
              </>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
              <Link to="/register" className="btn btn-accent" style={{ fontSize: 16, padding: '14px 32px' }}>
                {isStudent ? 'Bat dau kiem tien' : 'Dang viec ngay'} →
              </Link>
              <Link to="/jobs" className="btn btn-ghost" style={{ fontSize: 16, padding: '14px 32px' }}>
                Xem job dang tuyen
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="landing-stats">
            {STATS.map((s, i) => (
              <div key={i} className="landing-stat">
                <div className="landing-stat-num">{s.num}</div>
                <div className="landing-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab switch */}
      <section className="landing-section">
        <div className="container">
          <div className="how-tabs" style={{ marginBottom: 40 }}>
            <button className={`how-tab${tab === 'student' ? ' active' : ''}`} onClick={() => setTab('student')}>
              Toi la Sinh vien
            </button>
            <button className={`how-tab${tab === 'business' ? ' active' : ''}`} onClick={() => setTab('business')}>
              Toi la Doanh nghiep
            </button>
          </div>

          {/* Benefits */}
          <div className="landing-benefits">
            {benefits.map((b, i) => (
              <div key={i} className="landing-benefit-card">
                <div className="landing-benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — student only */}
      {isStudent && (
        <section className="landing-section" style={{ background: 'rgba(91,79,255,.04)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', fontSize: 28, marginBottom: 40 }}>Chi 4 buoc de bat dau</h2>
            <div className="landing-steps">
              {STEPS.map((s, i) => (
                <div key={i} className="landing-step">
                  <div className="landing-step-num">{s.icon}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                  {i < STEPS.length - 1 && <div className="landing-step-arrow" aria-hidden>→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social proof */}
      <section className="landing-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 28, marginBottom: 40 }}>Nguoi dung noi gi?</h2>
          <div className="landing-testimonials">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="landing-testi-card">
                <p>"{t.text}"</p>
                <div className="landing-testi-author">
                  <div className="testi-avatar" style={{ background: t.gradient }}>{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Escrow explainer */}
      <section className="landing-section" style={{ background: 'rgba(0,212,170,.04)' }}>
        <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>Tien cua ban duoc bao ve 100%</h2>
          <p style={{ color: 'var(--t2)', fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
            Moi giao dich tren UniTask deu su dung he thong <strong>Escrow</strong>. Tien luong duoc giu an toan truoc khi sinh vien bat dau lam viec. Chi giai ngan khi doanh nghiep xac nhan san pham dat yeu cau. Khong ai bi mat tien.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', fontSize: 14, color: 'var(--t2)' }}>
            <div>✅ Sinh vien: Lam xong la nhan tien</div>
            <div>✅ Doanh nghiep: Chi tra khi hai long</div>
            <div>✅ UniTask: Trung gian xu ly tranh chap</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-section landing-final-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, marginBottom: 12 }}>
            {isStudent ? 'San sang kiem tien tu ky nang cua ban?' : 'San sang tim nhan luc chat luong?'}
          </h2>
          <p style={{ color: 'var(--t2)', fontSize: 16, marginBottom: 32 }}>
            {isStudent
              ? 'Dang ky mien phi, nhan job dau tien trong hom nay.'
              : 'Dang viec mien phi, nhan ung vien trong vai gio.'}
          </p>
          <Link to="/register" className="btn btn-accent" style={{ fontSize: 18, padding: '16px 48px' }}>
            {isStudent ? 'Dang ky mien phi — 30 giay' : 'Bat dau dang viec mien phi'} →
          </Link>
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--t3)' }}>
            Khong can the tin dung · Khong cam ket · Huy bat cu luc nao
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '24px 0' }}>
          <span style={{ color: 'var(--t3)', fontSize: 13 }}>© 2026 UniTask. Nen tang viec lam cho sinh vien Viet Nam.</span>
          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <Link to="/about" style={{ color: 'var(--t3)' }}>Ve chung toi</Link>
            <Link to="/terms" style={{ color: 'var(--t3)' }}>Dieu khoan</Link>
            <Link to="/privacy" style={{ color: 'var(--t3)' }}>Bao mat</Link>
            <Link to="/contact" style={{ color: 'var(--t3)' }}>Lien he</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
