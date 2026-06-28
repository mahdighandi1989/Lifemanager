import React, { useState } from 'react';
import Import from './Import';
import DriveFiles from './DriveFiles';
import MergeManagement from './MergeManagement';

// «داده» hub — groups data-management pages as tabs (Import + my files +
// task-merge). Pages reused unchanged via their `embedded` prop; the merge
// page's important lists/data are untouched.

const TABS = [
  { id: 'import', label: 'ایمپورت داده', match: ['/import'] },
  { id: 'files', label: 'فایل‌های من', match: ['/drive-files'] },
  { id: 'merge', label: 'ادغام تسک‌ها', match: ['/merge'] },
];

function initialTab() {
  try {
    const { pathname, search } = window.location;
    const q = new URLSearchParams(search).get('tab');
    if (q && TABS.some((t) => t.id === q)) return q;
    const hit = TABS.find((t) => t.match.some((p) => pathname.startsWith(p)));
    if (hit) return hit.id;
  } catch { /* no window */ }
  return 'import';
}

function DataHub() {
  const [tab, setTab] = useState(initialTab());
  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="data-hub">
      <div className="max-w-4xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">داده</h1>
        <div className="flex gap-1 mb-6 border-b border-gray-200" data-testid="data-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`data-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div data-testid={`data-panel-${tab}`}>
          {tab === 'import' && <Import embedded />}
          {tab === 'files' && <DriveFiles embedded />}
          {tab === 'merge' && <MergeManagement embedded />}
        </div>
      </div>
    </div>
  );
}

export default DataHub;
