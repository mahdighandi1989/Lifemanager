import React, { useState } from 'react';
import Projects from './Projects';
import ExternalProjects from './ExternalProjects';
import DevProjectsOverview from '../components/DevProjectsOverview';
import ActivityLogPanel from '../components/ActivityLogPanel';

// «پروژه‌ها» hub — unifies internal projects and third-party (external) PM
// projects into one tabbed page (owner request: "یکی باشه فعلا بهتره"). Both
// page components are reused unchanged via their `embedded` prop; the existing
// /projects and /external-projects routes still resolve here.

const TABS = [
  { id: 'mine', label: 'پروژه‌های من', match: ['/projects'] },
  { id: 'external', label: 'پروژه‌های خارجی', match: ['/external-projects'] },
  { id: 'dev', label: 'پروژه‌های توسعه', match: [] },
];

// «این تب‌ها چی‌ان؟» — one honest sentence per tab (owner asked). Shown under
// the tab bar so each view explains itself.
const TAB_HINTS = {
  mine:
    'پروژه‌های زندگی خودت — دسته‌هایی که خودت می‌سازی (مثل «خانه»، «مهاجرت»، «پروژه‌های نرم‌افزاری») تا وظایف بهشان وصل شوند و کارنامهٔ پروژه‌های توسعه هم ذیلشان ثبت شود.',
  external:
    'اتصال به ابزارهای مدیریت پروژهٔ بیرونی (Jira، Linear، Asana و…) برای پایش «مغفول‌مانده‌ها». اگر از چنین ابزاری استفاده نمی‌کنی، این تب خالی می‌ماند و نیازی بهش نداری.',
  dev:
    'مخزن‌های گیت‌هاب و سرویس‌های رندر تو — همگام‌سازی خودکار، خطاهای باز، و کارنامهٔ روزانهٔ فارسی. جزئیات کامل در «مرکز توسعه».',
};

function initialTab() {
  try {
    const { pathname, search } = window.location;
    const q = new URLSearchParams(search).get('tab');
    if (q && TABS.some((t) => t.id === q)) return q;
    if (pathname.startsWith('/external-projects')) return 'external';
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
        <div data-testid={`projects-panel-${tab}`}>
          {tab === 'mine' && <Projects embedded />}
          {tab === 'external' && <ExternalProjects embedded />}
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
