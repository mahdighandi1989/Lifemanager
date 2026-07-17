/**
 * Shared presentation helpers for the activity log (لاگ فعالیت‌ها) — used by
 * both the global /activity-log page and the per-section ActivityLogPanel so
 * the two stay consistent: same Persian labels, same chip colors, same
 * deep-link rules.
 */

// entity_type → Persian label.
export const ENTITY_FA = {
  task: 'تسک',
  project: 'پروژه',
  list: 'لیست',
  todo_item: 'آیتم لیست',
  person: 'فرد',
  deed: 'رفتار (خوب/بد)',
  person_note: 'یادداشت فرد',
  income: 'درآمد',
  asset: 'دارایی',
  account: 'حساب مالی',
  transaction: 'تراکنش',
  writing: 'نوشته',
  brain_upload: 'داده ذهن',
  notification: 'اعلان',
  auth: 'ورود/خروج',
};

// action → Persian verb.
export const VERB_FA = {
  create: 'ایجاد',
  update: 'ویرایش',
  delete: 'حذف',
  complete: 'تکمیل',
  import: 'ورود اطلاعات',
  upload: 'بارگذاری',
  analyze: 'تحلیل',
  export: 'خروجی',
  print: 'چاپ',
  login: 'ورود',
  logout: 'خروج',
};

// action → Tailwind chip classes (fallback: gray).
export const ACTION_COLORS = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  complete: 'bg-emerald-100 text-emerald-700',
  import: 'bg-indigo-100 text-indigo-700',
  upload: 'bg-teal-100 text-teal-700',
  analyze: 'bg-violet-100 text-violet-700',
  export: 'bg-amber-100 text-amber-700',
  print: 'bg-amber-100 text-amber-700',
  login: 'bg-purple-100 text-purple-700',
  logout: 'bg-purple-100 text-purple-700',
};

export function actionLabel(action) {
  return VERB_FA[action] || action || '';
}

// «verb + entity» summary, e.g. «ایجاد تسک».
export function activityWhat(e) {
  const verb = VERB_FA[e.action] || e.action || '';
  const ent = e.entity_type ? ENTITY_FA[e.entity_type] || e.entity_type : '';
  return ent ? `${verb} ${ent}` : verb;
}

/**
 * Deep-link for an entry: the page/section the acted-on record lives in.
 * Child records route through their owning context (todo item → its list,
 * deed/note → its person, transaction → مالی). Returns '' when there is
 * nothing to link to.
 */
export function activityLink(e) {
  const id = e.entity_id;
  switch (e.entity_type) {
    case 'task':
      return '/tasks';
    case 'project':
      return '/projects';
    case 'list':
      return id ? `/lists/${id}` : '/lists';
    case 'todo_item':
      return e.context_type === 'list' && e.context_id
        ? `/lists/${e.context_id}`
        : '/lists';
    case 'person':
      return id ? `/people/${id}/profile` : '/people-profiles';
    case 'deed':
    case 'person_note':
      return e.context_id ? `/people/${e.context_id}/profile` : '/people-profiles';
    case 'income':
    case 'asset':
    case 'account':
    case 'transaction':
      return '/budget';
    case 'writing':
      return '/writings';
    case 'brain_upload':
      return '/brain';
    case 'notification':
      return '/notifications';
    default:
      return '';
  }
}

// Jalali date-time via the fa-IR locale (falls back to the raw string).
export function formatWhen(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso).slice(0, 16);
  }
}
