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

  const socialIcons = (
    <div className="sl-social">
      <a href="#" className="sl-icon"><svg viewBox="0 0 488 512" width="18" height="18"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg></a>
      <a href="#" className="sl-icon"><svg viewBox="0 0 320 512" width="18" height="18"><path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg></a>
      <a href="#" className="sl-icon"><svg viewBox="0 0 496 512" width="18" height="18"><path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm128 421.6c-35.9 26.8-80.1 42.4-128 42.4s-92.1-15.6-128-42.4V392c0-35.3 28.7-64 64-64h128c35.3 0 64 28.7 64 64v37.6zM248 320c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96z"/></svg></a>
      <a href="#" className="sl-icon"><svg viewBox="0 0 448 512" width="18" height="18"><path fill="currentColor" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg></a>
    </div>
  );

  return (
    <section className="sl-page">
      <div className={`sl-box${active ? ' active' : ''}`}>

        {/* ── LOGIN ── */}
        <div className="sl-form-box sl-login">
          <form onSubmit={handleLogin} noValidate>
            <h1>Đăng nhập</h1>
            {socialIcons}
            <p className="sl-or">hoặc đăng nhập bằng email</p>
            {loginError && <div className="sl-error">{loginError}</div>}
            <div className="sl-field">
              <i>📧</i>
              <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="sl-field">
              <i>🔒</i>
              <input type={showLoginPw ? 'text' : 'password'} placeholder="Mật khẩu" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" className="sl-eye" onClick={() => setShowLoginPw(p => !p)}>{showLoginPw ? '🙈' : '👁️'}</button>
            </div>
            <button type="submit" className="sl-btn" disabled={loginLoading}>
              {loginLoading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
            </button>
            <p className="sl-mob-link">Chưa có tài khoản? <button type="button" onClick={() => setActive(true)}>Đăng ký</button></p>
          </form>
        </div>

        {/* ── REGISTER ── */}
        <div className="sl-form-box sl-register">
          <form onSubmit={handleRegister} noValidate>
            <h1>Tạo tài khoản</h1>
            {socialIcons}
            <p className="sl-or">hoặc dùng email để đăng ký</p>
            {regError && <div className="sl-error">{regError}</div>}
            <div className="sl-role-bar">
              <button type="button" className={role === 'student' ? 'on' : ''} onClick={() => setRole('student')}>Sinh viên</button>
              <button type="button" className={role === 'business' ? 'on' : ''} onClick={() => setRole('business')}>Doanh nghiệp</button>
            </div>
            <div className="sl-field">
              <i>👤</i>
              <input type="text" placeholder="Họ và tên" value={regName} onChange={e => setRegName(e.target.value)} />
            </div>
            <div className="sl-field">
              <i>📧</i>
              <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="sl-field">
              <i>🔒</i>
              <input type={showRegPw ? 'text' : 'password'} placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={regPassword} onChange={e => setRegPassword(e.target.value)} autoComplete="new-password" />
              <button type="button" className="sl-eye" onClick={() => setShowRegPw(p => !p)}>{showRegPw ? '🙈' : '👁️'}</button>
            </div>
            {role === 'student' && (
              <>
                <div className="sl-field"><i>🏫</i><input type="text" placeholder="Trường đại học" value={university} onChange={e => setUniversity(e.target.value)} /></div>
                <div className="sl-field"><i>📚</i><input type="text" placeholder="Chuyên ngành" value={major} onChange={e => setMajor(e.target.value)} /></div>
              </>
            )}
            {role === 'business' && (
              <div className="sl-field"><i>🏢</i><input type="text" placeholder="Tên công ty / tổ chức" value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
            )}
            <button type="submit" className="sl-btn" disabled={regLoading}>
              {regLoading ? 'Đang tạo...' : 'ĐĂNG KÝ'}
            </button>
            <p className="sl-mob-link">Đã có tài khoản? <button type="button" onClick={() => setActive(false)}>Đăng nhập</button></p>
          </form>
        </div>

        {/* ── TOGGLE OVERLAY ── */}
        <div className="sl-toggle-box">
          <div className="sl-toggle-panel sl-toggle-left">
            <h2>Chào mừng trở lại!</h2>
            <p>Đăng nhập với tài khoản của bạn để tiếp tục hành trình trên UniTask</p>
            <button className="sl-ghost" type="button" onClick={() => setActive(false)}>ĐĂNG NHẬP</button>
          </div>
          <div className="sl-toggle-panel sl-toggle-right">
            <h2>Xin chào!</h2>
            <p>Đăng ký tài khoản UniTask miễn phí và bắt đầu ngay hôm nay</p>
            <button className="sl-ghost" type="button" onClick={() => setActive(true)}>ĐĂNG KÝ</button>
          </div>
        </div>

      </div>
    </section>
  );
}
