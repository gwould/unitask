import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    const ok = await register({
      name,
      email,
      password,
      role,
      university: role === 'student' ? university : undefined,
      major: role === 'student' ? major : undefined,
      companyName: role === 'business' ? companyName : undefined,
    });
    setLoading(false);
    if (ok) {
      navigate('/dashboard');
    } else {
      setError('Email đã tồn tại. Vui lòng dùng email khác.');
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo-icon"><i className="bx bx-rocket" /></span>
            <h1>Tạo tài khoản</h1>
            <p>Tham gia cộng đồng UniTask — hoàn toàn miễn phí</p>
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
                <span className="field-hint field-hint-ok">✓ Đủ độ dài</span>
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
                <label>Tên công ty / tổ chức</label>
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
                'Đăng ký miễn phí →'
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
