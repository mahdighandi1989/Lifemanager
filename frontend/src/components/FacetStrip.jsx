/**
 * FacetStrip — «آنچه برنامه دربارهٔ تو می‌داند»، قابلِ گذاشتن روی هر صفحه.
 *
 * کارتِ `FacetCard` تا امروز داخلِ `pages/IdentityProfile.jsx` گیر افتاده بود —
 * یک تابعِ محلی، نه یک کامپوننت — پس هیچ صفحهٔ دیگری نمی‌توانست از آن استفاده
 * کند. کلِ ماشینِ پشتش (هفت منبع) هم فقط از همان یک صفحه قابلِ دسترس بود.
 * این فایل همان کارت است، بدونِ تغییرِ ظاهری، ولی این بار قابلِ استفاده.
 *
 * سه چیزی که یک «کپیِ عیناً» بی‌سروصدا خراب می‌کند و اینجا رعایت شده:
 *
 *  ۱. `FacetCard` یک `<li>` برمی‌گرداند، پس هر میزبانی باید `<ul>` بدهد.
 *     استریپ `<ul>` خودش را دارد تا صفحهٔ میزبان لازم نباشد چیزی بداند.
 *  ۲. `dir="rtl"` **خودش** را دارد. جمله‌ها عمداً فارسی و لاتین را قاطی
 *     می‌کنند («MOHAMMAD MEHDI…»، «OFFICE CLERK»، مسیرهایی مثل users.bio)؛
 *     بدونِ یک نیای صریحِ rtl مرورگر ترتیبِ عبارت را به‌هم می‌ریزد و
 *     `npm run build` سبز می‌ماند (قاعدهٔ bidi در CLAUDE.md).
 *  ۳. خطای شبکه صفحهٔ میزبان را نمی‌خواباند: `.catch` به فهرستِ خالی می‌رسد و
 *     استریپِ خالی `null` برمی‌گرداند — یعنی هیچ قابِ خالی، هیچ «در حال
 *     بارگذاری…»ِ ابدی، هیچ پیامِ خطا روی صفحه‌ای که خودش سالم است.
 *
 * لینکِ هر کارت `item.link` است نه `item.owns_page`: وقتی کارت دربارهٔ یک
 * چیزِ مشخص حرف می‌زند (بلندترین نوشته‌ات، فلان لیست)، بک‌اند `?focus=` را
 * روی مسیر می‌نشاند و کاربر روی **خودِ همان ردیف** فرود می‌آید. برای کارت‌های
 * جمعی `link` همان `owns_page` است، پس رفتار عوض نمی‌شود.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

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
export function FacetCard({ item }) {
  const [open, setOpen] = useState(false);
  const tone = TONE[item.tone] || TONE.neutral;
  const href = item.link || item.owns_page;

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
            {href ? (
              <Link
                to={href}
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

/**
 * نوارِ کارت‌ها. روی هر صفحه‌ای با یک خط می‌نشیند:
 *
 *   <FacetStrip limit={4} title="آنچه برنامه دربارهٔ تو می‌داند" />
 *
 * اگر چیزی برای گفتن نباشد، هیچ‌چیز رندر نمی‌شود — «هنوز نمی‌دانم» بهتر از
 * یک قابِ خالی است، و صفحهٔ میزبان نباید بابتِ خالی‌بودنِ این نوار جای خالی
 * نشان دهد.
 */
export default function FacetStrip({
  limit = 4,
  surface = '',
  groups = '',
  title = 'آنچه برنامه دربارهٔ تو می‌داند',
  className = '',
}) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (surface) params.set('surface', surface);
    if (groups) params.set('groups', groups);
    api
      .get(`/facets?${params.toString()}`)
      .then((res) => { if (alive) setItems(res.data?.facets || []); })
      .catch(() => { if (alive) setItems([]); })
    return () => { alive = false; };
  }, [limit, surface, groups]);

  if (items.length === 0) return null;

  return (
    <section dir="rtl" className={`mb-6 ${className}`} data-testid="facet-strip">
      {title ? (
        <h2 className="mb-2 text-sm font-semibold text-gray-700">{title}</h2>
      ) : null}
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {items.map((item) => (
          <FacetCard key={item.key} item={item} />
        ))}
      </ul>
    </section>
  );
}
