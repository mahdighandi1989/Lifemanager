import React, { useState } from 'react';
import SmartAssistant from './SmartAssistant';
import Recommendations from './Recommendations';
import PersonalityProfilePage from './PersonalityProfilePage';
import CareerPlanningPage from './CareerPlanningPage';

// «دستیار هوشمند» hub — groups the AI-driven personal-insight pages as tabs
// (Smart Assistant + Recommendations history + Personality profile + Career
// planning). Pages reused unchanged via their `embedded` prop.

// 2026-07-25 tidy-up (per the whole-app survey): «تاریخچه پیشنهادات» showed the
// SAME live suggestions as the first tab (not a history), and «پروفایل شخصیت» /
// «ترسیم آینده» are AI-key-dependent surfaces with no clear job yet. They are
// quarantined from the tab bar — the pages, their routes (/recommendations,
// /personality, /career-planning) and ?tab=… deep links all still work.
// See docs/overhaul/REMOVAL_CANDIDATES.md.
const TABS = [
  { id: 'assistant', label: 'پیشنهادات هوشمند', match: ['/assistant'] },
];

const QUARANTINED_TABS = [
  { id: 'recommendations', label: 'تاریخچه پیشنهادات', match: ['/recommendations'] },
  { id: 'personality', label: 'پروفایل شخصیت', match: ['/personality'] },
  { id: 'career', label: 'ترسیم آینده', match: ['/career-planning'] },
];
const ALL_TABS = [...TABS, ...QUARANTINED_TABS];

function initialTab() {
  try {
    const { pathname, search } = window.location;
    const q = new URLSearchParams(search).get('tab');
    if (q && ALL_TABS.some((t) => t.id === q)) return q;
    // A direct route (/personality, /career-planning, …) still lands on its own
    // panel — only the tab bar got shorter.
    const hit = ALL_TABS.find((t) => t.match.some((p) => pathname.startsWith(p)));
    if (hit) return hit.id;
  } catch { /* no window */ }
  return 'assistant';
}

function AssistantHub() {
  const [tab, setTab] = useState(initialTab());
  // A quarantined tab reached by its own route/deep-link still shows in the bar
  // while it is active, so the user can see where they are.
  const visibleTabs = TABS.some((t) => t.id === tab)
    ? TABS
    : [...TABS, ...QUARANTINED_TABS.filter((t) => t.id === tab)];
  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="assistant-hub">
      <div className="max-w-4xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">دستیار هوشمند</h1>
        <div className="flex gap-1 mb-6 border-b border-gray-200 flex-wrap" data-testid="assistant-tabs">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              data-testid={`assistant-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div data-testid={`assistant-panel-${tab}`}>
          {tab === 'assistant' && <SmartAssistant embedded />}
          {tab === 'recommendations' && <Recommendations embedded />}
          {tab === 'personality' && <PersonalityProfilePage embedded />}
          {tab === 'career' && <CareerPlanningPage embedded />}
        </div>
      </div>
    </div>
  );
}

export default AssistantHub;
