/**
 * Sidebar — secondary navigation for desktop layouts.
 *
 * Mirrors the link set in Header so a wide-screen user has a persistent
 * vertical nav, while small screens still have the top-bar Header. The
 * AC for this task asserts data-testid='sidebar' is visible on every
 * page, hence the testid plus the unconditional render in Layout.
 *
 * 2026-07-22 «خداشهر» redesign (owner's correction of the v1 sahat menu —
 * «مسجد نخواستم، خداشهر می‌خواهم»): the life group IS the city. The map
 * («نقشهٔ خداشهر») plus its four districts (خدا / خود / دیگران / محیط) are
 * the resting navigation of life; each district page aggregates the live
 * content of that sahat and links into every tool page. The tool pages
 * themselves stay one click away behind «بیشتر» (quarantine-not-delete:
 * every route + ``sidebar-link-*`` testid is unchanged) AND are linked
 * prominently from inside the districts — nav by meaning first, by tool
 * second.
 */
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// group keys → Persian section headers (rendered only in the desktop Sidebar).
export const NAV_GROUPS = [
  ['daily', 'روزانه'],
  ['life', 'خداشهر'],
  ['life_pages', 'صفحه‌های زندگی'],
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

  // خداشهر — the map + the four districts. `/sahat` keeps its testid.
  { to: '/sahat', label: '🏙 نقشهٔ خداشهر', testid: 'sidebar-link-sahat', group: 'life' },
  { to: '/sahat/khoda', label: '🕋 رابطه با خدا', testid: 'sidebar-link-sahat-khoda', group: 'life' },
  { to: '/sahat/khod', label: '💠 خود — جان و تن و ذهن', testid: 'sidebar-link-sahat-khod', group: 'life' },
  { to: '/sahat/digaran', label: '🤝 رابطه با دیگران', testid: 'sidebar-link-sahat-digaran', group: 'life' },
  { to: '/sahat/mohit', label: '🌍 محیط و اموال', testid: 'sidebar-link-sahat-mohit', group: 'life' },

  // صفحه‌های زندگی — the tool pages, one click away behind «بیشتر»
  // (quarantine-not-delete: every route/testid unchanged; the district pages
  // link into each of them with live data).
  { to: '/life-file', label: 'پروندهٔ زندگی', testid: 'sidebar-link-life-file', group: 'life_pages' },
  { to: '/budget', label: 'مالی', testid: 'sidebar-link-finance', group: 'life_pages' },
  { to: '/people-profiles', label: 'افراد', testid: 'sidebar-link-people', group: 'life_pages' },
  { to: '/writings', label: 'نوشته‌های من', testid: 'sidebar-link-writings', group: 'life_pages' },
  { to: '/self-portrait', label: 'خودنگاره (علاقه/اراده)', testid: 'sidebar-link-self-portrait', group: 'life_pages' },
  { to: '/brain', label: 'رشد ذهن و هوش', testid: 'sidebar-link-brain', group: 'life_pages' },
  { to: '/projects', label: 'پروژه‌ها', testid: 'sidebar-link-projects', group: 'life_pages' },
  // 2026-07-25: «مرکز توسعه» is not a debug tool — it is the owner's WORK
  // (repos, services, the daily Persian report). It sits with the life pages
  // now instead of at the bottom next to the system tools. Route + testid
  // unchanged.
  { to: '/dev-center', label: 'کار و توسعه', testid: 'sidebar-link-dev-center', group: 'life_pages' },
  // 2026-08-01: صفحهٔ «من که هستم» ساخته شد ولی هیچ دری نداشت — فقط با تایپِ
  // آدرس باز می‌شد. یک صفحه‌ای که از منو دیده نشود، عملاً وجود ندارد.
  { to: '/identity-profile', label: 'من که هستم', testid: 'sidebar-link-identity-profile', group: 'life_pages' },
  { to: '/places', label: 'کجاها بوده‌ام', testid: 'sidebar-link-places', group: 'life_pages' },

  // ابزار — helpers.
  { to: '/assistant', label: 'دستیار هوشمند', testid: 'sidebar-link-assistant', group: 'tools' },
  // «داده» already contains the dedup/merge tool as its own tab; the separate
  // top-level «پاک‌سازی و ادغام» entry pointed at the same surface, so the menu
  // now has one door (the /merge route is unchanged and still resolves).
  { to: '/import', label: 'داده (ایمپورت و ادغام)', testid: 'sidebar-link-data', group: 'tools' },
  { to: '/settings', label: 'تنظیمات', testid: 'sidebar-link-settings', group: 'tools' },

  // سیستم و فنی — developer/meta tools (kept, quarantined to the bottom).
  { to: '/system-map', label: 'نقشهٔ سیستم', testid: 'sidebar-link-system-map', group: 'system' },
  { to: '/activity-log', label: 'لاگ فعالیت‌ها', testid: 'sidebar-link-activity-log', group: 'system' },
];

// Alias routes that render an existing hub: visiting them must light up (and
// open the drawer for) the entry that owns them. Without this the owner lands
// on e.g. /people/3/profile or /notifications and the menu looks unrelated.
export const NAV_ALIASES = {
  '/budget': ['/finance', '/assets'],
  '/people-profiles': ['/people/'],
  '/import': ['/drive-files', '/merge'],
  '/assistant': ['/recommendations', '/personality', '/career-planning'],
  '/settings': ['/notifications', '/ai-settings'],
  '/lists': ['/lists/'],
};

// Resting sidebar = روزانه + خداشهر; everything else behind one «بیشتر»
// drawer. Nothing is removed — the drawer holds them one click away and every
// route/testid is unchanged. The mobile menu (Header) still lists all.
const PRIMARY_GROUPS = ['daily', 'life'];
const SECONDARY_GROUPS = ['life_pages', 'tools', 'system'];

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (location.pathname.startsWith(path)) return true;
    return (NAV_ALIASES[path] || []).some((alias) => location.pathname.startsWith(alias));
  };

  // The map link should not light up on district pages (they have their own
  // entries) — exact match for '/sahat', startsWith for the rest.
  const isActiveNav = (path) =>
    path === '/sahat' ? location.pathname === '/sahat' : isActive(path);

  const secondaryLinks = LINKS.filter((l) => SECONDARY_GROUPS.includes(l.group));
  const onSecondary = secondaryLinks.some((l) => isActive(l.to));
  const [showMore, setShowMore] = useState(() => onSecondary);

  // v1 bug fix: the auto-open only ran on mount, so an SPA navigation into a
  // drawer page (e.g. Dashboard → /merge) left the user on a page whose nav
  // entry was hidden. Open the drawer whenever the route lands inside it
  // (never auto-close — closing is the user's call).
  useEffect(() => {
    if (onSecondary) setShowMore(true);
  }, [onSecondary]);

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
              isActiveNav(to)
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

        {/* «بیشتر» — one door for the tool pages + settings + system */}
        <button
          type="button"
          data-testid="sidebar-more-toggle"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className="mt-2 flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"
        >
          <span>{showMore ? 'کمتر' : 'بیشتر (صفحه‌ها و ابزارها)'}</span>
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
