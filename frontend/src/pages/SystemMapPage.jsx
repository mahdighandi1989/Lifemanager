import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../lib/api';
import SystemDiagram from '../components/SystemDiagram';

/**
 * نقشهٔ سیستم — دو تب:
 *
 *   «دیاگرام زنده» (پیش‌فرض، 2026-07-30): همهٔ اجزای برنامه به شکل کارت و
 *   سیم، ساخته‌شده با درون‌نگری از خودِ کد، با نبض واقعی ترافیک
 *   (components/SystemDiagram.jsx).
 *
 *   «راهنما»: the original curated capability list (completeness-critic #8:
 *   «یادم نمی‌مونه چی کجاست») — kept unchanged behind a tab, quarantine-not-
 *   delete; renders GET /api/system-map exactly as before.
 */

// Persian labels for the counts strip — order fixed, chips with count -1
// (table unavailable) are hidden.
const COUNT_LABELS = [
  ['tasks', 'تسک‌ها'],
  ['projects', 'پروژه‌ها'],
  ['lists', 'لیست‌ها'],
  ['todo_items', 'آیتم‌ها'],
  ['writings', 'نوشته‌ها'],
  ['people', 'افراد'],
  ['accounts', 'حساب‌ها'],
  ['transactions', 'تراکنش‌ها'],
  ['emails_synced', 'ایمیل‌ها'],
  ['events_synced', 'رویدادها'],
  ['inbox_pending', 'در انتظار'],
];

function GuideTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get('/system-map')
      .then((res) => {
        if (alive) setData(res.data);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const counts = data?.counts || {};
  const sections = data?.sections || [];

  return (
    <>
      {error && (
        <p className="text-gray-400 text-sm mb-4" data-testid="system-map-error">
          نقشهٔ سیستم در دسترس نیست.
        </p>
      )}

      {/* آمار زنده — compact stat chips */}
      <div className="flex flex-wrap gap-2 mb-6" data-testid="system-map-counts">
        {COUNT_LABELS.map(([key, label]) => {
          const value = counts[key];
          if (value == null || value === -1) return null;
          return (
            <span
              key={key}
              data-testid={`system-map-chip-${key}`}
              className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600"
            >
              <span className="font-bold text-gray-900">{value}</span>
              {label}
            </span>
          );
        })}
      </div>

      {/* بخش‌ها */}
      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.key}
            data-testid={`system-map-section-${section.key}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              {section.title}
            </h2>
            <ul className="space-y-2">
              {(section.items || []).map((item) => (
                <li key={item.name} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  {item.url ? (
                    <Link
                      to={item.url}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-gray-800">
                      {item.name}
                    </span>
                  )}
                  {item.auto && (
                    <span className="inline-block rounded-full bg-indigo-50 text-indigo-600 px-2 py-0.5 text-[11px]">
                      خودکار ⚙️
                    </span>
                  )}
                  {item.desc && (
                    <span className="text-xs text-gray-400 basis-full sm:basis-auto">
                      {item.desc}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function SystemMapPage() {
  const [tab, setTab] = useState('diagram');
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="system-map-page">
      <div className="max-w-7xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">نقشهٔ سیستم</h1>
        <p className="text-sm text-gray-500 mb-4">
          دیاگرام زندهٔ همهٔ اجزای برنامه — از روی خودِ کد ساخته می‌شود و جریان واقعی را نشان می‌دهد.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            data-testid="system-map-tab-diagram"
            onClick={() => setTab('diagram')}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              tab === 'diagram'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            دیاگرام زنده
          </button>
          <button
            type="button"
            data-testid="system-map-tab-guide"
            onClick={() => setTab('guide')}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              tab === 'guide'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            راهنما
          </button>
        </div>

        {tab === 'diagram' ? <SystemDiagram currentPath={location.pathname} /> : <GuideTab />}
      </div>
    </div>
  );
}

export default SystemMapPage;
