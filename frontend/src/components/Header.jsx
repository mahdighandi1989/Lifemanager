import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/projects', label: 'Projects' },
    { to: '/lists', label: 'لیست‌ها' },
    { to: '/self-improvement', label: 'خودسازی' },
    { to: '/notifications', label: 'اعلان‌ها' },
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
    <header data-testid="header" className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Lifemanager</span>
            </Link>
          </div>

          {isAuthenticated && (
            <nav className="flex items-center space-x-1" aria-label="Primary">
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
    </header>
  );
}

export default Header;