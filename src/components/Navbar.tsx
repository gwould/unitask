import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useScrolled } from '../hooks/useScroll';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { serviceRegistry } from '../services';
import type { Category } from '../types';
import logoUniTask from '../assets/logo unitask.png';

export default function Navbar() {
  const scrolled = useScrolled(60);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaCategories, setMegaCategories] = useState<Category[]>([]);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyPos, setPolicyPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
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
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const policyLinkRef = useRef<HTMLDivElement>(null);
  const policyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isHome = location.pathname === '/';

  // Mega-menu ngành nghề lấy từ API (slug + số job thật), tránh số liệu fix cứng.
  useEffect(() => {
    let cancelled = false;
    serviceRegistry.site.getCategories()
      .then((data) => { if (!cancelled) setMegaCategories(data); })
      .catch(() => { if (!cancelled) setMegaCategories([]); });
    return () => { cancelled = true; };
  }, []);

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

  const handlePolicyEnter = () => {
    clearTimeout(policyTimeoutRef.current);
    if (policyLinkRef.current) {
      const rect = policyLinkRef.current.getBoundingClientRect();
      setPolicyPos({ top: rect.bottom + 6, left: rect.left });
    }
    setPolicyOpen(true);
  };

  const handlePolicyLeave = () => {
    policyTimeoutRef.current = setTimeout(() => setPolicyOpen(false), 120);
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
        <Link to="/jobs" onClick={closeMobile}><i className="bx bx-search" /> Tìm việc</Link>
        <Link to="/about#pricing" onClick={closeMobile}><i className="bx bx-purchase-tag" /> Bảng giá</Link>
        {isHome && (
          <>
            <a href="#how" onClick={closeMobile}><i className="bx bx-bulb" /> Cách hoạt động</a>
            <a href="#pricing" onClick={closeMobile}><i className="bx bx-purchase-tag" /> Bảng giá</a>
            <a href="#features" onClick={closeMobile}><i className="bx bxs-star" /> Tính năng</a>
          </>
        )}
        {user ? (
          <>
            <Link to="/profile" onClick={closeMobile}><i className="bx bx-user" /> Hồ sơ</Link>
            <Link to="/dashboard" onClick={closeMobile}><i className="bx bxs-dashboard" /> Dashboard</Link>
            <Link to="/wallet" onClick={closeMobile}><i className="bx bx-wallet" /> Ví</Link>
            <Link to="/notifications" onClick={closeMobile}><i className="bx bx-bell" /> Thông báo{unreadCount > 0 && ` (${unreadCount})`}</Link>
            <Link to="/messages" onClick={closeMobile}><i className="bx bx-message-rounded-dots" /> Tin nhắn</Link>
            {user.role === 'student' && (
              <>
                <Link to="/my-applications" onClick={closeMobile} style={{ marginTop: 12 }}><i className="bx bx-list-check" /> Đơn ứng tuyển</Link>
                <Link to="/my-tasks" onClick={closeMobile}><i className="bx bx-task" /> Công việc</Link>
                <Link to="/contracts" onClick={closeMobile}><i className="bx bx-file" /> Hợp đồng</Link>
                <Link to="/portfolio-builder" onClick={closeMobile}><i className="bx bx-briefcase-alt-2" /> Portfolio</Link>
              </>
            )}
            {user.role === 'business' && (
              <>
                <Link to="/post-job" onClick={closeMobile} style={{ marginTop: 12 }}><i className="bx bx-edit" /> Đăng việc</Link>
                <Link to="/manage-jobs" onClick={closeMobile}><i className="bx bx-folder-open" /> Quản lý job</Link>
                <Link to="/business-automation" onClick={closeMobile}><i className="bx bx-bot" /> Vận hành</Link>
                <Link to="/contracts" onClick={closeMobile}><i className="bx bx-file" /> Hợp đồng</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin-finance" onClick={closeMobile} style={{ marginTop: 12 }}><i className="bx bx-line-chart" /> Tài chính</Link>
                <Link to="/admin-accounts" onClick={closeMobile}><i className="bx bx-group" /> Quản lý tài khoản</Link>
                <Link to="/admin-disputes" onClick={closeMobile}><i className="bx bx-gavel" /> Giải quyết tranh chấp</Link>
                <Link to="/admin-messages" onClick={closeMobile}><i className="bx bx-shield" /> Giám sát tin nhắn</Link>
              </>
            )}
            <button
              style={{ marginTop: 16, textAlign: 'left', background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: '12px 0' }}
              onClick={() => { logout(); closeMobile(); }}
            >
              <i className="bx bx-log-out" /> Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/contact" onClick={closeMobile}><i className="bx bx-envelope" /> Liên hệ</Link>
            <Link to="/terms" onClick={closeMobile}><i className="bx bx-file" /> Điều khoản</Link>
            <Link to="/policy" onClick={closeMobile}><i className="bx bx-shield-quarter" /> Chính sách UniTask</Link>
            <Link to="/privacy" onClick={closeMobile}><i className="bx bx-lock-alt" /> Bảo mật</Link>
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

      {/* Policy dropdown portal (escape header để không bị cắt) */}
      {policyOpen && !user && createPortal(
        <div
          className="nav-policy-dd"
          style={{ top: policyPos.top, left: policyPos.left }}
          onMouseEnter={() => clearTimeout(policyTimeoutRef.current)}
          onMouseLeave={handlePolicyLeave}
        >
          <Link to="/terms" onClick={() => setPolicyOpen(false)}>Điều khoản</Link>
          <Link to="/policy" onClick={() => setPolicyOpen(false)}>Chính sách UniTask</Link>
          <Link to="/privacy" onClick={() => setPolicyOpen(false)}>Bảo mật</Link>
        </div>,
        document.body
      )}

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
                <span className="nav-mega-icon" style={{ color: cat.iconColor }}><i className={`bx ${cat.icon}`} /></span>
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
            <img src={logoUniTask} alt="UniTask" className="nav-logo-icon" />
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
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
              Về chúng tôi
            </Link>
            {!user && (
              <>
                <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                  Liên hệ
                </Link>
                <div
                  ref={policyLinkRef}
                  className="nav-link-wrap"
                  onMouseEnter={handlePolicyEnter}
                  onMouseLeave={handlePolicyLeave}
                >
                  <Link
                    to="/policy"
                    className={['/policy', '/escrow-policy', '/terms', '/privacy'].includes(location.pathname) ? 'active' : ''}
                  >
                    Chính sách <i className="bx bx-chevron-down nav-link-chevron" />
                  </Link>
                </div>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin-finance" className={location.pathname === '/admin-finance' ? 'active' : ''}>
                  Tài chính
                </Link>
                <Link to="/admin-accounts" className={location.pathname === '/admin-accounts' ? 'active' : ''}>
                  Quản lý TK
                </Link>
                <Link to="/admin-disputes" className={location.pathname === '/admin-disputes' ? 'active' : ''}>
                  Tranh chấp
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
                  <i className="bx bx-bell" />
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
                      <span>{user.role === 'student' ? <><i className="bx bxs-graduation" /> Sinh viên</> : user.role === 'business' ? <><i className="bx bxs-building-house" /> Doanh nghiệp</> : <><i className="bx bx-shield" /> Admin</>}</span>
                    </div>
                    <Link to="/profile" className="nav-dd-item"><i className="bx bx-user" /> Hồ sơ</Link>
                    <Link to="/dashboard" className="nav-dd-item"><i className="bx bxs-dashboard" /> Dashboard</Link>
                    <Link to="/wallet" className="nav-dd-item"><i className="bx bx-wallet" /> Ví</Link>
                    <Link to="/messages" className="nav-dd-item"><i className="bx bx-message-rounded-dots" /> Tin nhắn</Link>
                    {user.role === 'student' && (
                      <>
                        <div className="nav-dd-divider" />
                        <Link to="/my-applications" className="nav-dd-item"><i className="bx bx-list-check" /> Đơn ứng tuyển</Link>
                        <Link to="/my-tasks" className="nav-dd-item"><i className="bx bx-task" /> Công việc</Link>
                        <Link to="/contracts" className="nav-dd-item"><i className="bx bx-file" /> Hợp đồng</Link>
                        <Link to="/portfolio-builder" className="nav-dd-item"><i className="bx bx-briefcase-alt-2" /> Portfolio</Link>
                      </>
                    )}
                    {user.role === 'business' && (
                      <>
                        <div className="nav-dd-divider" />
                        <Link to="/post-job" className="nav-dd-item"><i className="bx bx-edit" /> Đăng việc</Link>
                        <Link to="/manage-jobs" className="nav-dd-item"><i className="bx bx-folder-open" /> Quản lý job</Link>
                        <Link to="/business-automation" className="nav-dd-item"><i className="bx bx-bot" /> Vận hành</Link>
                        <Link to="/contracts" className="nav-dd-item"><i className="bx bx-file" /> Hợp đồng</Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <div className="nav-dd-divider" />
                        <Link to="/admin-finance" className="nav-dd-item"><i className="bx bx-line-chart" /> Tài chính</Link>
                        <Link to="/admin-accounts" className="nav-dd-item"><i className="bx bx-group" /> Quản lý tài khoản</Link>
                        <Link to="/admin-disputes" className="nav-dd-item"><i className="bx bx-gavel" /> Giải quyết tranh chấp</Link>
                        <Link to="/admin-messages" className="nav-dd-item"><i className="bx bx-shield" /> Giám sát tin nhắn</Link>
                      </>
                    )}
                    <button className="nav-dd-item nav-dd-logout" onClick={logout}>
                      <i className="bx bx-log-out" /> Đăng xuất
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
