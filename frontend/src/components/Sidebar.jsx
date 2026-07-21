/**
 * Sidebar — secondary navigation for desktop layouts.
 *
 * Mirrors the link set in Header so a wide-screen user has a persistent
 * vertical nav, while small screens still have the top-bar Header. The
 * AC for this task asserts data-testid='sidebar' is visible on every
 * page, hence the testid plus the unconditional render in Layout.
 *
 * 2026-07-21 nav audit (owner request): the flat list was disordered, mixed
 * English labels into an otherwise all-Persian RTL app, and buried
 * developer/meta pages (مرکز توسعه، نقشهٔ سیستم، لاگ فعالیت‌ها) among the
 * life pages. Reorganised into four intent groups, all-Persian labels, with
 * the system/dev tools quarantined at the BOTTOM. Nothing was removed — every
 * route still resolves and every ``sidebar-link-*`` testid is unchanged; only
 * order + labels + a ``group`` tag changed. ``LINKS`` stays a flat export so
 * Header's mobile menu keeps working (it ignores ``group``).
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// group keys → Persian section headers (rendered only in the desktop Sidebar).
export const NAV_GROUPS = [
  ['daily', 'روزانه'],
  ['life', 'زندگی'],
  ['tools', 'ابزار'],
  ['system', 'سیستم و فنی'],
];

export const LINKS = [
  // روزانه — what you touch every day.
  { to: '/', label: 'میز فرمان', testid: 'sidebar-link-dashboard', group: 'daily' },
  { to: '/directives', label: 'مسیر نهادینه‌سازی', testid: 'sidebar-link-directives', group: 'daily' },
  { to: '/tasks', label: 'کارها', testid: 'sidebar-link-tasks', group: 'daily' },
  { to: '/lists', label: 'لیست‌ها', testid: 'sidebar-link-lists', group: 'daily' },
  { to: '/attention', label: 'مراقبت و مرور', testid: 'sidebar-link-attention', group: 'daily' },

  // زندگی — your data / content.
  { to: '/life-file', label: 'پروندهٔ زندگی', testid: 'sidebar-link-life-file', group: 'life' },
  { to: '/budget', label: 'مالی', testid: 'sidebar-link-finance', group: 'life' },
  { to: '/people-profiles', label: 'افراد', testid: 'sidebar-link-people', group: 'life' },
  { to: '/writings', label: 'نوشته‌های من', testid: 'sidebar-link-writings', group: 'life' },
  { to: '/brain', label: 'رشد ذهن و هوش', testid: 'sidebar-link-brain', group: 'life' },
  { to: '/projects', label: 'پروژه‌ها', testid: 'sidebar-link-projects', group: 'life' },

  // ابزار — helpers.
  { to: '/assistant', label: 'دستیار هوشمند', testid: 'sidebar-link-assistant', group: 'tools' },
  { to: '/import', label: 'داده', testid: 'sidebar-link-data', group: 'tools' },
  // The dedup/merge tool already lived at /merge (a tab inside «داده») but was
  // undiscoverable — the owner asked why duplicate projects/tasks pile up. A
  // top-level link surfaces the reversible "find similar → merge" flow.
  { to: '/merge', label: 'پاک‌سازی و ادغام', testid: 'sidebar-link-merge', group: 'tools' },
  { to: '/settings', label: 'تنظیمات', testid: 'sidebar-link-settings', group: 'tools' },

  // سیستم و فنی — developer/meta tools (kept, quarantined to the bottom).
  { to: '/dev-center', label: 'مرکز توسعه', testid: 'sidebar-link-dev-center', group: 'system' },
  { to: '/system-map', label: 'نقشهٔ سیستم', testid: 'sidebar-link-system-map', group: 'system' },
  { to: '/activity-log', label: 'لاگ فعالیت‌ها', testid: 'sidebar-link-activity-log', group: 'system' },
];

// 2026-07-22 «اختاپوس» fix (owner: too many always-visible pages → overwhelm).
// Keep the DAILY + LIFE groups visible; collapse TOOLS + SYSTEM behind one
// «بیشتر» drawer so the resting sidebar is short and the owner isn't forced to
// scan 18 doors. Nothing is removed — the drawer holds them one click away and
// every route/testid is unchanged. The mobile menu (Header) still lists all.
const PRIMARY_GROUPS = ['daily', 'life'];
const SECONDARY_GROUPS = ['tools', 'system'];

function Sidebar() {
  const location = useLocation();
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Auto-open the drawer when the current page lives inside it, so the user is
  // never on a page whose nav entry is hidden.
  const secondaryLinks = LINKS.filter((l) => SECONDARY_GROUPS.includes(l.group));
  const [showMore, setShowMore] = useState(() => secondaryLinks.some((l) => isActive(l.to)));

  const renderGroup = (key, title) => {
    const items = LINKS.filter((l) => l.group === key);
    if (items.length === 0) return null;
    return (
      <div key={key} className="mb-1">
        <div className="px-3 pt-3 pb-1 text-[11px] font-semibold text-gray-400 select-none">
          {title}
        </div>
        {items.map(({ to, label, testid }) => (
          <Link
            key={to}
            to={to}
            data-testid={testid}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(to)
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <aside
      data-testid="sidebar"
      className="hidden md:flex md:flex-col md:w-56 md:shrink-0 bg-white border-l border-gray-200"
    >
      <nav className="flex flex-col p-3 space-y-1" aria-label="Sidebar">
        {NAV_GROUPS.filter(([key]) => PRIMARY_GROUPS.includes(key)).map(([key, title]) =>
          renderGroup(key, title),
        )}

        {/* «بیشتر» — one door for tools + system + settings */}
        <button
          type="button"
          data-testid="sidebar-more-toggle"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className="mt-2 flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"
        >
          <span>{showMore ? 'کمتر' : 'بیشتر (ابزارها و تنظیمات)'}</span>
          <span className="text-xs">{showMore ? '▲' : '▼'}</span>
        </button>

        {showMore &&
          NAV_GROUPS.filter(([key]) => SECONDARY_GROUPS.includes(key)).map(([key, title]) =>
            renderGroup(key, title),
          )}
      </nav>
    </aside>
  );
}

export default Sidebar;
