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
              👨‍🎓 Sinh viên
            </button>
            <button
              type="button"
              className={`role-btn${role === 'business' ? ' active' : ''}`}
              onClick={() => setRole('business')}
            >
              🏢 Doanh nghiệp
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                placeholder={role === 'student' ? 'Nguyễn Văn A' : 'Trần Quản lý'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu *</label>
              <input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {role === 'student' && (
              <>
                <div className="form-group">
                  <label>Trường đại học</label>
                  <input
                    type="text"
                    placeholder="VD: Đại học Bách Khoa TP.HCM"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Chuyên ngành</label>
                  <input
                    type="text"
                    placeholder="VD: Công nghệ Thông tin"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                </div>
              </>
            )}

            {role === 'business' && (
              <div className="form-group">
                <label>Tên công ty / tổ chức</label>
                <input
                  type="text"
                  placeholder="VD: TechNova VN"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký miễn phí →'}
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
