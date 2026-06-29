import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Trang nhập mã OTP xác thực email (kích hoạt tài khoản sinh viên mới).
 * Nhận email qua location.state khi vừa đăng ký.
 */
export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendOtp } = useAuth();

  const stateEmail = (location.state as { email?: string } | null)?.email ?? '';
  const [email, setEmail] = useState(stateEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setInfo('');
      if (!email || code.trim().length !== 6) {
        setError('Vui lòng nhập email và mã OTP gồm 6 chữ số.');
        return;
      }
      setLoading(true);
      try {
        await verifyEmail(email.trim(), code.trim());
        navigate('/dashboard');
      } catch {
        setError('Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại hoặc gửi lại mã.');
        setLoading(false);
      }
    },
    [email, code, verifyEmail, navigate],
  );

  const handleResend = useCallback(async () => {
    if (!email) {
      setError('Vui lòng nhập email để gửi lại mã.');
      return;
    }
    setError('');
    try {
      await resendOtp(email.trim());
      setInfo('Đã gửi lại mã OTP. Vui lòng kiểm tra hộp thư (kể cả mục Spam).');
      setCooldown(30);
    } catch {
      setInfo('Đã gửi yêu cầu. Vui lòng kiểm tra hộp thư.');
      setCooldown(30);
    }
  }, [email, resendOtp]);

  return (
    <section className="page-pending">
      <div
        className="container"
        style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}
      >
        <div className="glass" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '44px 40px', borderRadius: 'var(--r20)' }}>
          <div
            style={{
              width: 72, height: 72, margin: '0 auto 22px', borderRadius: '50%',
              background: 'rgba(124,58,237,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
            }}
          >
            ✉️
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 10, color: 'var(--t0)' }}>
            Xác thực email
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--t2)', marginBottom: 24 }}>
            Chúng tôi đã gửi mã OTP gồm 6 chữ số tới email của bạn. Nhập mã để kích hoạt tài khoản.
          </p>

          <form onSubmit={handleVerify}>
            {!stateEmail && (
              <input
                type="email"
                placeholder="Email đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                autoComplete="email"
              />
            )}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Nhập mã OTP (6 chữ số)"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: 22, fontWeight: 700 }}
              autoFocus
            />

            {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}
            {info && <div style={{ color: 'var(--teal)', fontSize: 13, marginBottom: 12 }}>{info}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác thực & kích hoạt'}
            </button>
          </form>

          <div style={{ marginTop: 20, fontSize: 14, color: 'var(--t2)' }}>
            Chưa nhận được mã?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              style={{
                background: 'none', border: 'none', color: cooldown > 0 ? 'var(--t3)' : 'var(--pl)',
                fontWeight: 600, cursor: cooldown > 0 ? 'default' : 'pointer', font: 'inherit',
              }}
            >
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại mã'}
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <Link to="/" style={{ fontSize: 13, color: 'var(--t3)' }}>← Quay lại trang chính</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  marginBottom: 14,
  borderRadius: 'var(--r10)',
  border: '1px solid var(--bd)',
  background: 'var(--s2)',
  color: 'var(--t1)',
  fontSize: 15,
};
