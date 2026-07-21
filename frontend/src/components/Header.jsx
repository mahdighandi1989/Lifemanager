import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { unescapeHtml } from '../lib/text';
import NotificationBell from './NotificationBell';
import { LINKS as SIDEBAR_LINKS } from './Sidebar';

/**
 * GlobalSearch — the one query box over every content domain (critic #5/#7).
 * ≥2 chars → 300ms debounce → GET /api/search → grouped dropdown
 * (kind_fa badge + title + snippet). Click navigates to the hit's url and
 * clears; Escape / blur closes. Fail-open: a failed request just shows the
 * empty state, never breaks the header.
 */
function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef(null);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setResults(null);
      setOpen(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      api
        .get('/search', { params: { q: query } })
        .then((res) => {
          setResults(res.data?.results || []);
          setOpen(true);
        })
        .catch(() => {
          setResults([]);
          setOpen(true);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  const close = () => {
    setOpen(false);
    setResults(null);
    setQ('');
  };

  const pick = (r) => {
    close();
    if (r.url) navigate(r.url);
  };

  // Group hits by their Persian kind label so the dropdown reads as
  // «تسک / لیست / فرد …» sections.
  const groups = [];
  (results || []).forEach((r) => {
    const last = groups[groups.length - 1];
    if (last && last.kind_fa === r.kind_fa) last.items.push(r);
    else groups.push({ kind_fa: r.kind_fa, items: [r] });
  });

  return (
    <div className="relative" dir="rtl" data-testid="global-search">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => {
          if (results && results.length) setOpen(true);
        }}
        onBlur={() => {
          // Delay so a mousedown on a result still lands before close.
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            close();
            e.target.blur();
          }
        }}
        placeholder="جستجو در همه‌چیز…"
        aria-label="جستجوی سراسری"
        data-testid="global-search-input"
        className="w-32 sm:w-44 lg:w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      {open && results !== null && (
        <div
          data-testid="global-search-results"
          className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-1 sm:w-80 max-w-[calc(100vw-1.5rem)] max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-right"
        >
          {results.length === 0 ? (
            <p className="text-gray-400 text-sm p-3">چیزی پیدا نشد</p>
          ) : (
            groups.map((g, gi) => (
              <div key={`${g.kind_fa}-${gi}`} className="py-1">
                {g.items.map((r) => (
                  <button
                    key={`${r.kind}-${r.id}`}
                    type="button"
                    // onMouseDown so navigation wins the race against blur.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(r);
                    }}
                    data-testid={`search-result-${r.kind}-${r.id}`}
                    className="w-full text-right px-3 py-2 hover:bg-blue-50 flex items-start gap-2"
                  >
                    <span className="shrink-0 inline-block rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-[11px] mt-0.5">
                      {r.kind_fa}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-gray-800 truncate">
                        {unescapeHtml(r.title)}
                      </span>
                      {r.snippet && (
                        <span className="block text-xs text-gray-400 truncate">
                          {unescapeHtml(r.snippet)}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/projects', label: 'Projects' },
    { to: '/lists', label: 'لیست‌ها' },
    { to: '/notifications', label: 'اعلان‌ها' },
    // Only admins see the user-management link.
    ...(user?.is_admin ? [{ to: '/admin/users', label: 'مدیریت کاربران' }] : []),
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header data-testid="header" className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">
          <div className="flex items-center">
            {/* Mobile hamburger — Sidebar is hidden below md, this menu
                carries the full sidebar link set there. */}
            {isAuthenticated && (
              <button
                type="button"
                data-testid="mobile-menu-button"
                aria-label="منو"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden ml-2 p-2 rounded-md text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Lifemanager</span>
            </Link>
          </div>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1" aria-label="Primary">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  data-testid={`header-link-${to === '/' ? 'home' : to.slice(1)}`}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center space-x-3">
            {isAuthenticated && <GlobalSearch />}
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated ? (
              <>
                {user && (
                  <span className="text-sm text-gray-500 hidden sm:block">
                    {user.username || user.email}
                  </span>
                )}
                <button
                  data-testid="logout-button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="login-link"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  ورود
                </Link>
                <Link
                  to="/register"
                  data-testid="register-link"
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile slide-over menu — the full sidebar link set plus the
          header-only links (اعلان‌ها, admin) so nothing reachable on desktop
          is lost below md. Closes on navigate. */}
      {isAuthenticated && mobileOpen && (
        <nav
          data-testid="mobile-menu"
          aria-label="Mobile"
          dir="rtl"
          className="md:hidden absolute top-16 inset-x-0 bg-white border-b border-gray-200 shadow-lg z-40 flex flex-col p-3 space-y-1"
        >
          {[
            ...SIDEBAR_LINKS,
            { to: '/notifications', label: 'اعلان‌ها', testid: 'link-notifications' },
            ...(user?.is_admin
              ? [{ to: '/admin/users', label: 'مدیریت کاربران', testid: 'link-admin-users' }]
              : []),
          ].map(({ to, label, testid }) => (
            <Link
              key={to}
              to={to}
              data-testid={`mobile-${testid}`}
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Header;
