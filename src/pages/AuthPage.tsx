import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
              locale?: string;
            },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = '308973806649-koiqv3ta5iv4fdgvlj5ckc7kvarot7sq.apps.googleusercontent.com';

// Gợi ý cho ô đăng ký sinh viên (vẫn cho phép gõ tự do).
const UNIVERSITY_SUGGESTIONS = [
  'Đại học Bách Khoa TP.HCM',
  'Đại học Khoa học Tự nhiên - ĐHQG TP.HCM',
  'Đại học Công nghệ Thông tin - ĐHQG TP.HCM',
  'Đại học Kinh tế TP.HCM (UEH)',
  'Đại học FPT',
  'Đại học Sư phạm Kỹ thuật TP.HCM',
  'Đại học Tôn Đức Thắng',
  'Đại học Công nghiệp TP.HCM',
  'Đại học Ngoại thương',
  'Đại học RMIT Việt Nam',
  'Đại học Kinh tế - Luật (UEL)',
  'Đại học Hoa Sen',
  'Đại học Văn Lang',
  'Đại học Bách Khoa Hà Nội',
  'Đại học Quốc gia Hà Nội',
  'Học viện Công nghệ Bưu chính Viễn thông',
  'Đại học Kinh tế Quốc dân (NEU)',
  'Đại học Đà Nẵng',
  'Đại học Cần Thơ',
  'Đại học Huế',
];

const MAJOR_SUGGESTIONS = [
  'Công nghệ thông tin',
  'Khoa học máy tính',
  'Kỹ thuật phần mềm',
  'Trí tuệ nhân tạo',
  'Khoa học dữ liệu',
  'An toàn thông tin',
  'Hệ thống thông tin',
  'Thiết kế đồ họa',
  'Thiết kế UI/UX',
  'Marketing',
  'Digital Marketing',
  'Quản trị kinh doanh',
  'Kinh tế',
  'Tài chính - Ngân hàng',
  'Kế toán - Kiểm toán',
  'Ngôn ngữ Anh',
  'Quan hệ công chúng (PR)',
  'Báo chí - Truyền thông',
  'Logistics & Quản lý chuỗi cung ứng',
  'Kỹ thuật điện - điện tử',
  'Cơ khí - Tự động hóa',
  'Quản trị Nhân sự',
];

export default function AuthPage() {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname === '/register');
  const { login, loginWithGoogle, register } = useAuth();
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

  const [googleLoading, setGoogleLoading] = useState(false);

  const loginGoogleRef = useRef<HTMLDivElement>(null);
  const registerGoogleRef = useRef<HTMLDivElement>(null);

  const handleGoogleCallback = useCallback(async (response: { credential: string }) => {
    setGoogleLoading(true);
    setLoginError('');
    setRegError('');
    const ok = await loginWithGoogle(response.credential);
    setGoogleLoading(false);
    if (ok) {
      navigate('/dashboard');
    } else {
      setLoginError('Đăng nhập Google thất bại. Vui lòng thử lại.');
      setRegError('Đăng nhập Google thất bại. Vui lòng thử lại.');
    }
  }, [loginWithGoogle, navigate]);

  useEffect(() => {
    const renderButtons = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      if (loginGoogleRef.current) {
        loginGoogleRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(loginGoogleRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 280,
          locale: 'vi_VN',
        });
      }

      if (registerGoogleRef.current) {
        registerGoogleRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(registerGoogleRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 280,
          locale: 'vi_VN',
        });
      }
    };

    renderButtons();

    if (!window.google?.accounts?.id) {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          renderButtons();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [handleGoogleCallback, active]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (result === 'pending') setLoginError('Tài khoản doanh nghiệp đang chờ admin phê duyệt. Vui lòng đợi thông báo.');
    else if (result) navigate('/dashboard');
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
    const result = await register({
      name: regName, email: regEmail, password: regPassword, role,
      university: role === 'student' ? university : undefined,
      major: role === 'student' ? major : undefined,
      companyName: role === 'business' ? companyName : undefined,
    });
    setRegLoading(false);
    if (result === 'pending') {
      navigate('/business-pending');
      return;
    }
    if (result === 'verify-email') {
      navigate('/verify-email', { state: { email: regEmail } });
      return;
    }
    else if (result) navigate('/dashboard');
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
            <button type="submit" className="sl-btn" disabled={loginLoading || googleLoading}>
              {loginLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
            <p>hoặc đăng nhập với</p>
            <div className="sl-google-btn" ref={loginGoogleRef} />
          </form>
        </div>

        {/* ── REGISTER FORM ── */}
        <div className="sl-form-box sl-register">
          <form onSubmit={handleRegister} noValidate>
            <h1>Đăng ký</h1>
            {regError && <div className="sl-error">{regError}</div>}
            <div className="sl-role-toggle">
              <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>Sinh viên</button>
              <button type="button" className={role === 'business' ? 'active' : ''} onClick={() => setRole('business')}>Doanh nghiệp</button>
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
                  <input type="text" placeholder="Trường đại học" value={university} onChange={e => setUniversity(e.target.value)} list="university-suggestions" autoComplete="off" />
                  <i className="bx bxs-school" />
                  <datalist id="university-suggestions">
                    {UNIVERSITY_SUGGESTIONS.map(u => <option key={u} value={u} />)}
                  </datalist>
                </div>
                <div className="sl-input-box">
                  <input type="text" placeholder="Chuyên ngành" value={major} onChange={e => setMajor(e.target.value)} list="major-suggestions" autoComplete="off" />
                  <i className="bx bxs-book" />
                  <datalist id="major-suggestions">
                    {MAJOR_SUGGESTIONS.map(m => <option key={m} value={m} />)}
                  </datalist>
                </div>
              </>
            )}
            {role === 'business' && (
              <div className="sl-input-box">
                <input type="text" placeholder="Tên công ty / tổ chức" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                <i className="bx bxs-building-house" />
              </div>
            )}
            <button type="submit" className="sl-btn" disabled={regLoading || googleLoading}>
              {regLoading ? 'Đang tạo...' : 'Đăng ký'}
            </button>
            <p>hoặc đăng ký với</p>
            <div className="sl-google-btn" ref={registerGoogleRef} />
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
