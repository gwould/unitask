import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useScrolled } from '../hooks/useScroll';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

const megaCategories = [
  { slug: 'it', icon: '💻', name: 'IT / Lập trình', count: '320+ việc' },
  { slug: 'design', icon: '🎨', name: 'Thiết kế', count: '180+ việc' },
  { slug: 'marketing', icon: '📢', name: 'Marketing', count: '150+ việc' },
  { slug: 'content', icon: '✍️', name: 'Content & SEO', count: '120+ việc' },
  { slug: 'language', icon: '🌐', name: 'Ngôn ngữ & Dịch thuật', count: '90+ việc' },
  { slug: 'data', icon: '📊', name: 'Data & Phân tích', count: '75+ việc' },
  { slug: 'business', icon: '💼', name: 'Kinh doanh', count: '60+ việc' },
  { slug: 'other', icon: '🔧', name: 'Khác', count: '105+ việc' },
];

export default function Navbar() {
  const scrolled = useScrolled(60);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaPos, setMegaPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [ddPos, setDdPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const avatarBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const megaLinkRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const isHome = location.pathname === '/';

  const openMobile = () => {
    setMobileOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMobile = () => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        avatarBtnRef.current && !avatarBtnRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => {
      if (!prev && avatarBtnRef.current) {
        const rect = avatarBtnRef.current.getBoundingClientRect();
        setDdPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      }
      return !prev;
    });
  }, []);

  const handleMegaEnter = () => {
    clearTimeout(megaTimeoutRef.current);
    if (megaLinkRef.current) {
      const rect = megaLinkRef.current.getBoundingClientRect();
      setMegaPos({
        top: rect.bottom + 4,
        left: rect.left + rect.width / 2,
      });
    }
    setMegaOpen(true);
  };

  const handleMegaLeave = () => {
    megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 120);
  };

  const handleMegaDropdownEnter = () => {
    clearTimeout(megaTimeoutRef.current);
  };

  const handleMegaDropdownLeave = () => {
    megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 120);
  };

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
            <Link to="/profile" onClick={closeMobile}>👤 Hồ sơ</Link>
            <Link to="/dashboard" onClick={closeMobile}>📊 Dashboard</Link>
            <Link to="/wallet" onClick={closeMobile}>💰 Ví</Link>
            <Link to="/notifications" onClick={closeMobile}>🔔 Thông báo{unreadCount > 0 && ` (${unreadCount})`}</Link>
            <Link to="/messages" onClick={closeMobile}>💬 Tin nhắn</Link>
            {user.role === 'student' && (
              <>
                <Link to="/my-applications" onClick={closeMobile}>📋 Đơn ứng tuyển</Link>
                <Link to="/contracts" onClick={closeMobile}>🤝 Hợp đồng</Link>
              </>
            )}
            {user.role === 'business' && (
              <>
                <Link to="/post-job" onClick={closeMobile}>📝 Đăng việc</Link>
                <Link to="/manage-jobs" onClick={closeMobile}>📂 Quản lý job</Link>
                <Link to="/contracts" onClick={closeMobile}>🤝 Hợp đồng</Link>
                <Link to="/business-automation" onClick={closeMobile}>🎯 Trung tâm tăng trưởng</Link>
                <Link to="/automation-rules" onClick={closeMobile}>🤖 Tự động hóa</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin-finance" onClick={closeMobile}>📈 Admin Finance</Link>
                <Link to="/admin-accounts" onClick={closeMobile}>👥 Quản lý tài khoản</Link>
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

      {/* Mega-menu portal */}
      {megaOpen && createPortal(
        <div
          ref={megaRef}
          className="nav-mega"
          style={{ top: megaPos.top, left: megaPos.left }}
          onMouseEnter={handleMegaDropdownEnter}
          onMouseLeave={handleMegaDropdownLeave}
        >
          <div className="nav-mega-header">
            <span>Khám phá theo ngành nghề</span>
          </div>
          <div className="nav-mega-grid">
            {megaCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/jobs?cat=${cat.slug}`}
                className="nav-mega-item"
                onClick={() => setMegaOpen(false)}
              >
                <span className="nav-mega-icon">{cat.icon}</span>
                <div>
                  <div className="nav-mega-name">{cat.name}</div>
                  <div className="nav-mega-count">{cat.count}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="nav-mega-footer">
            <Link to="/jobs" className="btn btn-sm btn-primary" onClick={() => setMegaOpen(false)}>
              Xem tất cả việc làm →
            </Link>
          </div>
        </div>,
        document.body
      )}

      {/* Navbar */}
      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <span className="nav-logo-icon">U</span>
            Uni<span>Task</span>
          </Link>
          <nav className="nav-links">
            <div
              ref={megaLinkRef}
              className="nav-link-wrap"
              onMouseEnter={handleMegaEnter}
              onMouseLeave={handleMegaLeave}
            >
              <Link to="/jobs" className={location.pathname.startsWith('/jobs') ? 'active' : ''}>
                Tìm việc <i className="bx bx-chevron-down nav-link-chevron" />
              </Link>
            </div>
            {user?.role === 'business' && (
              <Link to="/post-job" className={location.pathname === '/post-job' ? 'active' : ''}>
                Doanh nghiệp
              </Link>
            )}
            <Link to="/about#pricing" className={location.pathname === '/about' ? 'active' : ''}>
              Giá cả
            </Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
              Về chúng tôi
            </Link>
            {user?.role === 'admin' && (
              <>
                <Link to="/admin-finance" className={location.pathname === '/admin-finance' ? 'active' : ''}>
                  Admin Finance
                </Link>
                <Link to="/admin-accounts" className={location.pathname === '/admin-accounts' ? 'active' : ''}>
                  Quản lý TK
                </Link>
              </>
            )}
          </nav>
          <div className="nav-actions">
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
              <>
                <Link to="/notifications" className="nav-notif-btn" title="Thông báo">
                  🔔
                  {unreadCount > 0 && <span className="nav-notif-badge">{unreadCount}</span>}
                </Link>
                <div className="nav-user">
                  <button
                    ref={avatarBtnRef}
                    className="nav-avatar-btn"
                    onClick={toggleDropdown}
                    style={{
                      background: user.role === 'student'
                        ? 'linear-gradient(135deg,var(--p),var(--pl))'
                        : 'linear-gradient(135deg,var(--teal),#059669)',
                    }}
                  >
                    {user.avatar}
                  </button>
                </div>
                {dropdownOpen && createPortal(
                  <div
                    ref={dropdownRef}
                    className="nav-dropdown"
                    style={{ top: ddPos.top, right: ddPos.right }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="nav-dd-header">
                      <strong>{user.name}</strong>
                      <span>{user.role === 'student' ? '👨‍🎓 Sinh viên' : user.role === 'business' ? '🏢 Doanh nghiệp' : '🛡️ Admin'}</span>
                    </div>
                    <Link to="/profile" className="nav-dd-item">👤 Hồ sơ</Link>
                    <Link to="/dashboard" className="nav-dd-item">📊 Dashboard</Link>
                    <Link to="/wallet" className="nav-dd-item">💰 Ví</Link>
                    <Link to="/messages" className="nav-dd-item">💬 Tin nhắn</Link>
                    {user.role === 'student' && (
                      <>
                        <Link to="/my-applications" className="nav-dd-item">📋 Đơn ứng tuyển</Link>
                        <Link to="/contracts" className="nav-dd-item">🤝 Hợp đồng</Link>
                      </>
                    )}
                    {user.role === 'business' && (
                      <>
                        <Link to="/post-job" className="nav-dd-item">📝 Đăng việc</Link>
                        <Link to="/manage-jobs" className="nav-dd-item">📂 Quản lý job</Link>
                        <Link to="/contracts" className="nav-dd-item">🤝 Hợp đồng</Link>
                        <Link to="/business-automation" className="nav-dd-item">🎯 Trung tâm tăng trưởng</Link>
                        <Link to="/automation-rules" className="nav-dd-item">🤖 Tự động hóa</Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link to="/admin-finance" className="nav-dd-item">📈 Admin Finance</Link>
                        <Link to="/admin-accounts" className="nav-dd-item">👥 Quản lý tài khoản</Link>
                        <Link to="/admin-messages" className="nav-dd-item">🛡️ Giám sát tin nhắn</Link>
                      </>
                    )}
                    <button className="nav-dd-item nav-dd-logout" onClick={logout}>
                      🚪 Đăng xuất
                    </button>
                  </div>,
                  document.body
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="nav-login">Đăng nhập</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Bắt đầu miễn phí</Link>
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
