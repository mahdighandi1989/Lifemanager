import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

// People profiles page (audit task 3cc09436, AC7): lists the people the user
// tracks. Reads GET /api/persons (the shipped endpoint; the canonical spec
// called it /people-profiles). Behavioural scoring is exposed by
// AIService.analyze_person_behavior on the backend.

const REL_COLORS = {
  close: 'bg-green-100 text-green-700',
  regular: 'bg-blue-100 text-blue-700',
  distant: 'bg-gray-100 text-gray-600',
  strained: 'bg-red-100 text-red-700',
  neutral: 'bg-gray-100 text-gray-600',
};
// Persian labels for the relationship buckets the scorer produces
// (app/services/ai/person_behavior.py).
const REL_LABELS = {
  close: 'نزدیک',
  regular: 'معمولی',
  distant: 'دور',
  strained: 'پرتنش',
  neutral: 'خنثی',
};

const EMPTY_PERSON_FORM = { name: '', email: '', phone: '', birthday: '', next_follow_up: '' };

function PeopleProfiles() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // «افزودن فرد» (audit #11): name required; email/phone/birthday/follow-up optional.
  const [form, setForm] = useState(EMPTY_PERSON_FORM);
  const [saving, setSaving] = useState(false);
  // birthday/next_follow_up live on the /persons rows; the summary endpoint
  // predates them, so merge them in fail-open for the 🎂 badge.
  const [extras, setExtras] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    api
      // /people-profiles/summary joins each person with their behavioural
      // profile (ai_score + relationship_type) so the list shows them at a
      // glance; falls back gracefully to names for people without a profile.
      .get('/people-profiles/summary')
      .then((res) => setPeople(Array.isArray(res.data) ? res.data : []))
      .catch((e) => setError('خطا در دریافت افراد: ' + (e.message || '')))
      .finally(() => setLoading(false));
    api
      .get('/persons')
      .then((res) => {
        const map = {};
        (Array.isArray(res.data) ? res.data : []).forEach((p) => {
          map[p.id] = p;
        });
        setExtras(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addPerson = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/persons', {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        birthday: form.birthday || null,
        next_follow_up: form.next_follow_up || null,
      });
      setForm(EMPTY_PERSON_FORM);
      load();
    } catch (err) {
      setError('خطا در افزودن فرد: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="people-profiles-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">افراد</h1>
        <p className="text-gray-500 mb-6">پروفایل افرادی که با آن‌ها در ارتباط هستید.</p>

        {/* «افزودن فرد» — dir="rtl" چون برچسب‌های فارسی با ورودی‌های لاتین/تاریخ مخلوط‌اند (bidi rule) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6" dir="rtl" data-testid="add-person">
          <h2 className="font-semibold text-gray-900 mb-3">افزودن فرد</h2>
          <form onSubmit={addPerson} className="flex flex-wrap gap-2 items-end">
            <input
              data-testid="person-name-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="نام (الزامی)"
              className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
            />
            <input
              data-testid="person-email-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ایمیل (اختیاری)"
              className="border rounded-lg px-3 py-2 text-sm w-44"
              dir="ltr"
            />
            <input
              data-testid="person-phone-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="تلفن (اختیاری)"
              className="border rounded-lg px-3 py-2 text-sm w-36"
              dir="ltr"
            />
            <label className="text-xs text-gray-500">
              تولد
              <input
                data-testid="person-birthday-input"
                type="date"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                className="mt-1 block border rounded-lg px-2 py-1.5 text-sm"
                dir="ltr"
              />
            </label>
            <label className="text-xs text-gray-500">
              موعد پیگیری
              <input
                data-testid="person-followup-input"
                type="date"
                value={form.next_follow_up}
                onChange={(e) => setForm({ ...form, next_follow_up: e.target.value })}
                className="mt-1 block border rounded-lg px-2 py-1.5 text-sm"
                dir="ltr"
              />
            </label>
            <button
              type="submit"
              data-testid="add-person-btn"
              disabled={saving}
              className="bg-pink-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-pink-700 disabled:opacity-50"
            >
              {saving ? 'در حال ثبت…' : 'افزودن فرد'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-3" data-testid="people-list">
          {loading ? (
            <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>
          ) : people.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              هنوز فردی ثبت نشده است.
            </div>
          ) : (
            people.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">
                    {(person.name || '؟').slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {person.name}
                      {(person.birthday || extras[person.id]?.birthday) && (
                        <span
                          data-testid={`person-birthday-badge-${person.id}`}
                          title={`تولد: ${person.birthday || extras[person.id]?.birthday}`}
                          className="mr-1 text-sm"
                        >
                          🎂
                        </span>
                      )}
                    </h3>
                    {person.ai_score != null && (
                      <p data-testid={`person-score-${person.id}`} className="text-sm text-gray-500 mt-0.5">
                        امتیاز: {person.ai_score}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {person.relationship_type && (
                    <span
                      data-testid={`person-rel-${person.id}`}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        REL_COLORS[person.relationship_type] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {REL_LABELS[person.relationship_type] || person.relationship_type}
                    </span>
                  )}
                  <Link
                    to={`/people/${person.id}/profile`}
                    data-testid={`person-profile-link-${person.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    پروفایل
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PeopleProfiles;
