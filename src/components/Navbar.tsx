import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScrolled } from '../hooks/useScroll';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const scrolled = useScrolled(60);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';

  const openMobile = () => {
    setMobileOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMobile = () => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  };

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className={`overlay${mobileOpen ? ' show' : ''}`}
        onClick={closeMobile}
      />

      {/* Mobile Nav */}
      <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        <button className="mobile-close" onClick={closeMobile}>✕</button>
        <Link to="/jobs" onClick={closeMobile}>🔍 Tìm việc</Link>
        <Link to="/about#pricing" onClick={closeMobile}>💼 Bảng giá</Link>
        {isHome && (
          <>
            <a href="#how" onClick={closeMobile}>💡 Cách hoạt động</a>
            <a href="#pricing" onClick={closeMobile}>💼 Bảng giá</a>
            <a href="#features" onClick={closeMobile}>⭐ Tính năng</a>
          </>
        )}
        {user ? (
          <>
            <Link to="/dashboard" onClick={closeMobile}>📊 Dashboard</Link>
            <Link to="/profile" onClick={closeMobile}>👤 Hồ sơ</Link>
            <Link to="/wallet" onClick={closeMobile}>💰 Ví</Link>
            <Link to="/notifications" onClick={closeMobile}>🔔 Thông báo{unreadCount > 0 && ` (${unreadCount})`}</Link>
            <Link to="/messages" onClick={closeMobile}>💬 Tin nhắn</Link>
            {user.role === 'student' && (
              <Link to="/my-applications" onClick={closeMobile}>📋 Đơn ứng tuyển</Link>
            )}
            {user.role === 'business' && (
              <>
                <Link to="/post-job" onClick={closeMobile}>📝 Đăng việc</Link>
                <Link to="/manage-jobs" onClick={closeMobile}>📂 Quản lý job</Link>
                <Link to="/business-automation" onClick={closeMobile}>🎯 Trung tâm tăng trưởng</Link>
                <Link to="/automation-rules" onClick={closeMobile}>🤖 Tự động hóa</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin-finance" onClick={closeMobile}>📈 Admin Finance</Link>
                <Link to="/admin-messages" onClick={closeMobile}>🛡️ Giám sát tin nhắn</Link>
              </>
            )}
            <button
              style={{ marginTop: 16, textAlign: 'left', background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: '12px 0' }}
              onClick={() => { logout(); closeMobile(); }}
            >
              🚪 Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginTop: 16 }} onClick={closeMobile}>Đăng nhập</Link>
            <Link
              to="/register"
              onClick={closeMobile}
              style={{
                background: 'var(--p)',
                color: '#fff',
                borderRadius: 10,
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              Đăng ký miễn phí
            </Link>
          </>
        )}
      </nav>

      {/* Navbar */}
      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            Uni<span>Task</span>
            <div className="dot" />
          </Link>
          <nav className="nav-links">
            <Link to="/jobs" className={location.pathname.startsWith('/jobs') ? 'active' : ''}>
              Tìm việc
            </Link>
            <Link to="/about#pricing" className={location.pathname === '/about' ? 'active' : ''}>
              Bảng giá
            </Link>
            {isHome && (
              <>
                <a href="#how">Cách hoạt động</a>
                <a href="#pricing">Bảng giá</a>
                <a href="#features">Tính năng</a>
              </>
            )}
            {user?.role === 'business' && (
              <Link to="/post-job" className={location.pathname === '/post-job' ? 'active' : ''}>
                Đăng việc
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin-finance" className={location.pathname === '/admin-finance' ? 'active' : ''}>
                Admin Finance
              </Link>
            )}
          </nav>
          <div className="nav-actions">
            {/* Theme toggle */}
            <button
              className="nav-theme-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            {user ? (
              <div className="nav-user" ref={dropdownRef}>
                <button
                  className="nav-avatar-btn"
                  onClick={() => setDropdownOpen((p) => !p)}
                  style={{
                    background: user.role === 'student'
                      ? 'linear-gradient(135deg,#5B4FFF,#7C72FF)'
                      : 'linear-gradient(135deg,#00D4AA,#00A882)',
                  }}
                >
                  {user.avatar}
                </button>
                {dropdownOpen && (
                  <div className="nav-dropdown" onClick={() => setDropdownOpen(false)}>
                    <div className="nav-dd-header">
                      <strong>{user.name}</strong>
                      <span>{user.role === 'student' ? '👨‍🎓 Sinh viên' : user.role === 'business' ? '🏢 Doanh nghiệp' : '🛡️ Admin'}</span>
                    </div>
                    <Link to="/dashboard" className="nav-dd-item">📊 Dashboard</Link>
                    <Link to="/profile" className="nav-dd-item">👤 Hồ sơ</Link>
                    <Link to="/wallet" className="nav-dd-item">💰 Ví</Link>
                    <Link to="/notifications" className="nav-dd-item">🔔 Thông báo{unreadCount > 0 && <span style={{ marginLeft: 6, background: '#ff4444', color: '#fff', borderRadius: 999, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>{unreadCount}</span>}</Link>
                    <Link to="/messages" className="nav-dd-item">💬 Tin nhắn</Link>
                    {user.role === 'student' && (
                      <Link to="/my-applications" className="nav-dd-item">📋 Đơn ứng tuyển</Link>
                    )}
                    {user.role === 'business' && (
                      <>
                        <Link to="/post-job" className="nav-dd-item">📝 Đăng việc</Link>
                        <Link to="/manage-jobs" className="nav-dd-item">📂 Quản lý job</Link>
                        <Link to="/business-automation" className="nav-dd-item">🎯 Trung tâm tăng trưởng</Link>
                        <Link to="/automation-rules" className="nav-dd-item">🤖 Tự động hóa</Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link to="/admin-finance" className="nav-dd-item">📈 Admin Finance</Link>
                        <Link to="/admin-messages" className="nav-dd-item">🛡️ Giám sát tin nhắn</Link>
                      </>
                    )}
                    <button className="nav-dd-item nav-dd-logout" onClick={logout}>
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-login">Đăng nhập</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Đăng ký miễn phí →</Link>
              </>
            )}
          </div>
          <div className="hamburger" onClick={openMobile}>
            <span /><span /><span />
          </div>
        </div>
      </header>
    </>
  );
}
