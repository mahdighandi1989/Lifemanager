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

// Related pages are grouped into tabbed hubs (Finance / Assistant / Data /
// Settings). The individual pages still exist and their original routes still
// resolve (now opening the right hub tab) — nav is decluttered, nothing deleted.
// Exported so Header's mobile menu renders the exact same link set.
export const LINKS = [
  { to: '/', label: 'Dashboard', testid: 'sidebar-link-dashboard' },
  { to: '/directives', label: 'مسیر نهادینه‌سازی', testid: 'sidebar-link-directives' },
  { to: '/tasks', label: 'Tasks', testid: 'sidebar-link-tasks' },
  { to: '/projects', label: 'Projects', testid: 'sidebar-link-projects' },
  { to: '/dev-center', label: 'مرکز توسعه', testid: 'sidebar-link-dev-center' },
  { to: '/lists', label: 'لیست‌ها', testid: 'sidebar-link-lists' },
  { to: '/writings', label: 'نوشته‌های من', testid: 'sidebar-link-writings' },
  { to: '/brain', label: 'رشد ذهن و هوش', testid: 'sidebar-link-brain' },
  { to: '/people-profiles', label: 'افراد', testid: 'sidebar-link-people' },
  // Hubs:
  { to: '/budget', label: 'مالی', testid: 'sidebar-link-finance' },
  { to: '/life-file', label: 'پروندهٔ زندگی', testid: 'sidebar-link-life-file' },
  { to: '/assistant', label: 'دستیار هوشمند', testid: 'sidebar-link-assistant' },
  { to: '/import', label: 'داده', testid: 'sidebar-link-data' },
  { to: '/attention', label: 'مراقبت و مرور', testid: 'sidebar-link-attention' },
  { to: '/activity-log', label: 'لاگ فعالیت‌ها', testid: 'sidebar-link-activity-log' },
  { to: '/system-map', label: 'نقشهٔ سیستم', testid: 'sidebar-link-system-map' },
  { to: '/settings', label: 'تنظیمات', testid: 'sidebar-link-settings' },
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
