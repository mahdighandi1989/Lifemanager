/**
 * «کجاها بوده‌ام» — مکان‌ها، خطِ حرکت، و سفرها.
 *
 * چرا این صفحه ساخته شد (۲۰۲۶-۰۸-۰۱): نقاطِ موقعیت جمع می‌شدند و خوشه
 * می‌شدند، ولی هیچ‌جا دیده نمی‌شدند — تنها نشانه‌شان یک سطرِ لاگ بود:
 * «۱۱ نقطهٔ موقعیت». نه نشانی، نه مسیر، نه نقشه.
 *
 * چرا SVG و نه Leaflet/Google Maps: کاشیِ نقشه یعنی درخواست به میزبانِ
 * بیرونی و یک وابستگیِ تازه. اینجا مسیر با تصویرِ هم‌فاصلهٔ ساده (equirect)
 * رسم می‌شود — بدونِ هیچ وابستگی، بدونِ هیچ درخواستِ بیرونی، و کاملاً
 * آفلاین. شکلِ مسیر و نسبتِ فاصله‌ها درست است؛ چیزی که کم است فقط پس‌زمینهٔ
 * خیابان‌هاست. برای «خطِ حرکتم چه شکلی بود» کافی است.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const KIND_FA = {
  home: '🏠 خانه',
  work: '🏢 محل کار',
  gym: '🏋️ ورزش',
  shopping: '🛒 خرید',
  social: '👥 دیدار',
  other: '📍 جای دیگر',
};

const DEVICE_COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed'];

function hours(mins) {
  const m = Math.round(mins || 0);
  if (m < 60) return `${m} دقیقه`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} ساعت و ${rest} دقیقه` : `${h} ساعت`;
}

/** مسیر را روی یک بومِ SVG می‌کشد. تصویرِ هم‌فاصله با تصحیحِ عرضِ جغرافیایی. */
function TrackCanvas({ tracks, places }) {
  const W = 720;
  const H = 420;
  const PAD = 28;

  const geometry = useMemo(() => {
    const pts = [];
    tracks.forEach((t) => t.points.forEach((p) => pts.push(p)));
    places.forEach((p) => pts.push({ lat: p.lat, lon: p.lon }));
    if (pts.length === 0) return null;

    const lats = pts.map((p) => p.lat);
    const lons = pts.map((p) => p.lon);
    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLon = Math.min(...lons);
    let maxLon = Math.max(...lons);

    // یک درجهٔ طول در این عرض کوتاه‌تر از یک درجهٔ عرض است؛ بدونِ این تصحیح
    // مسیر در جهتِ شرق-غرب کشیده می‌شود و شکلش دروغ می‌گوید.
    const midLat = (minLat + maxLat) / 2;
    const lonScale = Math.max(0.15, Math.cos((midLat * Math.PI) / 180));

    let spanLat = maxLat - minLat;
    let spanLon = (maxLon - minLon) * lonScale;
    // همه‌ی نقاط روی هم؟ یک حاشیهٔ حداقلی بده تا تقسیم بر صفر نشود.
    const MIN_SPAN = 0.0008;
    if (spanLat < MIN_SPAN) {
      const pad = (MIN_SPAN - spanLat) / 2;
      minLat -= pad;
      maxLat += pad;
      spanLat = MIN_SPAN;
    }
    if (spanLon < MIN_SPAN) {
      const pad = (MIN_SPAN - spanLon) / 2 / lonScale;
      minLon -= pad;
      maxLon += pad;
      spanLon = MIN_SPAN;
    }

    const scale = Math.min((W - 2 * PAD) / spanLon, (H - 2 * PAD) / spanLat);
    const offX = (W - spanLon * scale) / 2;
    const offY = (H - spanLat * scale) / 2;

    const project = (lat, lon) => ({
      x: offX + (lon - minLon) * lonScale * scale,
      // y معکوس است: عرضِ بیشتر = بالاتر روی صفحه
      y: H - (offY + (lat - minLat) * scale),
    });

    // مقیاس: طولِ یک خطِ مرجع بر حسب متر
    const metersPerDegLat = 111320;
    const barPx = 90;
    const barMeters = (barPx / scale) * metersPerDegLat;
    return { project, barPx, barMeters };
  }, [tracks, places]);

  if (!geometry) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
        هنوز نقطه‌ای در این بازه ثبت نشده.
      </div>
    );
  }

  const { project, barPx, barMeters } = geometry;
  const scaleLabel =
    barMeters >= 1000 ? `${(barMeters / 1000).toFixed(1)} کیلومتر` : `${Math.round(barMeters)} متر`;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="خط حرکت">
        <rect x="0" y="0" width={W} height={H} fill="#f8fafc" />

        {/* شعاعِ هر مکان، تا معلوم باشد «همان‌جا» یعنی چقدر */}
        {places.map((p) => {
          const c = project(p.lat, p.lon);
          return <circle key={`h${p.id}`} cx={c.x} cy={c.y} r="14" fill="#3b82f6" opacity="0.10" />;
        })}

        {/* خطِ حرکت — یک مسیر برای هر گوشی */}
        {tracks.map((t, ti) => {
          const color = DEVICE_COLORS[ti % DEVICE_COLORS.length];
          const d = t.points
            .map((p, i) => {
              const c = project(p.lat, p.lon);
              return `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`;
            })
            .join(' ');
          return (
            <g key={t.device}>
              <path d={d} fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.75"
                strokeLinejoin="round" strokeLinecap="round" />
              {t.points.length > 0
                ? (() => {
                    const last = project(
                      t.points[t.points.length - 1].lat,
                      t.points[t.points.length - 1].lon,
                    );
                    return <circle cx={last.x} cy={last.y} r="4.5" fill={color} />;
                  })()
                : null}
            </g>
          );
        })}

        {/* مکان‌های نام‌دار */}
        {places.map((p) => {
          const c = project(p.lat, p.lon);
          return (
            <g key={p.id}>
              <circle cx={c.x} cy={c.y} r="4" fill="#1e293b" />
              <text x={c.x} y={c.y - 8} textAnchor="middle" fontSize="11" fill="#334155">
                {(p.display || '').slice(0, 22)}
              </text>
            </g>
          );
        })}

        {/* خطِ مقیاس — بدونِ آن، شکل بی‌معناست */}
        <g>
          <line x1={PAD} y1={H - 14} x2={PAD + barPx} y2={H - 14} stroke="#475569" strokeWidth="2" />
          <text x={PAD + barPx + 6} y={H - 10} fontSize="11" fill="#475569">
            {scaleLabel}
          </text>
        </g>
      </svg>
    </div>
  );
}

function PlacesMap() {
  const [days, setDays] = useState(2);
  const [data, setData] = useState(null);
  const [track, setTrack] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    Promise.all([
      api.get('/places', { params: { days: 30 } }),
      api.get('/places/track', { params: { days } }),
    ])
      .then(([p, t]) => {
        setData(p.data);
        setTrack(t.data);
      })
      .catch(() => setError('خوانده نشد — اتصال یا سرور مشکل دارد.'));
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div dir="rtl" className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="mb-2 font-medium">{error}</div>
          <button type="button" onClick={load}
            className="rounded-lg border border-red-300 px-3 py-1 text-xs">
            تلاش دوباره
          </button>
        </div>
      </div>
    );
  }
  if (!data || !track) return <div dir="rtl" className="p-6 text-gray-500">در حال بارگذاری…</div>;

  const places = data.places || [];
  const trips = data.trips || [];
  const tracks = (track.tracks || []).filter((t) => (t.points || []).length > 1);

  return (
    <div dir="rtl" className="mx-auto max-w-4xl p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">🗺️ کجاها بوده‌ام</h1>
          <p className="text-xs text-gray-500">
            <span dir="ltr">{track.total_points}</span> نقطه در{' '}
            <span dir="ltr">{track.days}</span> روز اخیر ·{' '}
            <span dir="ltr">{places.length}</span> مکانِ شناخته‌شده
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
        >
          {[1, 2, 7, 14, 30].map((d) => (
            <option key={d} value={d}>{d} روز اخیر</option>
          ))}
        </select>
      </div>

      <TrackCanvas tracks={tracks} places={places} />

      {tracks.length > 1 ? (
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-600">
          {tracks.map((t, i) => (
            <span key={t.device} className="flex items-center gap-1">
              <span className="inline-block h-2 w-4 rounded"
                style={{ background: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />
              <span dir="ltr">{t.device}</span>
            </span>
          ))}
        </div>
      ) : null}

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold text-gray-700">مکان‌ها</h2>
        {places.length === 0 ? (
          <p className="text-xs text-gray-500">هنوز مکانی کشف نشده.</p>
        ) : (
          <ul className="space-y-2">
            {places.map((p) => (
              <li key={p.id} className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-800">{p.display}</span>
                  <span className="text-xs text-gray-400">{KIND_FA[p.kind] || '—'}</span>
                </div>
                {p.address && p.address !== p.display ? (
                  <div className="mt-0.5 text-[11px] text-gray-500">{p.address}</div>
                ) : null}
                <div className="mt-1 text-[11px] text-gray-500">
                  <span dir="ltr">{p.visit_count}</span> بار · مجموعاً {hours(p.total_minutes)}
                  {' · '}
                  <span dir="ltr">{p.lat.toFixed(5)}, {p.lon.toFixed(5)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold text-gray-700">رفت‌وآمدها</h2>
        {trips.length === 0 ? (
          <p className="text-xs text-gray-500">در این بازه سفری ثبت نشده.</p>
        ) : (
          <ul className="space-y-1.5">
            {trips.map((t) => (
              <li key={t.id}
                className={`rounded-lg border p-2.5 text-xs ${
                  t.is_anomaly ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'
                }`}>
                <div className="text-gray-800">
                  {t.started_local ? <span dir="ltr">{t.started_local}</span> : null} — از «{t.from}» به «{t.to}»
                </div>
                <div className="mt-0.5 text-gray-500">
                  <span dir="ltr">{t.minutes}</span> دقیقه ·{' '}
                  <span dir="ltr">{t.distance_km}</span> کیلومتر
                  {t.is_anomaly ? ' · خلافِ الگو' : ''}
                </div>
                {t.note ? <div className="mt-0.5 text-gray-600">یادداشت: {t.note}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default PlacesMap;
