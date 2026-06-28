import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// Import page — ported from ALLIN1. Two modes:
//   • صفحه‌گسترده: upload CSV/XLSX/JSON → dry-run preview → commit (bulk import)
//   • سند هوشمند: upload PDF/image/doc → AI model extracts rows → async job
// Targets (tasks/people/incomes/assets) + their columns come from the backend.
//   GET  /api/imports/targets              GET /api/imports/{t}/template
//   POST /api/imports/{t}?dry_run=         GET /api/imports/ai-models
//   POST /api/imports/analyze              GET /api/imports/jobs[/{id}]

function ResultBox({ result }) {
  if (!result) return null;
  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm" data-testid="import-result">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-700">
        <span>کل ردیف‌ها: <b>{result.total_rows}</b></span>
        {result.dry_run
          ? <span className="text-blue-600">قابل ایجاد: <b>{result.would_create}</b></span>
          : <span className="text-green-600">ایجادشده: <b>{result.created}</b></span>}
        <span className="text-amber-600">رد (تکراری): <b>{result.skipped_existing}</b></span>
        {result.errors?.length ? <span className="text-red-600">خطا: <b>{result.errors.length}</b></span> : null}
      </div>
      {result.errors?.length ? (
        <ul className="mt-2 list-disc pr-5 text-xs text-red-600 space-y-0.5">
          {result.errors.slice(0, 20).map((e, i) => (
            <li key={i}>ردیف {e.row}: {e.error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Import() {
  const { token } = useAuth();
  const [mode, setMode] = useState('sheet'); // 'sheet' | 'ai'
  const [targets, setTargets] = useState([]);
  const [target, setTarget] = useState('tasks');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [aiModels, setAiModels] = useState([]);
  const [modelId, setModelId] = useState('auto');
  const [jobs, setJobs] = useState([]);

  const authHeaders = useCallback(
    (extra = {}) => (token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra }),
    [token],
  );

  const loadJobs = useCallback(async () => {
    try {
      const r = await fetch('/api/imports/jobs', { headers: authHeaders() });
      if (r.ok) setJobs(await r.json());
    } catch { /* ignore */ }
  }, [authHeaders]);

  useEffect(() => {
    (async () => {
      try {
        const [tRes, mRes] = await Promise.all([
          fetch('/api/imports/targets', { headers: authHeaders() }),
          fetch('/api/imports/ai-models', { headers: authHeaders() }),
        ]);
        if (tRes.ok) setTargets(await tRes.json());
        if (mRes.ok) setAiModels((await mRes.json()).models || []);
      } catch (e) {
        setError('خطا در بارگذاری: ' + e.message);
      }
    })();
    loadJobs();
  }, [authHeaders, loadJobs]);

  const currentTarget = targets.find((t) => t.id === target);

  const runSheet = async (dryRun) => {
    if (!file) { setError('ابتدا فایل انتخاب کن'); return; }
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch(`/api/imports/${target}?dry_run=${dryRun}`, {
        method: 'POST', headers: authHeaders(), body: fd,
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detail || `HTTP ${r.status}`);
      setResult(j);
      if (!dryRun) loadJobs();
    } catch (e) {
      setError('خطا در ایمپورت: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const runAi = async () => {
    if (!file) { setError('ابتدا فایل انتخاب کن'); return; }
    setBusy(true); setError(null); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('target', target);
      if (modelId !== 'auto') fd.append('model_id', modelId);
      const r = await fetch('/api/imports/analyze', { method: 'POST', headers: authHeaders(), body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detail || `HTTP ${r.status}`);
      // poll the job
      const deadline = Date.now() + 5 * 60 * 1000;
      while (Date.now() < deadline) {
        await new Promise((res) => setTimeout(res, 2500));
        const jr = await fetch(`/api/imports/jobs/${j.job_id}`, { headers: authHeaders() });
        const job = await jr.json();
        if (job.status === 'done') { setResult(job.result); break; }
        if (job.status === 'error') { setError('استخراج ناموفق: ' + (job.error || '')); break; }
      }
      loadJobs();
    } catch (e) {
      setError('خطا در تحلیل سند: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="import-page" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">ایمپورت داده</h1>
        <p className="text-gray-500 mb-4">از فایل صفحه‌گسترده یا با کمک هوش مصنوعی از سند، داده وارد کن.</p>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-4">
          <button
            data-testid="mode-sheet"
            onClick={() => { setMode('sheet'); setResult(null); }}
            className={`px-4 py-2 rounded-lg text-sm ${mode === 'sheet' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >صفحه‌گسترده (CSV/Excel)</button>
          <button
            data-testid="mode-ai"
            onClick={() => { setMode('ai'); setResult(null); }}
            className={`px-4 py-2 rounded-lg text-sm ${mode === 'ai' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >سند هوشمند (AI)</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {/* Target picker */}
          <label className="block text-sm text-gray-700 mb-1">مقصد</label>
          <select
            data-testid="target-select"
            value={target}
            onChange={(e) => { setTarget(e.target.value); setResult(null); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 min-w-[220px]"
          >
            {targets.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>

          {currentTarget && (
            <p className="text-xs text-gray-400 mb-3">
              ستون‌ها: {currentTarget.columns.map((c) => c.name + (c.required ? '*' : '')).join('، ')}
              {mode === 'sheet' && (
                <>
                  {' · '}
                  <a className="text-blue-600 hover:underline" href={`/api/imports/${target}/template`}>دانلود قالب CSV</a>
                </>
              )}
            </p>
          )}

          {/* AI model picker */}
          {mode === 'ai' && (
            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">مدل هوش مصنوعی</label>
              <select
                data-testid="ai-model-select"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[220px]"
              >
                <option value="auto">خودکار (بهترین مدلِ سند/تصویر)</option>
                {aiModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.display_name} {m.supports_pdf ? '· PDF✓' : ''}</option>
                ))}
              </select>
              {aiModels.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">هیچ مدلِ سند/تصویرخوانی در «تنظیمات هوش مصنوعی» فعال نیست.</p>
              )}
            </div>
          )}

          {/* File input */}
          <input
            data-testid="file-input"
            type="file"
            accept={mode === 'ai' ? '.pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xlsm,.json,.txt' : '.csv,.xlsx,.xlsm,.json'}
            onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); }}
            className="block w-full text-sm mb-4"
          />

          {/* Actions */}
          {mode === 'sheet' ? (
            <div className="flex gap-2">
              <button
                data-testid="preview-btn"
                onClick={() => runSheet(true)}
                disabled={busy || !file}
                className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-200 disabled:opacity-50"
              >پیش‌نمایش (آزمایشی)</button>
              <button
                data-testid="commit-btn"
                onClick={() => runSheet(false)}
                disabled={busy || !file}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
              >ثبت نهایی</button>
            </div>
          ) : (
            <button
              data-testid="analyze-btn"
              onClick={runAi}
              disabled={busy || !file}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
            >{busy ? 'در حال تحلیل…' : 'تحلیل و ثبت با هوش مصنوعی'}</button>
          )}

          {error && <div className="mt-3 text-sm text-red-600" data-testid="import-error">{error}</div>}
          <ResultBox result={result} />
        </div>

        {/* History */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">تاریخچه ایمپورت هوشمند</h2>
          <ul className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-100" data-testid="import-history">
            {jobs.length === 0 ? (
              <li className="text-sm text-gray-400 p-3">هنوز ایمپورتی ثبت نشده.</li>
            ) : jobs.map((j) => (
              <li key={j.job_id} className="p-3 text-sm flex justify-between gap-2">
                <span className="text-gray-700">{j.filename} → {j.target}</span>
                <span className={
                  j.status === 'done' ? 'text-green-600' : j.status === 'error' ? 'text-red-600' : 'text-amber-600'
                }>
                  {j.status}{j.result ? ` · +${j.result.created}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Import;
