import React, { useState, useEffect } from 'react';
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
};

function PeopleProfiles() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/persons')
      .then((res) => active && setPeople(Array.isArray(res.data) ? res.data : []))
      .catch((e) => active && setError('خطا در دریافت افراد: ' + (e.message || '')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="people-profiles-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">افراد</h1>
        <p className="text-gray-500 mb-6">پروفایل افرادی که با آن‌ها در ارتباط هستید.</p>

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
                    <h3 className="font-semibold text-gray-900">{person.name}</h3>
                    {person.relationship_type && (
                      <p className="text-sm text-gray-500 mt-0.5">{person.relationship_type}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {person.relationship_type && (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        REL_COLORS[person.relationship_type] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {person.relationship_type}
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
