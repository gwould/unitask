import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

export default function AuthPage() {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname === '/register');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [role, setRole] = useState<UserRole>('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoginLoading(true);
    const ok = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (ok) navigate('/dashboard');
    else setLoginError('Email hoặc mật khẩu không đúng.');
  }, [loginEmail, loginPassword, login, navigate]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName || !regEmail || !regPassword) {
      setRegError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setRegLoading(true);
    const ok = await register({
      name: regName, email: regEmail, password: regPassword, role,
      university: role === 'student' ? university : undefined,
      major: role === 'student' ? major : undefined,
      companyName: role === 'business' ? companyName : undefined,
    });
    setRegLoading(false);
    if (ok) navigate('/dashboard');
    else setRegError('Email đã tồn tại. Vui lòng dùng email khác.');
  }, [regName, regEmail, regPassword, role, university, major, companyName, register, navigate]);

  return (
    <div className="sl-page">
      <div className={`sl-container${active ? ' active' : ''}`}>

        {/* ── LOGIN FORM ── */}
        <div className="sl-form-box sl-login">
          <form onSubmit={handleLogin} noValidate>
            <h1>Đăng nhập</h1>
            {loginError && <div className="sl-error">{loginError}</div>}
            <div className="sl-input-box">
              <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" required />
              <i className="bx bxs-envelope" />
            </div>
            <div className="sl-input-box">
              <input type={showLoginPw ? 'text' : 'password'} placeholder="Mật khẩu" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} autoComplete="current-password" required />
              <i className="bx bxs-lock-alt" style={{ cursor: 'pointer' }} onClick={() => setShowLoginPw(p => !p)} />
            </div>
            <button type="submit" className="sl-btn" disabled={loginLoading}>
              {loginLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
            <p>hoặc đăng nhập với</p>
            <div className="sl-social-icons">
              <a href="#"><i className="bx bxl-google" /></a>
              <a href="#"><i className="bx bxl-facebook" /></a>
              <a href="#"><i className="bx bxl-github" /></a>
              <a href="#"><i className="bx bxl-linkedin" /></a>
            </div>
          </form>
        </div>

        {/* ── REGISTER FORM ── */}
        <div className="sl-form-box sl-register">
          <form onSubmit={handleRegister} noValidate>
            <h1>Đăng ký</h1>
            {regError && <div className="sl-error">{regError}</div>}
            <div className="sl-role-toggle">
              <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>👨‍🎓 Sinh viên</button>
              <button type="button" className={role === 'business' ? 'active' : ''} onClick={() => setRole('business')}>🏢 Doanh nghiệp</button>
            </div>
            <div className="sl-input-box">
              <input type="text" placeholder="Họ và tên" value={regName} onChange={e => setRegName(e.target.value)} required />
              <i className="bx bxs-user" />
            </div>
            <div className="sl-input-box">
              <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} autoComplete="email" required />
              <i className="bx bxs-envelope" />
            </div>
            <div className="sl-input-box">
              <input type={showRegPw ? 'text' : 'password'} placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={regPassword} onChange={e => setRegPassword(e.target.value)} autoComplete="new-password" required />
              <i className="bx bxs-lock-alt" style={{ cursor: 'pointer' }} onClick={() => setShowRegPw(p => !p)} />
            </div>
            {role === 'student' && (
              <>
                <div className="sl-input-box">
                  <input type="text" placeholder="Trường đại học" value={university} onChange={e => setUniversity(e.target.value)} />
                  <i className="bx bxs-school" />
                </div>
                <div className="sl-input-box">
                  <input type="text" placeholder="Chuyên ngành" value={major} onChange={e => setMajor(e.target.value)} />
                  <i className="bx bxs-book" />
                </div>
              </>
            )}
            {role === 'business' && (
              <div className="sl-input-box">
                <input type="text" placeholder="Tên công ty / tổ chức" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                <i className="bx bxs-building-house" />
              </div>
            )}
            <button type="submit" className="sl-btn" disabled={regLoading}>
              {regLoading ? 'Đang tạo...' : 'Đăng ký'}
            </button>
            <p>hoặc đăng ký với</p>
            <div className="sl-social-icons">
              <a href="#"><i className="bx bxl-google" /></a>
              <a href="#"><i className="bx bxl-facebook" /></a>
              <a href="#"><i className="bx bxl-github" /></a>
              <a href="#"><i className="bx bxl-linkedin" /></a>
            </div>
          </form>
        </div>

        {/* ── TOGGLE OVERLAY ── */}
        <div className="sl-toggle-box">
          <div className="sl-toggle-panel sl-toggle-left">
            <h1>Xin chào!</h1>
            <p>Chưa có tài khoản?</p>
            <button className="sl-btn sl-register-btn" type="button" onClick={() => setActive(true)}>Đăng ký</button>
          </div>
          <div className="sl-toggle-panel sl-toggle-right">
            <h1>Chào mừng trở lại!</h1>
            <p>Đã có tài khoản?</p>
            <button className="sl-btn sl-login-btn" type="button" onClick={() => setActive(false)}>Đăng nhập</button>
          </div>
        </div>

      </div>
    </div>
  );
}
