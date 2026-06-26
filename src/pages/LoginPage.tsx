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
  const [pendingApproval, setPendingApproval] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Vui long nhap day du email va mat khau.');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result === 'pending') {
      setPendingApproval(true);
    } else if (result) {
      navigate('/dashboard');
    } else {
      setError('Email hoac mat khau khong dung.');
    }
  };

  if (pendingApproval) {
    return (
      <section className="auth-page">
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="pending-approval-icon"><i className="bx bx-time-five" /></div>
            <h1 className="pending-approval-title">Tài khoản đang chờ phê duyệt</h1>
            <p className="pending-approval-desc">
              Tài khoản doanh nghiệp của bạn đang được admin xem xét. Bạn sẽ nhận được thông báo khi được phê duyệt.
            </p>
            <div className="pending-approval-steps">
              <div className="pending-step">
                <div className="pending-step-num done">1</div>
                <span>Đăng ký tài khoản</span>
              </div>
              <div className="pending-step-connector" />
              <div className="pending-step">
                <div className="pending-step-num active">2</div>
                <span>Admin xem xét</span>
              </div>
              <div className="pending-step-connector" />
              <div className="pending-step">
                <div className="pending-step-num">3</div>
                <span>Kích hoạt tài khoản</span>
              </div>
            </div>
            <p className="pending-approval-note">
              <i className="bx bx-info-circle" /> Quá trình phê duyệt thường mất 1-2 ngày làm việc.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setPendingApproval(false)}>
              <i className="bx bx-arrow-back" style={{ marginRight: 6 }} /> Quay lại đăng nhập
            </button>
          </div>
        </div>
      </section>
    );
  }

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
