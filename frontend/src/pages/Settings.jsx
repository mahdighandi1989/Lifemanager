import React, { useState } from 'react';
import AISettings from './AISettings';
import Notifications from './Notifications';
import DriveSettings from './DriveSettings';

// Settings is a tabbed shell consolidating the app's configuration:
//   • هوش مصنوعی  → the AI catalog (AISettings) + the global analysis prompt
//   • اعلان‌ها     → the Notifications page (preferences + inbox)
//   • گوگل درایو   → the Google Drive connection (connect/disconnect/status/sync)
//
// The previous "advanced (legacy)" tab was retired (owner request): its AI
// provider/model/context controls were redundant with the new catalog and had
// no live consumers, and the one piece that IS used — the editable analysis
// prompt — moved into the AI tab. The legacy endpoints (/api/ai/providers,
// /api/ai/configs) are untouched (capability preserved — see
// docs/overhaul/REMOVAL_CANDIDATES.md).
//
// Deep links: /settings (AI tab), /settings/ai-models (AI tab),
// /settings/notifications (Notifications tab), or ?tab=ai|notifications.

// Notifications is now a unified hub: in-app + Telegram + email channels and
// per-event prefs all live under the «اعلان‌ها» tab (the standalone Telegram tab
// was folded in — the TelegramSettings panel is embedded inside Notifications).
const TABS = [
  { id: 'ai', label: 'هوش مصنوعی' },
  { id: 'notifications', label: 'اعلان‌ها' },
  { id: 'drive', label: 'گوگل درایو' },
];
const TAB_IDS = TABS.map((t) => t.id);

function Settings() {
  // Read the initial tab from the URL directly (router-independent so the
  // component renders fine in unit tests without a <Router>).
  const initialTab = (() => {
    try {
      const { pathname, search } = window.location;
      const q = new URLSearchParams(search).get('tab');
      if (q && TAB_IDS.includes(q)) return q;
      if (pathname.endsWith('/notifications')) return 'notifications';
    } catch {
      /* SSR / no window — fall through to default */
    }
    return 'ai';
  })();
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="settings-page">
      <div className="max-w-4xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">تنظیمات</h1>

        <div className="flex gap-1 mb-6 border-b border-gray-200" data-testid="settings-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`settings-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div data-testid={`settings-panel-${tab}`}>
          {tab === 'ai' && <AISettings embedded />}
          {tab === 'notifications' && <Notifications embedded />}
          {tab === 'drive' && <DriveSettings embedded />}
        </div>
      </div>
    </div>
  );
}

export default Settings;
