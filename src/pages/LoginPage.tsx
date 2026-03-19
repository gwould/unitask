import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/dashboard');
    } else {
      setError('Email hoặc mật khẩu không đúng.');
    }
  };

  const fillDemo = (role: UserRole) => {
    if (role === 'student') {
      setEmail('student@demo.com');
      setPassword('demo123');
    } else if (role === 'business') {
      setEmail('business@demo.com');
      setPassword('demo123');
    } else {
      setEmail('admin@demo.com');
      setPassword('demo123');
    }
    setError('');
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Đăng nhập</h1>
            <p>Chào mừng bạn quay lại UniTask</p>
          </div>

          {/* Demo quick-fill */}
          <div className="demo-accounts">
            <span className="demo-label">🚀 Tài khoản demo:</span>
            <button type="button" className="demo-btn" onClick={() => fillDemo('student')}>
              👨‍🎓 Sinh viên
            </button>
            <button type="button" className="demo-btn" onClick={() => fillDemo('business')}>
              🏢 Doanh nghiệp
            </button>
            <button type="button" className="demo-btn" onClick={() => fillDemo('admin')}>
              🛡️ Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
            </button>
          </form>
          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
