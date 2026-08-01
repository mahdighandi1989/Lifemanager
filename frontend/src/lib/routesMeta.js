/**
 * routesMeta — THE single source of truth for the SPA's pages.
 *
 * Consumed by THREE readers, which is exactly what keeps the live system
 * diagram (نقشهٔ سیستم) honest:
 *   1. App.jsx renders its <Route> tree from this list — a page missing
 *      here does not route at all, so the list cannot go stale.
 *   2. lib/api.js matches window.location.pathname against these patterns
 *      to stamp the X-LM-Page header on every API call (the live diagram
 *      learns its page→router wires from that real traffic).
 *   3. The backend's system_graph_service.py PARSES THIS FILE with a
 *      line-based regex to draw the page cards.
 *
 * ⚠️ FORMAT IS LOAD-BEARING: keep ONE entry per line, single quotes, and
 * the exact key order `path, page, label, group` — the backend regex
 * depends on it. `page` must equal the component filename in src/pages/.
 */
export const ROUTES = [
  // Public (no auth wrapper)
  { path: '/login', page: 'Login', label: 'ورود', group: 'public', isPublic: true },
  { path: '/register', page: 'Register', label: 'ثبت‌نام', group: 'public', isPublic: true },
  { path: '/welcome', page: 'Home', label: 'خوش‌آمد', group: 'public', isPublic: true },

  // روزانه
  { path: '/', page: 'Dashboard', label: 'میز فرمان', group: 'daily' },
  { path: '/tasks', page: 'Tasks', label: 'کارها', group: 'daily' },
  { path: '/lists', page: 'Lists', label: 'لیست‌ها', group: 'daily' },
  { path: '/lists/:listId', page: 'ListDetail', label: 'جزئیات لیست', group: 'daily' },
  { path: '/directives', page: 'DirectivesPage', label: 'مسیر نهادینه‌سازی', group: 'daily' },
  { path: '/attention', page: 'AttentionCenter', label: 'مراقبت و مرور', group: 'daily' },

  // خداشهر
  { path: '/sahat', page: 'SahatMap', label: 'نقشهٔ خداشهر', group: 'life' },
  { path: '/sahat/:key', page: 'SahatDetail', label: 'ساحت', group: 'life' },

  // صفحه‌های زندگی
  { path: '/projects', page: 'ProjectsHub', label: 'پروژه‌ها', group: 'life_pages' },
  { path: '/projects/:id', page: 'ProjectDetailPage', label: 'جزئیات پروژه', group: 'life_pages' },
  { path: '/external-projects', page: 'ProjectsHub', label: 'پروژه‌های بیرونی', group: 'life_pages' },
  { path: '/budget', page: 'FinanceHub', label: 'مالی', group: 'life_pages' },
  { path: '/finance', page: 'FinanceHub', label: 'مالی', group: 'life_pages' },
  { path: '/assets', page: 'FinanceHub', label: 'دارایی‌ها', group: 'life_pages' },
  { path: '/life-file', page: 'LifeFilePage', label: 'پروندهٔ زندگی', group: 'life_pages' },
  { path: '/people-profiles', page: 'PeopleProfiles', label: 'افراد', group: 'life_pages' },
  { path: '/people/:id/profile', page: 'PersonProfilePage', label: 'پروفایل فرد', group: 'life_pages' },
  { path: '/writings', page: 'Writings', label: 'نوشته‌های من', group: 'life_pages' },
  { path: '/self-portrait', page: 'SelfPortrait', label: 'خودنگاره', group: 'life_pages' },
  { path: '/identity-profile', page: 'IdentityProfile', label: 'من که هستم', group: 'life_pages' },
  { path: '/places', page: 'PlacesMap', label: 'کجاها بوده‌ام', group: 'life_pages' },
  { path: '/brain', page: 'BrainDashboard', label: 'رشد ذهن و هوش', group: 'life_pages' },
  { path: '/dev-center', page: 'DevCenter', label: 'کار و توسعه', group: 'life_pages' },

  // ابزار
  { path: '/assistant', page: 'AssistantHub', label: 'دستیار هوشمند', group: 'tools' },
  { path: '/recommendations', page: 'AssistantHub', label: 'پیشنهادات', group: 'tools' },
  { path: '/personality', page: 'AssistantHub', label: 'شخصیت', group: 'tools' },
  { path: '/career-planning', page: 'AssistantHub', label: 'ترسیم آینده', group: 'tools' },
  { path: '/import', page: 'DataHub', label: 'داده (ایمپورت و ادغام)', group: 'tools' },
  { path: '/drive-files', page: 'DataHub', label: 'فایل‌های درایو', group: 'tools' },
  { path: '/merge', page: 'DataHub', label: 'ادغام', group: 'tools' },
  { path: '/settings', page: 'Settings', label: 'تنظیمات', group: 'tools' },
  { path: '/settings/notifications', page: 'Settings', label: 'تنظیمات اعلان', group: 'tools' },
  { path: '/settings/ai-models', page: 'Settings', label: 'تنظیمات مدل‌ها', group: 'tools' },
  { path: '/ai-settings', page: 'AISettings', label: 'تنظیمات AI', group: 'tools' },
  { path: '/notifications', page: 'Notifications', label: 'اعلان‌ها', group: 'tools' },

  // سیستم و فنی
  { path: '/system-map', page: 'SystemMapPage', label: 'نقشهٔ سیستم', group: 'system' },
  { path: '/activity-log', page: 'ActivityLogPage', label: 'لاگ فعالیت‌ها', group: 'system' },
  { path: '/admin/users', page: 'AdminUsers', label: 'مدیریت کاربران', group: 'system' },
];

/**
 * Match a concrete pathname (/lists/5) to its route pattern (/lists/:listId).
 * Most-specific wins: exact segment matches beat parameter segments.
 * Returns the pattern string, or null when nothing matches.
 */
export function matchRoutePattern(pathname) {
  if (typeof pathname !== 'string') return null;
  const target = pathname.split('?')[0].split('/').filter(Boolean);
  let best = null;
  let bestScore = -1;
  for (const { path } of ROUTES) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length !== target.length) continue;
    let score = 0;
    let matched = true;
    for (let i = 0; i < parts.length; i += 1) {
      if (parts[i].startsWith(':')) continue;
      if (parts[i] === target[i]) score += 1;
      else { matched = false; break; }
    }
    if (matched && score > bestScore) { best = path; bestScore = score; }
  }
  if (best === null && target.length === 0) return '/';
  return best;
}
