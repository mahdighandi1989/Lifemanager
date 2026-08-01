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

// چهار حالتِ متفاوت — چون «داده‌ای نیست» چند معنیِ کاملاً متفاوت دارد و
// یکی‌کردنشان همان چیزی بود که خرابیِ اعلان‌ها را پنهان کرد.
const STATUS_ICON = { ok: '✅', off: '⛔', silent: '⚠️', never: '⭕', unknown: '❔', partial: '🟡' };
const STATUS_COLOR = {
  ok: 'text-emerald-600',
  off: 'text-red-600',
  silent: 'text-amber-600',
  never: 'text-gray-500',
  unknown: 'text-gray-400',
  partial: 'text-amber-600',
};
const STATUS_FA = {
  ok: 'فعال',
  off: 'دسترسی باطل شده',
  silent: 'قطع شده',
  never: 'هرگز داده نداده',
  unknown: 'گوشی ساکت است',
  partial: 'فعال، ولی ناپایدار',
};

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
  // «unknown» یعنی خودِ گوشی ساکت است و نمی‌شود دربارهٔ مجرا قضاوت کرد — خرابی
  // حساب نمی‌شود، وگرنه هر بار که گوشی خاموش است پنج هشدارِ الکی می‌دهد.
  const broken = channels.filter((c) => ['off', 'silent', 'never', 'partial'].includes(c.status));

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
          {broken.length > 0 ? (
            // «مشکل‌دار»، نه «داده نمی‌فرستد»: یک مجرای partial ممکن است همین
            // حالا داده بفرستد و فقط پیش‌نیازِ پایداری‌اش کم باشد — برچسبِ قبلی
            // با متنِ خودِ همان سطر («فعال، ولی ناپایدار») تناقض داشت.
            <span className="mr-2 text-xs text-amber-600">
              {broken.length} کانال نیاز به رسیدگی دارد
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
              <span className={STATUS_COLOR[c.status] || 'text-gray-400'}>
                {STATUS_ICON[c.status] || '•'}
              </span>
              <span className="mx-1.5 text-gray-700">{c.label}</span>
              <span className="text-gray-400">
                {STATUS_FA[c.status] || c.status}
                {' · '}
                <span dir="ltr">{c.count_24h ?? 0}</span> در ۲۴ ساعت
                {' / '}
                <span dir="ltr">{c.count_7d ?? 0}</span> در ۷ روز
                {c.last_at ? (
                  <span className="mx-1" dir="ltr">
                    · {String(c.last_at).slice(0, 16).replace('T', ' ')}
                  </span>
                ) : null}
              </span>
              {c.hint ? <div className="mt-0.5 mr-6 text-gray-500">{c.hint}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MobileChannelsStrip;
