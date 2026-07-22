// خداشهر — shared sahat vocabulary for every page (single source of truth on
// the frontend; mirrors app/services/sahat_service.SAHATS). The city has four
// fiqhi relations; «خود» carries three facets. Colors are Tailwind utility
// sets so chips/cards/bars stay consistent across pages.

export const SAHAT_META = {
  khoda: {
    fa: 'رابطه با خدا', short: 'خدا', icon: '🕋',
    bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ring: 'border-emerald-200',
  },
  khod_ravan: {
    fa: 'خود — روان و اراده', short: 'روان', icon: '💠',
    bar: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700 border-violet-200',
    ring: 'border-violet-200',
  },
  khod_aql: {
    fa: 'خود — عقل و ذهن', short: 'عقل', icon: '📚',
    bar: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700 border-blue-200',
    ring: 'border-blue-200',
  },
  khod_jesm: {
    fa: 'خود — جسم و سلامت', short: 'جسم', icon: '💪',
    bar: 'bg-orange-500', chip: 'bg-orange-50 text-orange-700 border-orange-200',
    ring: 'border-orange-200',
  },
  digaran: {
    fa: 'رابطه با دیگران', short: 'دیگران', icon: '🤝',
    bar: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 border-rose-200',
    ring: 'border-rose-200',
  },
  mohit: {
    fa: 'رابطه با محیط و اموال', short: 'محیط', icon: '🌍',
    bar: 'bg-teal-500', chip: 'bg-teal-50 text-teal-700 border-teal-200',
    ring: 'border-teal-200',
  },
};

export const SAHAT_KEYS = Object.keys(SAHAT_META);

// Navigation districts («محله‌ها»): the sidebar + map drill into these.
// 'khod' is the combined district of the three facets of self.
export const DISTRICTS = [
  { key: 'khoda', fa: 'رابطه با خدا', icon: '🕋' },
  { key: 'khod', fa: 'خود — جان و تن و ذهن', icon: '💠' },
  { key: 'digaran', fa: 'رابطه با دیگران', icon: '🤝' },
  { key: 'mohit', fa: 'محیط و اموال', icon: '🌍' },
];

// Honest severity badges — the machine flags PROBABILITY, never a verdict.
// kind comes from the backend attention item; kind_fa is its label.
export const ATTENTION_KIND_CLS = {
  haq_probable: 'bg-red-100 text-red-700',
  ahd: 'bg-orange-100 text-orange-700',
  zarar: 'bg-orange-100 text-orange-700',
  selleh: 'bg-pink-100 text-pink-700',
  growth: 'bg-amber-100 text-amber-700',
  clutter: 'bg-gray-100 text-gray-600',
};

export function scoreColor(s) {
  if (s == null) return 'text-gray-300';
  if (s >= 70) return 'text-green-600';
  if (s >= 40) return 'text-amber-600';
  return 'text-red-600';
}
