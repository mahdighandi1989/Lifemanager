import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Projects from './Projects';
import DevProjectsOverview from '../components/DevProjectsOverview';
import ActivityLogPanel from '../components/ActivityLogPanel';

// «پروژه‌ها» hub — internal life projects + a dev-projects overview.
//
// 2026-07-21 audit («کمتر ولی زنده»): the «پروژه‌های خارجی» tab
// (ExternalProjects — connectors to Jira/Linear/Asana) was a dead surface for
// a single-tenant personal owner who uses none of those tools, so it is
// quarantined from the tab bar. The ExternalProjects page + its /api/external
// backend and the /external-projects route are UNCHANGED (rule 2 —
// quarantine-not-delete; /external-projects still resolves here and lands on
// the default tab). See docs/overhaul/REMOVAL_CANDIDATES.md.

// 2026-07-25 tidy-up: «پروژه‌های توسعه» was the same DevProjectsOverview that
// «مرکز توسعه» already renders — one content, two doors. The tab is retired
// from the bar and replaced by a link to /dev-center (component + route
// untouched; the tab still opens via ?tab=dev — see REMOVAL_CANDIDATES.md).
const TABS = [
  { id: 'mine', label: 'پروژه‌های من', match: ['/projects'] },
];

// «این تب‌ها چی‌ان؟» — one honest sentence per tab (owner asked). Shown under
// the tab bar so each view explains itself.
const TAB_HINTS = {
  mine:
    'پروژه‌های زندگی خودت — دسته‌هایی که خودت می‌سازی (مثل «خانه»، «مهاجرت»، «پروژه‌های نرم‌افزاری») تا وظایف بهشان وصل شوند و کارنامهٔ پروژه‌های توسعه هم ذیلشان ثبت شود.',
  dev:
    'مخزن‌های گیت‌هاب و سرویس‌های رندر تو — همگام‌سازی خودکار، خطاهای باز، و کارنامهٔ روزانهٔ فارسی. جزئیات کامل در «مرکز توسعه».',
};

function initialTab() {
  try {
    const { search } = window.location;
    const q = new URLSearchParams(search).get('tab');
    // 'dev' is no longer in the bar but ?tab=dev still opens it (old links keep
    // working — quarantine, not deletion).
    if (q && (TABS.some((t) => t.id === q) || q === 'dev')) return q;
  } catch { /* no window */ }
  return 'mine';
}

function ProjectsHub() {
  const [tab, setTab] = useState(initialTab());
  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="projects-hub">
      <div className="max-w-4xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">پروژه‌ها</h1>
        <div className="flex gap-1 mb-6 border-b border-gray-200" data-testid="projects-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`projects-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {TAB_HINTS[tab] && (
          <p className="text-xs text-gray-500 -mt-3 mb-4 leading-relaxed" data-testid="projects-tab-hint">
            {TAB_HINTS[tab]}
          </p>
        )}
        {tab === 'mine' && (
          <p className="text-xs text-gray-500 mb-4">
            پروژه‌های نرم‌افزاری و مخزن‌هایت در{' '}
            <Link to="/dev-center" data-testid="projects-to-dev-center" className="text-blue-600 hover:underline">
              مرکز توسعه
            </Link>{' '}
            هستند.
          </p>
        )}
        <div data-testid={`projects-panel-${tab}`}>
          {tab === 'mine' && <Projects embedded />}
          {tab === 'dev' && <DevProjectsOverview embedded={false} />}
        </div>

        {/* لاگ بخش پروژه‌ها */}
        {tab === 'mine' && <ActivityLogPanel entityType="project" title="لاگ پروژه‌ها" />}
        {tab === 'dev' && (
          <ActivityLogPanel entityType="dev_project,dev_service" title="لاگ پروژه‌های توسعه" />
        )}
      </div>
    </div>
  );
}

export default ProjectsHub;
