/**
 * «ناظر چند دقیقهٔ دیگر می‌رود سراغش؟» — on the owner's OWN clock.
 *
 * The server sends one thing: the UTC instant the next round is due, MEASURED
 * from the routine's own visits (`supervisor_rounds.py`). The clock is read
 * here because «ساعتِ محلی» means the clock the owner is looking at — a server
 * that formats a time has to guess a timezone, and a countdown off by four hours
 * is worse than none. Ported from ALLIN1 `nextRound.ts` (v168/v179).
 *
 * basis: observed (watched) · assumed (default, nothing watched yet) ·
 *        due (its slot just passed — late, not gone) · stale (stopped coming)
 */
const FA = '۰۱۲۳۴۵۶۷۸۹';
export const fa = (n) => String(n).replace(/\d/g, (d) => FA[+d]);

export function localClock(iso, now) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ref = now || new Date();
  if (d.toDateString() === ref.toDateString()) return fa(`${hh}:${mm}`);
  const tomorrow = new Date(ref);
  tomorrow.setDate(ref.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return `${fa(`${hh}:${mm}`)} (فردا)`;
  return `${fa(`${hh}:${mm}`)} (${d.toLocaleDateString('fa-IR', { weekday: 'long' })})`;
}

export function humanGap(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return 'همین حالا';
  if (minutes < 1) return 'کمتر از یک دقیقهٔ دیگر';
  if (minutes < 60) return `${fa(Math.round(minutes))} دقیقهٔ دیگر`;
  if (minutes < 60 * 48) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m ? `${fa(h)} ساعت و ${fa(m)} دقیقهٔ دیگر` : `${fa(h)} ساعتِ دیگر`;
  }
  return `${fa(Math.round(minutes / 1440))} روزِ دیگر`;
}

export function everyText(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return '';
  return minutes % 60 === 0 ? `هر ${fa(minutes / 60)} ساعت` : `هر ${fa(Math.round(minutes))} دقیقه`;
}

/** The sentence after pressing ⚡. Second in the queue does NOT mean a second
 *  arrival — the round works through the queue one by one in the same visit. */
export function rushMessage(position, nr, now) {
  const place = position === 1
    ? 'در صفِ فوری، نفرِ اول'
    : `در صفِ فوری، نفرِ ${fa(position)} — به ترتیبی که زدی انجام می‌شود`;
  if (!nr || !nr.at) return `${place} — ناظر در دورِ بعد برمی‌داردش`;
  if (nr.basis === 'stale') {
    return `${place} — ولی ناظر از ${localClock(nr.last_seen || nr.at, now)} تا حالا سر نزده؛ `
      + 'ممکن است روتینش خاموش باشد. بررسی کن.';
  }
  if (nr.basis === 'due') {
    return `${place} · دورِ ناظر قرار بود ساعتِ ${localClock(nr.at, now)} باشد و هر لحظه می‌رسد`;
  }
  const hedge = nr.basis === 'assumed' ? ' — تخمینی، هنوز دوری ثبت نشده' : '';
  return `${place} · ناظر ساعتِ ${localClock(nr.at, now)} (${humanGap(nr.in_minutes)}) می‌رود سراغش${hedge}`;
}
