import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export default function Navbar() {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropOpen(false);
  };

  const navLinks = [
    { label: 'الرئيسية', path: '/' },
    { label: 'الأقسام', path: '/sections' },
    { label: 'الاختبارات', path: '/mock-exams' },
    { label: 'لوحة المتقدمين', path: '/leaderboard' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">

        <Link to="/" className="navbar-logo">
          <div className="logo-icon">S</div>
          <div className="logo-text">
            <span className="logo-main">STEP</span>
            <span className="logo-sub">Academy</span>
          </div>
        </Link>

        <div className="navbar-links desktop-only">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <button className="user-avatar-btn" onClick={() => setDropOpen(!dropOpen)}>
                <div className="user-avatar">
                  {userProfile?.name?.charAt(0) || user.email?.charAt(0)}
                </div>
                <span className="desktop-only user-name">{userProfile?.name || 'مستخدم'}</span>
                <span className="chevron">▾</span>
              </button>
              {dropOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dh-avatar">{userProfile?.name?.charAt(0) || 'U'}</div>
                    <div>
                      <div className="dh-name">{userProfile?.name}</div>
                      <div className="dh-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropOpen(false)}>📊 لوحة التحكم</Link>
                  <Link to="/my-courses" className="dropdown-item" onClick={() => setDropOpen(false)}>📚 دوراتي</Link>
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item admin-item" onClick={() => setDropOpen(false)}>⚙️ لوحة المعلم</Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout-item" onClick={handleLogout}>🚪 تسجيل الخروج</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost desktop-only">تسجيل الدخول</Link>
              <Link to="/register" className="btn-primary">ابدأ مجاناً</Link>
            </>
          )}
          <button className="burger mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="mobile-auth">
              <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>تسجيل الدخول</Link>
              <Link to="/register" className="btn-primary" onClick={() => setMenuOpen(false)}>ابدأ مجاناً</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed; top: 0; width: 100%; z-index: 1000;
          background: rgba(10,22,40,0.95); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(201,168,76,0.15);
          transition: all 0.3s ease;
        }
        .navbar.scrolled { background: rgba(10,22,40,0.98); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .navbar-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; gap: 24px; }
        .navbar-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
        .logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--navy);
        }
        .logo-text { display: flex; flex-direction: column; line-height: 1.1; }
        .logo-main { color: var(--white); font-weight: 800; font-size: 17px; letter-spacing: 2px; }
        .logo-sub { color: var(--gold); font-size: 10px; font-weight: 600; letter-spacing: 1px; }
        .navbar-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          color: rgba(255,255,255,0.7); padding: 8px 14px; border-radius: 8px;
          font-size: 14px; font-weight: 500; transition: all 0.2s; text-decoration: none;
        }
        .nav-link:hover, .nav-link.active { color: var(--gold-light); background: rgba(201,168,76,0.1); }
        .navbar-actions { display: flex; align-items: center; gap: 10px; }
        .btn-ghost {
          color: rgba(255,255,255,0.75); padding: 8px 16px; border-radius: 8px;
          font-size: 14px; font-weight: 500; transition: all 0.2s; text-decoration: none;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .btn-ghost:hover { color: white; border-color: rgba(255,255,255,0.5); }
        .user-menu { position: relative; }
        .user-avatar-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px; padding: 6px 12px 6px 6px;
          color: white; font-size: 14px; font-family: var(--font-arabic); cursor: pointer; transition: all 0.2s;
        }
        .user-avatar-btn:hover { background: rgba(255,255,255,0.15); }
        .user-avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; color: var(--navy);
        }
        .user-name { font-weight: 600; }
        .chevron { font-size: 10px; opacity: 0.6; }
        .user-dropdown {
          position: absolute; top: calc(100% + 8px); left: 0;
          background: var(--white); border: 1px solid var(--gray-200);
          border-radius: var(--radius); box-shadow: var(--shadow-lg);
          min-width: 220px; overflow: hidden; animation: fadeUp 0.2s ease;
        }
        .dropdown-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--gray-50); }
        .dh-avatar {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, var(--navy), var(--navy-light));
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 16px; color: var(--gold); flex-shrink: 0;
        }
        .dh-name { font-weight: 700; font-size: 14px; color: var(--navy); }
        .dh-email { font-size: 12px; color: var(--gray-600); }
        .dropdown-divider { height: 1px; background: var(--gray-200); }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px; padding: 11px 16px;
          font-size: 14px; color: var(--gray-800); font-family: var(--font-arabic);
          text-decoration: none; cursor: pointer; width: 100%;
          background: none; border: none; transition: background 0.15s; text-align: right;
        }
        .dropdown-item:hover { background: var(--gray-50); }
        .admin-item { color: var(--teal); font-weight: 600; }
        .logout-item { color: var(--crimson); }
        .burger { display: flex; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .burger span { display: block; width: 22px; height: 2px; background: white; border-radius: 1px; }
        .mobile-menu {
          background: var(--navy-light); border-top: 1px solid rgba(255,255,255,0.1);
          padding: 12px 16px; display: flex; flex-direction: column; gap: 4px;
        }
        .mobile-nav-link {
          color: rgba(255,255,255,0.8); padding: 12px 16px; border-radius: 8px;
          font-size: 15px; font-weight: 500; text-decoration: none; display: block;
        }
        .mobile-nav-link:hover { background: rgba(255,255,255,0.08); color: white; }
        .mobile-auth { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 8px; }
        .desktop-only { display: flex; }
        .mobile-only { display: none; }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
