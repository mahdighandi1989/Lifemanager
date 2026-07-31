/**
 * نوارِ وضعیتِ کانال‌های موبایل — روی همان صفحهٔ «لاگ فعالیت‌ها».
 *
 * مالک سراغ لاگ رفت تا اعلانِ یک پیام‌رسان را ببیند و چیزی نبود؛ بدون این نوار،
 * «چرا ثبت نشده؟» بی‌جواب می‌ماند. این نوار برای هر مجرا (پیامک/اعلان/تماس/
 * کارکرد/صفحه/نبض) می‌گوید چند رویداد آمده، آخرینش کی بوده، و اگر خاموش است
 * دقیقاً چه باید کرد. صفحهٔ جدید نمی‌سازد — همان‌جا که لازم است می‌نشیند.
 */
import React, { useEffect, useState } from 'react';
import api from '../lib/api';

function MobileChannelsStrip() {
  const [channels, setChannels] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get('/mobile/diagnostics')
      .then((res) => {
        if (alive) setChannels(res.data?.channels || []);
      })
      .catch(() => {
        if (alive) setChannels([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!channels || channels.length === 0) return null;
  const silent = channels.filter((c) => c.status === 'silent');

  return (
    <div
      dir="rtl"
      data-testid="mobile-channels-strip"
      className="mb-4 rounded-xl border border-gray-200 bg-white p-3"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-right"
      >
        <span className="text-sm font-medium text-gray-700">
          کانال‌های موبایل
          {silent.length > 0 ? (
            <span className="mr-2 text-xs text-amber-600">
              {silent.length} کانال هیچ داده‌ای نفرستاده
            </span>
          ) : (
            <span className="mr-2 text-xs text-emerald-600">همه فعال</span>
          )}
        </span>
        <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <ul className="mt-2 space-y-1.5">
          {channels.map((c) => (
            <li key={c.action} className="text-xs" data-testid={`mobile-channel-${c.action}`}>
              <span className={c.status === 'ok' ? 'text-emerald-600' : 'text-amber-600'}>
                {c.status === 'ok' ? '✅' : '❌'}
              </span>
              <span className="mx-1.5 text-gray-700">{c.label}</span>
              {c.status === 'ok' ? (
                <span className="text-gray-400">
                  <span dir="ltr">{c.count}</span> رویداد
                  {c.last_at ? (
                    <span className="mx-1" dir="ltr">
                      · {String(c.last_at).slice(0, 16).replace('T', ' ')}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="text-gray-500">{c.hint}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MobileChannelsStrip;
