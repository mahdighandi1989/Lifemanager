import React, { useState } from 'react';
import api from '../lib/api';

// Smart suggestions surface (audit task 2165524b, AC5): posts the current
// ambient context to POST /api/v1/context/analyze and renders the engine's
// task suggestions. Optional signals (heart rate / ambient noise) let the
// user see how the context engine reacts.

const KIND_STYLES = {
  focus: 'border-green-200 bg-green-50',
  movement: 'border-amber-200 bg-amber-50',
  defer: 'border-red-200 bg-red-50',
  general: 'border-gray-200 bg-gray-50',
};

function SmartAssistant({ embedded = false }) {
  const [heartRate, setHeartRate] = useState('');
  const [noise, setNoise] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ran, setRan] = useState(false);

  // Task-aware AI feedback (audit task e606cca6): triggers POST /api/ai/analyze-tasks,
  // which reads the user's actual tasks, runs the configured model within the
  // analysis prompt set in تنظیمات → هوش مصنوعی, and ALSO files the feedback into
  // the notification bell. Here we surface the trigger + the result inline.
  const [tfLoading, setTfLoading] = useState(false);
  const [tfError, setTfError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [tfContext, setTfContext] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const body = {};
      if (heartRate) body.heart_rate = Number(heartRate);
      if (noise) body.noise_db = Number(noise);
      const res = await api.post('/v1/context/analyze', body);
      setSuggestions(res.data?.suggestions || []);
      setRan(true);
    } catch (e) {
      setError('خطا در تحلیل وضعیت: ' + (e.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const getTaskFeedback = async () => {
    setTfLoading(true);
    setTfError(null);
    try {
      const res = await api.post('/ai/analyze-tasks', { task_id: null });
      setFeedback(res.data?.feedback || 'بازخوردی تولید نشد.');
      setTfContext(res.data?.context || null);
    } catch (e) {
      setTfError('خطا در دریافت بازخورد: ' + (e?.response?.data?.detail || e.message || ''));
    } finally {
      setTfLoading(false);
    }
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="smart-assistant-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">پیشنهادات هوشمند</h1>
        <p className="text-gray-500 mb-6">
          بر اساس وضعیت فعلی شما، موتور زمینه پیشنهادهای کار را تولید می‌کند.
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm text-gray-600">
              ضربان قلب (اختیاری)
              <input
                type="number"
                data-testid="assistant-heart-rate"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="mt-1 block w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="مثلاً 65"
              />
            </label>
            <label className="text-sm text-gray-600">
              نویز محیط dB (اختیاری)
              <input
                type="number"
                data-testid="assistant-noise"
                value={noise}
                onChange={(e) => setNoise(e.target.value)}
                className="mt-1 block w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="مثلاً 40"
              />
            </label>
            <button
              type="button"
              data-testid="assistant-analyze-btn"
              onClick={analyze}
              disabled={loading}
              className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'در حال تحلیل…' : 'تحلیل وضعیت فعلی'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-3" data-testid="assistant-suggestions">
          {ran && suggestions.length === 0 && !error && (
            <div className="p-6 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              پیشنهادی تولید نشد.
            </div>
          )}
          {suggestions.map((s, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 ${KIND_STYLES[s.kind] || KIND_STYLES.general}`}
            >
              <p className="text-sm font-medium text-gray-900">{s.text}</p>
              <p className="text-xs text-gray-400 mt-1">{s.kind}</p>
            </div>
          ))}
        </div>

        {/* Task-aware AI feedback — uses the model + analysis prompt configured in
            تنظیمات → هوش مصنوعی, sees the user's real tasks, and also saves the
            result to the notification bell. */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-8" data-testid="task-feedback-card">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="font-semibold text-gray-900">بازخورد هوشمند روی تسک‌ها</h2>
            <button
              type="button"
              data-testid="task-feedback-btn"
              onClick={getTaskFeedback}
              disabled={tfLoading}
              className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {tfLoading ? 'در حال تحلیل…' : 'تحلیل تسک‌ها'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            مدل و پرامپتی که در «تنظیمات ← هوش مصنوعی» تعیین کرده‌اید، وضعیت واقعی تسک‌های شما را می‌بیند و بازخورد می‌دهد (در اعلان‌ها هم ثبت می‌شود).
          </p>

          {tfError && <p className="text-red-600 text-sm mb-2">{tfError}</p>}

          {tfContext && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3" data-testid="task-feedback-context">
              <div className="rounded-lg bg-gray-50 p-2 text-center">
                <div className="text-lg font-bold text-gray-900">{tfContext.total ?? 0}</div>
                <div className="text-xs text-gray-500">کل</div>
              </div>
              <div className="rounded-lg bg-green-50 p-2 text-center">
                <div className="text-lg font-bold text-green-700">{tfContext.completed ?? 0}</div>
                <div className="text-xs text-gray-500">انجام‌شده</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-2 text-center">
                <div className="text-lg font-bold text-blue-700">{tfContext.pending ?? 0}</div>
                <div className="text-xs text-gray-500">در انتظار</div>
              </div>
              <div className="rounded-lg bg-red-50 p-2 text-center">
                <div className="text-lg font-bold text-red-700">{tfContext.overdue ?? 0}</div>
                <div className="text-xs text-gray-500">عقب‌افتاده</div>
              </div>
            </div>
          )}

          {feedback && (
            <p data-testid="task-feedback-text" className="text-sm text-gray-700 whitespace-pre-wrap bg-indigo-50 border border-indigo-100 rounded-lg p-3">
              {feedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SmartAssistant;
