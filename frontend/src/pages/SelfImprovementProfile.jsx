/**
 * Self-Improvement → Profile / Analytics page.
 *
 * Renders the cached UserProfileAnalytics row:
 *   - AI-written Persian narrative (refresh button to regenerate)
 *   - Per-category 30-day stats (completion %, current/longest streak)
 *   - 7-day completion bar chart (hand-rolled inline SVG — no chart
 *     library dependency, keeps the bundle slim)
 *   - List of AI recommendations
 *
 * Backend contract:
 *   GET  /api/self-improvement/profile-analytics            → cached row
 *   POST /api/self-improvement/profile-analytics/refresh    → rebuild
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../lib/api';

function BarChart({ points }) {
  // points: [{date, completed, total, pct}]
  if (!points || points.length === 0) {
    return <div className="text-sm text-gray-400">داده‌ای برای نمایش نیست.</div>;
  }
  const W = 480;
  const H = 160;
  const PAD = 28;
  const innerW = W - PAD * 2;
  const innerH = H - PAD;
  const bw = innerW / points.length;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-40"
      role="img"
      aria-label="نمودار تکمیل ۷ روز اخیر"
      data-testid="si-bar-chart"
    >
      {/* Y axis baseline */}
      <line x1={PAD} y1={H - 18} x2={W - PAD} y2={H - 18} stroke="#e5e7eb" />
      {points.map((p, i) => {
        const h = (p.pct / 100) * (innerH - 18);
        const x = PAD + i * bw + bw * 0.15;
        const y = H - 18 - h;
        return (
          <g key={p.date}>
            <rect
              x={x}
              y={y}
              width={bw * 0.7}
              height={h}
              rx={2}
              fill="#3b82f6"
              opacity={0.85}
            >
              <title>{`${p.date}: ${p.completed}/${p.total} (${p.pct}%)`}</title>
            </rect>
            <text
              x={x + bw * 0.35}
              y={H - 4}
              fontSize="9"
              textAnchor="middle"
              fill="#6b7280"
            >
              {p.date.slice(5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CategoryStatCard({ stat }) {
  return (
    <div
      className="bg-white border border-gray-100 rounded-lg p-3"
      data-testid={`si-cat-stat-${stat.category}`}
    >
      <div className="font-medium text-gray-900 text-sm">{stat.label_fa}</div>
      <div className="mt-2 text-xs text-gray-500 space-y-0.5">
        <div>
          ۳۰ روز اخیر:{' '}
          <span className="font-semibold text-blue-700">
            {stat.completed_last_30_days} / {stat.total_opportunities_last_30_days}
          </span>{' '}
          ({stat.completion_pct_30d}%)
        </div>
        <div>
          رکورد فعلی: <span className="font-semibold text-green-700">{stat.current_streak_days} روز</span>
        </div>
        <div>
          بهترین رکورد: <span className="font-semibold text-purple-700">{stat.longest_streak_days} روز</span>
        </div>
      </div>
    </div>
  );
}

export default function SelfImprovementProfile() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/self-improvement/profile-analytics');
      setAnalytics(res.data);
      setError(null);
    } catch (err) {
      setError('خطا در بارگذاری پروفایل');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.post('/self-improvement/profile-analytics/refresh');
      setAnalytics(res.data);
      setError(null);
    } catch (err) {
      setError('خطا در به‌روزرسانی تحلیل AI');
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500" data-testid="si-profile-loading">در حال بارگذاری…</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600" data-testid="si-profile-error">{error}</div>;
  }
  if (!analytics) {
    return null;
  }

  const payload = analytics.payload || {};
  const perCategory = payload.per_category || [];
  const weekly = payload.weekly_completion || [];
  const recs = payload.ai_recommendations || [];
  const refreshedLabel = analytics.last_refreshed_at
    ? new Date(analytics.last_refreshed_at).toLocaleString('fa-IR')
    : 'هرگز';

  return (
    <div className="p-4 md:p-6" dir="rtl" data-testid="si-profile-page">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">پروفایل خودسازی</h1>
          <p className="text-sm text-gray-500 mt-1">
            تحلیل وضعیت ۳۰ روز اخیر و روند هفتگی شما.
          </p>
          <p className="text-xs text-gray-400 mt-1">آخرین به‌روزرسانی: {refreshedLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            data-testid="si-refresh-analytics"
          >
            {refreshing ? 'در حال محاسبه…' : 'به‌روزرسانی با AI'}
          </button>
          <Link
            to="/self-improvement"
            className="text-xs text-blue-600 hover:underline"
          >
            ← بازگشت به داشبورد روزانه
          </Link>
        </div>
      </div>

      <section className="bg-white border border-gray-100 rounded-xl p-4 mb-5" data-testid="si-narrative">
        <h2 className="font-semibold text-gray-900 mb-2">خلاصه تحلیل AI</h2>
        {analytics.summary ? (
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
            {analytics.summary}
          </pre>
        ) : (
          <p className="text-sm text-gray-400">
            هنوز تحلیلی نوشته نشده. روی «به‌روزرسانی با AI» بزنید.
          </p>
        )}
        {analytics.ai_model && (
          <p className="text-[11px] text-gray-400 mt-2">مدل: {analytics.ai_model}</p>
        )}
      </section>

      <section className="bg-white border border-gray-100 rounded-xl p-4 mb-5">
        <h2 className="font-semibold text-gray-900 mb-3">روند تکمیل ۷ روز اخیر</h2>
        <BarChart points={weekly} />
      </section>

      <section className="mb-5">
        <h2 className="font-semibold text-gray-900 mb-3">آمار ۳۰ روزه به تفکیک دسته</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {perCategory.map((s) => (
            <CategoryStatCard key={s.category} stat={s} />
          ))}
        </div>
      </section>

      {recs.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="font-semibold text-amber-900 mb-2">پیشنهادهای AI</h2>
          <ul className="list-disc ms-5 text-sm text-amber-900 space-y-1">
            {recs.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
