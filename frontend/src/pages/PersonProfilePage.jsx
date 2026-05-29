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

  const load = useCallback(() => {
    api
      .get(`/people/${id}/profile`)
      .then((res) => {
        setProfile(res.data);
        setNote(res.data?.user_notes || '');
      })
      .catch((e) => setError('خطا در دریافت پروفایل: ' + (e.message || '')));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 mb-2">تاریخچه رفتار</h2>
          {profile && Array.isArray(profile.behavior_log) && profile.behavior_log.length > 0 ? (
            <ul className="space-y-1 text-sm text-gray-700" data-testid="behavior-log">
              {profile.behavior_log.map((b, i) => (
                <li key={i}>• {b.note || b.type}</li>
              ))}
            </ul>
          ) : (
            <p data-testid="behavior-empty" className="text-gray-400 text-sm">
              هنوز رفتاری ثبت نشده است.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default PersonProfilePage;
