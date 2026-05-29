import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

// PersonProfilePage (audit task 3cc09436 AC4/AC6): a person's behavioural
// profile — AI relationship score, relationship type, behaviour history — plus
// a form to record a free-text note and a button to (re)run AI analysis.
// Route: /people/:id/profile. Reads GET /api/people/:id/profile.
function PersonProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [deedNote, setDeedNote] = useState('');
  const [deedImportant, setDeedImportant] = useState(false);
  const [logFilter, setLogFilter] = useState('all'); // all | good | bad

  const load = useCallback(() => {
    api
      .get(`/people/${id}/profile`)
      .then((res) => {
        setProfile(res.data);
        setNote(res.data?.user_notes || '');
      })
      .catch((e) => setError('خطا در دریافت پروفایل: ' + (e.message || '')));
    api.get(`/people/${id}/profile/reminders`).then((r) => setReminders(r.data?.reminders || [])).catch(() => {});
    api.get(`/people/${id}/profile/suggestions`).then((r) => setSuggestions(r.data?.suggestions || [])).catch(() => {});
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const recordDeed = (kind) => {
    setBusy(true);
    api
      .post(`/people/${id}/profile/deed`, { kind, note: deedNote, important: deedImportant })
      .then((res) => {
        setProfile(res.data);
        setDeedNote('');
        setDeedImportant(false);
        load();
      })
      .catch((e) => setError('خطا در ثبت رفتار: ' + (e.message || '')))
      .finally(() => setBusy(false));
  };

  const analyze = () => {
    setBusy(true);
    api
      .post(`/people/${id}/profile/analyze`)
      .then((res) => setProfile(res.data))
      .catch((e) => setError('خطا در تحلیل: ' + (e.message || '')))
      .finally(() => setBusy(false));
  };

  const saveNote = (e) => {
    e.preventDefault();
    setBusy(true);
    api
      .post(`/people/${id}/profile/note`, { user_notes: note })
      .then((res) => setProfile(res.data))
      .catch((err) => setError('خطا در ثبت نظر: ' + (err.message || '')))
      .finally(() => setBusy(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="person-profile-page">
      <div className="max-w-2xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">پروفایل فرد</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">امتیاز هوش مصنوعی</span>
            <span data-testid="profile-ai-score" className="font-semibold">
              {profile ? profile.ai_score : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">نوع رابطه</span>
            <span data-testid="profile-relationship" className="font-semibold">
              {profile ? profile.relationship_type : '—'}
            </span>
          </div>
          <button
            data-testid="analyze-person-btn"
            onClick={analyze}
            disabled={busy}
            className="mt-4 bg-blue-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? 'در حال پردازش…' : 'تحلیل هوش مصنوعی'}
          </button>
        </section>

        <form onSubmit={saveNote} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <label className="block text-sm text-gray-600 mb-2">نظر شما درباره این فرد</label>
          <textarea
            data-testid="note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
            rows={3}
          />
          <button
            type="submit"
            data-testid="save-note-btn"
            disabled={busy}
            className="mt-2 bg-green-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-60"
          >
            ثبت نظر
          </button>
        </form>

        {/* Good/bad deed recording (Step 4-5 — کارهای بد و خوبش ثبت بشه) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4" data-testid="deed-form">
          <h2 className="font-semibold text-gray-900 mb-2">ثبت کار خوب/بد</h2>
          <input
            data-testid="deed-note-input"
            value={deedNote}
            onChange={(e) => setDeedNote(e.target.value)}
            placeholder="شرح کار (مثلاً: قرض داد / بدقولی کرد)"
            className="w-full border border-gray-200 rounded-lg p-2 text-sm mb-2"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <input data-testid="deed-important" type="checkbox" checked={deedImportant} onChange={(e) => setDeedImportant(e.target.checked)} />
            مهم — یادم بماند (فراموش نکنم)
          </label>
          <div className="flex gap-2">
            <button data-testid="deed-good-btn" onClick={() => recordDeed('good')} disabled={busy}
              className="bg-green-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-60">کار خوب 👍</button>
            <button data-testid="deed-bad-btn" onClick={() => recordDeed('bad')} disabled={busy}
              className="bg-red-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-red-700 disabled:opacity-60">کار بد 👎</button>
          </div>
        </section>

        {/* Reminders (Step 8) */}
        {reminders.length > 0 && (
          <section data-testid="reminders" className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
            <h2 className="font-semibold text-amber-800 mb-2">یادآوری‌ها</h2>
            <ul className="space-y-1 text-sm text-amber-700">
              {reminders.map((r, i) => (<li key={i}>• {r.note || r.kind}</li>))}
            </ul>
          </section>
        )}

        {/* Suggestions (Step 9) */}
        {suggestions.length > 0 && (
          <section data-testid="suggestions" className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
            <h2 className="font-semibold text-indigo-800 mb-2">پیشنهادهای عملی</h2>
            <ul className="space-y-1 text-sm text-indigo-700">
              {suggestions.map((s, i) => (<li key={i}>• {s}</li>))}
            </ul>
          </section>
        )}

        {/* Interaction-history timeline with good/bad filter (Step 7) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">تاریخچه رفتار</h2>
            <div className="flex gap-1 text-xs">
              {['all', 'good', 'bad'].map((f) => (
                <button key={f} data-testid={`log-filter-${f}`} onClick={() => setLogFilter(f)}
                  className={`px-2 py-0.5 rounded ${logFilter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {f === 'all' ? 'همه' : f === 'good' ? 'خوب' : 'بد'}
                </button>
              ))}
            </div>
          </div>
          {(() => {
            const log = (profile && Array.isArray(profile.behavior_log) ? profile.behavior_log : [])
              .filter((b) => logFilter === 'all' || (logFilter === 'good' && b.valence > 0) || (logFilter === 'bad' && b.valence < 0));
            return log.length > 0 ? (
              <ul className="space-y-1 text-sm text-gray-700" data-testid="behavior-log">
                {log.slice().reverse().map((b, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span>{b.valence > 0 ? '🟢' : b.valence < 0 ? '🔴' : '•'} {b.note || b.type}</span>
                    {b.at && <span className="text-[11px] text-gray-400 shrink-0">{String(b.at).slice(0, 10)}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p data-testid="behavior-empty" className="text-gray-400 text-sm">موردی برای نمایش نیست.</p>
            );
          })()}
        </section>
      </div>
    </div>
  );
}

export default PersonProfilePage;
