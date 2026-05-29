/**
 * Sidebar — secondary navigation for desktop layouts.
 *
 * Mirrors the link set in Header so a wide-screen user has a persistent
 * vertical nav, while small screens still have the top-bar Header. The
 * AC for this task asserts data-testid='sidebar' is visible on every
 * page, hence the testid plus the unconditional render in Layout.
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Dashboard', testid: 'sidebar-link-dashboard' },
  { to: '/tasks', label: 'Tasks', testid: 'sidebar-link-tasks' },
  { to: '/projects', label: 'Projects', testid: 'sidebar-link-projects' },
  { to: '/lists', label: 'لیست‌ها', testid: 'sidebar-link-lists' },
  { to: '/budget', label: 'برنامه و بودجه', testid: 'sidebar-link-budget' },
  { to: '/people-profiles', label: 'افراد', testid: 'sidebar-link-people' },
  {
    to: '/external-projects',
    label: 'پروژه‌های خارجی',
    testid: 'sidebar-link-external-projects',
  },
  {
    to: '/ai-settings',
    label: 'تنظیمات هوش مصنوعی',
    testid: 'sidebar-link-ai-settings',
  },
  { to: '/settings', label: 'تنظیمات', testid: 'sidebar-link-settings' },
  { to: '/assistant', label: 'پیشنهادات هوشمند', testid: 'sidebar-link-assistant' },
  { to: '/recommendations', label: 'تاریخچه پیشنهادات', testid: 'sidebar-link-recommendations' },
  { to: '/assets', label: 'دارایی‌ها', testid: 'sidebar-link-assets' },
  { to: '/merge', label: 'ادغام تسک‌ها', testid: 'sidebar-link-merge' },
  {
    to: '/notifications',
    label: 'اعلان‌ها',
    testid: 'sidebar-link-notifications',
  },
];

function Sidebar() {
  const location = useLocation();
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside
      data-testid="sidebar"
      className="hidden md:flex md:flex-col md:w-56 md:shrink-0 bg-white border-l border-gray-200"
    >
      <nav className="flex flex-col p-3 space-y-1" aria-label="Sidebar">
        {LINKS.map(({ to, label, testid }) => (
          <Link
            key={to}
            to={to}
            data-testid={testid}
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
    </aside>
  );
}

export default Sidebar;
