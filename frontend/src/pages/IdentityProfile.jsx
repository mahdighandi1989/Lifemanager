/**
 * «من که هستم» — گردآورنده، نه جزیره.
 *
 * بازنویسی ۲۰۲۶-۰۸-۰۱ پس از نقدِ صریحِ مالک. نسخهٔ قبل یک فرم بود که کارتِ
 * اقامتِ او را در خانه‌های فارسی تایپ می‌کرد و «شاخص پشتکار ۱۰/۱۰۰» را زیرِ
 * عنوانِ «نقاط قوت» می‌گذاشت. حالا:
 *
 *  • هیچ ادعایی بدونِ **جمله**، بدونِ **شواهد** و بدونِ **درِ ورودی** به صفحهٔ
 *    صاحبِ آن داده نمایش داده نمی‌شود. لینکِ هر کارت همان چیزی است که این
 *    صفحه را از موازی‌کاری با بقیه نجات می‌دهد.
 *  • هر ادعا لحن دارد: خبرِ خوب سبز است، جای‌توجه کهربایی. عددِ پایین دیگر
 *    نمی‌تواند خودش را «نقطهٔ قوت» جا بزند.
 *  • منبعی که دادهٔ کافی ندارد صریح می‌گوید «هنوز نمی‌دانم» — به‌جای ساختنِ
 *    یک عددِ بی‌معنا.
 *
 * قاعدهٔ bidi (CLAUDE.md): جمله‌ها عمداً فارسی و لاتین را قاطی می‌کنند
 * («MOHAMMAD MEHDI…»، «OFFICE CLERK»)، پس همه‌چیز باید زیرِ یک dir="rtl"
 * صریح بنشیند وگرنه ترتیبِ عبارت به‌هم می‌ریزد — و build سبز این را نمی‌گیرد.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const SOURCE_FA = {
  owner: 'خودت وارد کردی',
  driving_licence: 'گواهینامهٔ رانندگی',
  identity_document: 'مدرک هویتی',
  owner_fact: 'واقعیتِ هویتیِ رمزنگاری‌شده',
  visa_sponsor: 'کفیلِ ویزا',
  location_pattern: 'الگوی مکانی',
  self_model: 'خودمدلی',
  own_lists: 'لیست‌های خودت',
  derived: 'محاسبه‌شده',
};

const TONE = {
  good: { ring: 'border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  watch: { ring: 'border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' },
  neutral: { ring: 'border-gray-200', dot: 'bg-gray-300', text: 'text-gray-500' },
};

const KIND_FA = {
  fact: 'از سند',
  measured: 'از دادهٔ واقعی',
  inferred: 'استنباط',
  owner: 'حرفِ خودت',
};

/** یک ادعا دربارهٔ مالک. */
function FacetCard({ item }) {
  const [open, setOpen] = useState(false);
  const tone = TONE[item.tone] || TONE.neutral;

  return (
    <li className={`rounded-xl border bg-white p-3 ${tone.ring}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-800">{item.title}</span>
            <span className={`shrink-0 text-[11px] ${tone.text}`}>
              {KIND_FA[item.kind] || item.kind}
              {item.confidence ? ` · ${Math.round(item.confidence * 100)}٪` : ''}
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-gray-700">{item.statement}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            {item.evidence?.length > 0 ? (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="text-[11px] text-blue-600 hover:underline"
              >
                {open ? 'بستن' : 'این را از کجا آوردی؟'}
              </button>
            ) : null}
            {item.owns_page ? (
              <Link
                to={item.owns_page}
                className="text-[11px] text-gray-500 hover:text-blue-600 hover:underline"
              >
                رفتن به سرچشمه‌اش ↩
              </Link>
            ) : null}
          </div>

          {open && item.evidence?.length > 0 ? (
            <ul className="mt-1 space-y-0.5 text-[11px] leading-5 text-gray-500">
              {item.evidence.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/** فیلدی که خودِ مالک می‌نویسد — حرفِ او همیشه مقدم است. */
function OwnerField({ item, onSaved }) {
  const [draft, setDraft] = useState(item.value || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setDraft(item.value || ''), [item.value]);

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await api.put(`/identity-profile/${item.field}`, { value: draft });
      onSaved();
    } catch {
      setError('ذخیره نشد — دوباره تلاش کن.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-800">{item.label}</span>
        <span className="text-xs text-gray-400">
          {item.owner_locked ? '🔒 حرفِ تو' : SOURCE_FA[item.source] || item.source || '—'}
        </span>
      </div>
      <div className="mt-1.5 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          value={draft}
          placeholder={item.askable ? 'هنوز نمی‌دانم — بنویس یا بگذار در تلگرام بپرسم' : 'نامشخص'}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="button"
          disabled={busy || draft === (item.value || '')}
          onClick={save}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-40"
        >
          ثبت
        </button>
      </div>
      {error ? <div className="mt-1 text-[11px] text-red-600">{error}</div> : null}
    </li>
  );
}

function IdentityProfile() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [showFields, setShowFields] = useState(false);

  const load = useCallback(() => {
    api
      .get('/identity-profile')
      // خطا را به «پروفایلِ خالی» ترجمه نکن: «۰ از ۰» دقیقاً شبیهِ یک پروفایلِ
      // تازه است، پس از دست‌رفتنِ داده از نرسیدنِ داده قابلِ تشخیص نبود.
      .then((res) => {
        setData(res.data);
        setLoadError('');
      })
      .catch(() => setLoadError('پروفایل خوانده نشد — اتصال یا سرور مشکل دارد.'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (path) => {
    setBusy(true);
    setLoadError('');
    try {
      await api.post(`/identity-profile/${path}`);
      load();
    } catch {
      setLoadError('انجام نشد — دوباره تلاش کن.');
    } finally {
      setBusy(false);
    }
  };

  if (loadError && !data) {
    return (
      <div dir="rtl" className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="mb-2 font-medium">{loadError}</div>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-red-300 px-3 py-1 text-xs"
          >
            تلاش دوباره
          </button>
        </div>
      </div>
    );
  }
  if (!data) return <div dir="rtl" className="p-6 text-gray-500">در حال بارگذاری…</div>;

  const groups = data.groups || [];
  const quiet = (data.sources || []).filter((s) => !s.ok);

  return (
    <div dir="rtl" className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">🪪 من که هستم</h1>
          <p className="text-xs leading-5 text-gray-500">
            این صفحه چیزی از خودش ذخیره نمی‌کند — آنچه بقیهٔ برنامه دربارهٔ تو
            می‌داند را کنار هم می‌گذارد. هر کارت می‌گوید از کجا آمده و به همان
            صفحه می‌بَرَدت.
          </p>
          {loadError ? <p className="mt-1 text-xs text-red-600">{loadError}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => run('refresh')}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700"
          >
            به‌روزرسانی
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => run('ask-missing')}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-white"
          >
            در تلگرام بپرس
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          هنوز چیزی برای گفتن ندارم. وقتی داده‌های بیشتری بیاید (نوشته‌ها،
          مسیرها، کارها) همین‌جا جمله‌به‌جمله پر می‌شود.
        </div>
      ) : null}

      {groups.map((g) => (
        <section key={g.group} className="mb-5">
          <h2 className="mb-2 text-sm font-bold text-gray-700">{g.label}</h2>
          <ul className="space-y-2">
            {g.items.map((it) => (
              <FacetCard key={it.key} item={it} />
            ))}
          </ul>
        </section>
      ))}

      {quiet.length > 0 ? (
        <div className="mb-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-xs leading-6 text-gray-600">
          <div className="font-medium text-gray-700">هنوز دربارهٔ این‌ها چیزی نمی‌دانم</div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {quiet.map((s) => (
              <Link key={s.key} to={s.owns_page} className="hover:text-blue-600 hover:underline">
                {s.label} ↩
              </Link>
            ))}
          </div>
          <div className="mt-1 text-gray-500">
            دادهٔ کافی نیست. حدس نمی‌زنم — یا خودت پر کن، یا بگذار در تلگرام بپرسم.
          </div>
        </div>
      ) : null}

      <div className="mt-6 border-t border-gray-200 pt-3">
        <button
          type="button"
          onClick={() => setShowFields((v) => !v)}
          className="text-xs text-blue-600 hover:underline"
        >
          {showFields ? 'بستن' : `حرفِ خودت (${data.known ?? 0} از ${data.total ?? 0}) — ویرایش`}
        </button>
        {showFields ? (
          <ul className="mt-2 space-y-2">
            {(data.fields || []).map((f) => (
              <OwnerField key={f.field} item={f} onSaved={load} />
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default IdentityProfile;
