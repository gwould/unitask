import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Vui long nhap day du email va mat khau.');
      return;
    }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/dashboard');
    } else {
      setError('Email hoac mat khau khong dung.');
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo-icon"><i className="bx bxs-graduation" /></span>
            <h1>Chào mừng trở lại</h1>
            <p>Đăng nhập vào UniTask để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {error && <div className="auth-error"><i className="bx bx-error" /> {error}</div>}

            <div className="form-group">
              <label>Email</label>
              <div className="input-icon-wrap">
                <span className="input-icon"><i className="bx bx-envelope" /></span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-icon-wrap">
                <span className="input-icon"><i className="bx bx-lock-alt" /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="input-with-icon"
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập →'
              )}
            </button>
          </form>

          <div className="auth-divider">hoặc</div>

          <div className="auth-features">
            <div className="auth-feature-item">
              <span><i className="bx bx-rocket" /></span>
              <span>Tìm việc micro-job phù hợp</span>
            </div>
            <div className="auth-feature-item">
              <span><i className="bx bx-wallet" /></span>
              <span>Nhận thanh toán an toàn qua escrow</span>
            </div>
            <div className="auth-feature-item">
              <span><i className="bx bx-bar-chart-alt-2" /></span>
              <span>Xây CV thực tế từ dự án thật</span>
            </div>
          </div>

          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
