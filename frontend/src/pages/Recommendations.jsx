import React, { useState } from 'react';
import RecommendationPanel from '../components/RecommendationPanel';

// Recommendations page (audit task 2165524b AC 10): the recommendation history
// plus priority settings — the user can enable/disable each recommendation
// family (location / physiological / behavioral).
const TYPES = [
  { key: 'location', label: 'مبتنی بر موقعیت' },
  { key: 'physiological', label: 'مبتنی بر وضعیت جسمی' },
  { key: 'behavioral', label: 'مبتنی بر رفتار' },
];

function Recommendations({ embedded = false }) {
  const [enabled, setEnabled] = useState({
    location: true,
    physiological: true,
    behavioral: true,
  });
  const toggle = (k) => setEnabled((e) => ({ ...e, [k]: !e[k] }));

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="recommendations-page">
      <div className="max-w-3xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">پیشنهادات هوشمند</h1>

        <section data-testid="rec-priorities" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <h2 className="font-semibold mb-3">اولویت‌های پیشنهاددهی</h2>
          {TYPES.map((t) => (
            <label key={t.key} className="flex items-center gap-2 py-1 text-sm">
              <input
                type="checkbox"
                data-testid={`rec-toggle-${t.key}`}
                checked={enabled[t.key]}
                onChange={() => toggle(t.key)}
              />
              {t.label}
            </label>
          ))}
        </section>

        <h2 className="font-semibold text-gray-900 mb-3">تاریخچه پیشنهادات</h2>
        <RecommendationPanel enabledTypes={enabled} />
      </div>
    </div>
  );
}

export default Recommendations;
