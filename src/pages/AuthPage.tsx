import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

export default function AuthPage() {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Sign Up state
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
      name: regName,
      email: regEmail,
      password: regPassword,
      role,
      university: role === 'student' ? university : undefined,
      major: role === 'student' ? major : undefined,
      companyName: role === 'business' ? companyName : undefined,
    });
    setRegLoading(false);
    if (ok) navigate('/dashboard');
    else setRegError('Email đã tồn tại. Vui lòng dùng email khác.');
  }, [regName, regEmail, regPassword, role, university, major, companyName, register, navigate]);

  return (
    <section className="sl-page">
      <div className={`sl-container${isSignUp ? ' sl-active' : ''}`}>

        {/* ─── SIGN UP FORM (right side) ─── */}
        <div className="sl-form-box sl-signup">
          <form onSubmit={handleRegister} noValidate>
            <h1>Tạo tài khoản</h1>
            <div className="sl-social">
              <button type="button" className="sl-social-btn" title="Google">G</button>
              <button type="button" className="sl-social-btn" title="Facebook">f</button>
              <button type="button" className="sl-social-btn" title="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </button>
              <button type="button" className="sl-social-btn" title="LinkedIn">in</button>
            </div>
            <span className="sl-divider-text">hoặc dùng email để đăng ký</span>

            {regError && <div className="sl-error">{regError}</div>}

            <div className="sl-role-toggle">
              <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>Sinh viên</button>
              <button type="button" className={role === 'business' ? 'active' : ''} onClick={() => setRole('business')}>Doanh nghiệp</button>
            </div>

            <input type="text" placeholder="Họ và tên" value={regName} onChange={e => setRegName(e.target.value)} />
            <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} autoComplete="email" />
            <div className="sl-pw-wrap">
              <input type={showRegPw ? 'text' : 'password'} placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={regPassword} onChange={e => setRegPassword(e.target.value)} autoComplete="new-password" />
              <button type="button" className="sl-pw-toggle" onClick={() => setShowRegPw(p => !p)}>{showRegPw ? '🙈' : '👁️'}</button>
            </div>

            {role === 'student' && (
              <>
                <input type="text" placeholder="Trường đại học" value={university} onChange={e => setUniversity(e.target.value)} />
                <input type="text" placeholder="Chuyên ngành" value={major} onChange={e => setMajor(e.target.value)} />
              </>
            )}
            {role === 'business' && (
              <input type="text" placeholder="Tên công ty / tổ chức" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            )}

            <button type="submit" className="sl-submit" disabled={regLoading}>
              {regLoading ? 'Đang tạo...' : 'ĐĂNG KÝ'}
            </button>

            {/* Mobile toggle */}
            <p className="sl-mobile-switch">
              Đã có tài khoản? <button type="button" onClick={() => setIsSignUp(false)}>Đăng nhập</button>
            </p>
          </form>
        </div>

        {/* ─── SIGN IN FORM (left side) ─── */}
        <div className="sl-form-box sl-signin">
          <form onSubmit={handleLogin} noValidate>
            <h1>Đăng nhập</h1>
            <div className="sl-social">
              <button type="button" className="sl-social-btn" title="Google">G</button>
              <button type="button" className="sl-social-btn" title="Facebook">f</button>
              <button type="button" className="sl-social-btn" title="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </button>
              <button type="button" className="sl-social-btn" title="LinkedIn">in</button>
            </div>
            <span className="sl-divider-text">hoặc đăng nhập bằng email</span>

            {loginError && <div className="sl-error">{loginError}</div>}

            <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" />
            <div className="sl-pw-wrap">
              <input type={showLoginPw ? 'text' : 'password'} placeholder="Mật khẩu" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" className="sl-pw-toggle" onClick={() => setShowLoginPw(p => !p)}>{showLoginPw ? '🙈' : '👁️'}</button>
            </div>

            <button type="submit" className="sl-submit" disabled={loginLoading}>
              {loginLoading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
            </button>

            {/* Mobile toggle */}
            <p className="sl-mobile-switch">
              Chưa có tài khoản? <button type="button" onClick={() => setIsSignUp(true)}>Đăng ký</button>
            </p>
          </form>
        </div>

        {/* ─── SLIDING OVERLAY ─── */}
        <div className="sl-toggle-box">
          <div className="sl-toggle">
            <div className="sl-toggle-panel sl-toggle-left">
              <h2>Chào mừng trở lại!</h2>
              <p>Đăng nhập để tiếp tục hành trình của bạn trên UniTask</p>
              <button className="sl-ghost-btn" type="button" onClick={() => setIsSignUp(false)}>
                ĐĂNG NHẬP
              </button>
            </div>
            <div className="sl-toggle-panel sl-toggle-right">
              <h2>Xin chào!</h2>
              <p>Đăng ký tài khoản UniTask miễn phí để bắt đầu</p>
              <button className="sl-ghost-btn" type="button" onClick={() => setIsSignUp(true)}>
                ĐĂNG KÝ
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
