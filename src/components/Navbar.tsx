import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScrolled } from '../hooks/useScroll';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const scrolled = useScrolled(60);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
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

  // close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    closeMobile();
  }, [location.pathname]);

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
        {isHome && (
          <>
            <a href="#how" onClick={closeMobile}>💡 Cách hoạt động</a>
            <a href="#features" onClick={closeMobile}>⭐ Tính năng</a>
          </>
        )}
        {user ? (
          <>
            <Link to="/dashboard" onClick={closeMobile}>📊 Dashboard</Link>
            <Link to="/profile" onClick={closeMobile}>👤 Hồ sơ</Link>
            <Link to="/wallet" onClick={closeMobile}>💰 Ví</Link>
            {user.role === 'student' && (
              <Link to="/my-applications" onClick={closeMobile}>📋 Đơn ứng tuyển</Link>
            )}
            {user.role === 'business' && (
              <>
                <Link to="/post-job" onClick={closeMobile}>📝 Đăng việc</Link>
                <Link to="/manage-jobs" onClick={closeMobile}>📂 Quản lý job</Link>
              </>
            )}
            {user.role === 'admin' && (
              <Link to="/admin-finance" onClick={closeMobile}>📈 Admin Finance</Link>
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
            {isHome && (
              <>
                <a href="#how">Cách hoạt động</a>
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
                  <div className="nav-dropdown">
                    <div className="nav-dd-header">
                      <strong>{user.name}</strong>
                      <span>{user.role === 'student' ? '👨‍🎓 Sinh viên' : user.role === 'business' ? '🏢 Doanh nghiệp' : '🛡️ Admin'}</span>
                    </div>
                    <Link to="/dashboard" className="nav-dd-item">📊 Dashboard</Link>
                    <Link to="/profile" className="nav-dd-item">👤 Hồ sơ</Link>
                    <Link to="/wallet" className="nav-dd-item">💰 Ví</Link>
                    {user.role === 'student' && (
                      <Link to="/my-applications" className="nav-dd-item">📋 Đơn ứng tuyển</Link>
                    )}
                    {user.role === 'business' && (
                      <>
                        <Link to="/post-job" className="nav-dd-item">📝 Đăng việc</Link>
                        <Link to="/manage-jobs" className="nav-dd-item">📂 Quản lý job</Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin-finance" className="nav-dd-item">📈 Admin Finance</Link>
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
