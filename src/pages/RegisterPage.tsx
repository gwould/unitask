import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'business' ? 'business' : 'student';
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);
    const result = await register({
      name,
      email,
      password,
      role,
      university: role === 'student' ? university : undefined,
      major: role === 'student' ? major : undefined,
      companyName: role === 'business' ? companyName : undefined,
    });
    setLoading(false);

    if (result === 'pending') {
      setPendingApproval(true);
    } else if (result === true) {
      navigate('/dashboard');
    } else {
      setError('Email đã tồn tại. Vui lòng dùng email khác.');
    }
  };

  if (pendingApproval) {
    return (
      <section className="auth-page">
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="pending-approval-icon">
              <i className="bx bx-time-five" />
            </div>
            <h1 className="pending-approval-title">Đang chờ phê duyệt</h1>
            <p className="pending-approval-desc">
              Tài khoản doanh nghiệp của bạn đã được tạo thành công và đang chờ admin xem xét phê duyệt.
            </p>
            <div className="pending-approval-info">
              <div className="pending-info-row">
                <i className="bx bx-envelope" />
                <span>{email}</span>
              </div>
              <div className="pending-info-row">
                <i className="bx bxs-building-house" />
                <span>{companyName || name}</span>
              </div>
            </div>
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
              <i className="bx bx-info-circle" /> Bạn sẽ nhận được thông báo khi tài khoản được phê duyệt. Quá trình này thường mất 1-2 ngày làm việc.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
              <i className="bx bx-log-in" style={{ marginRight: 6 }} /> Quay lại đăng nhập
            </Link>
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
            <span className="auth-logo-icon"><i className="bx bx-rocket" /></span>
            <h1>Tạo tài khoản</h1>
            <p>Tham gia cộng đồng UniTask, hoàn toàn miễn phí</p>
          </div>

          {/* role toggle */}
          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn${role === 'student' ? ' active' : ''}`}
              onClick={() => setRole('student')}
            >
              <i className="bx bxs-graduation" /> Sinh viên
            </button>
            <button
              type="button"
              className={`role-btn${role === 'business' ? ' active' : ''}`}
              onClick={() => setRole('business')}
            >
              <i className="bx bxs-building-house" /> Doanh nghiệp
            </button>
          </div>

          {role === 'business' && (
            <div className="auth-notice">
              <i className="bx bx-info-circle" />
              <span>Tài khoản doanh nghiệp cần được admin phê duyệt trước khi sử dụng.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {error && <div className="auth-error"><i className="bx bx-error" /> {error}</div>}

            <div className="form-group">
              <label>Họ và tên *</label>
              <div className="input-icon-wrap">
                <span className="input-icon"><i className="bx bx-user" /></span>
                <input
                  type="text"
                  placeholder={role === 'student' ? 'Nguyễn Văn A' : 'Trần Quản lý'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email *</label>
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
              <label>Mật khẩu *</label>
              <div className="input-icon-wrap">
                <span className="input-icon"><i className="bx bx-lock-alt" /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
              {password.length > 0 && password.length < 6 && (
                <span className="field-hint field-hint-warn">Cần ít nhất 6 ký tự ({6 - password.length} nữa)</span>
              )}
              {password.length >= 6 && (
                <span className="field-hint field-hint-ok">Đủ độ dài</span>
              )}
            </div>

            {role === 'student' && (
              <>
                <div className="form-group">
                  <label>Trường đại học</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><i className="bx bxs-school" /></span>
                    <input
                      type="text"
                      placeholder="VD: Đại học Bách Khoa TP.HCM"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="input-with-icon"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Chuyên ngành</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><i className="bx bx-book-open" /></span>
                    <input
                      type="text"
                      placeholder="VD: Công nghệ Thông tin"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="input-with-icon"
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'business' && (
              <div className="form-group">
                <label>Tên công ty / tổ chức *</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><i className="bx bxs-building-house" /></span>
                  <input
                    type="text"
                    placeholder="VD: TechNova VN"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input-with-icon"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Đang tạo tài khoản...
                </>
              ) : (
                role === 'business' ? 'Gửi yêu cầu đăng ký' : 'Đăng ký miễn phí'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
