/**
 * «نظارت و سرکشی» — the client half of /api/inspection, plus the shared
 * colours, display preferences and the «a sheet changed» event.
 *
 * Built on the app's one axios instance (`lib/api.js`), so auth, the X-LM-Page
 * stamp and the 401 handling are exactly what every other page gets.
 */
import api from '../api';

export const inspectionApi = {
  list: (params = {}) => api.get('/inspection', { params }).then((r) => r.data),
  get: (id) => api.get(`/inspection/${id}`).then((r) => r.data),
  create: (body) => api.post('/inspection', body).then((r) => r.data),
  note: (id, body) => api.post(`/inspection/${id}/notes`, body).then((r) => r.data),
  editNote: (id, noteId, text) => api.patch(`/inspection/${id}/notes/${noteId}`, { text }).then((r) => r.data),
  setStatus: (id, status) => api.post(`/inspection/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/inspection/${id}`).then((r) => r.data),
  rush: (id) => api.post(`/inspection/${id}/urgent`).then((r) => r.data),
  unrush: (id) => api.delete(`/inspection/${id}/urgent`).then((r) => r.data),
  urgentQueue: () => api.get('/inspection/urgent').then((r) => r.data),
  rounds: () => api.get('/inspection/rounds').then((r) => r.data),
  inventory: () => api.get('/inspection/inventory').then((r) => r.data),
  binders: () => api.get('/inspection/binders').then((r) => r.data),
  fileApproved: () => api.post('/inspection/file').then((r) => r.data),
  storage: () => api.get('/inspection/storage').then((r) => r.data),
  offload: () => api.post('/inspection/storage/offload').then((r) => r.data),
  fileText: (fileId, offset = 0) => api.get(`/inspection/files/${fileId}/text`, { params: { offset } })
    .then((r) => r.data),
  removeFile: (fileId) => api.delete(`/inspection/files/${fileId}`).then((r) => r.data),
  /** Multipart, with progress — a 100 MB sample must never ride inside JSON. */
  upload: (id, file, { caption = '', noteId = '', onProgress } = {}) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('caption', caption);
    fd.append('note_id', noteId);
    return api.post(`/inspection/${id}/files`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((100 * e.loaded) / e.total));
      },
    }).then((r) => r.data);
  },
  shotUrl: (shotId) => `/inspection/shots/${shotId}`,
  rawUrl: (fileId) => `/inspection/files/${fileId}/raw`,
};

/** Fetch an authed binary (shot or file) as an object URL — `<img src>` cannot
 *  carry the Authorization header the app's axios instance adds. */
export async function authedObjectUrl(path) {
  const r = await api.get(path, { responseType: 'blob' });
  return URL.createObjectURL(r.data);
}

export function apiError(e) {
  const d = e?.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg || String(x)).join(' · ');
  return e?.message || 'خطای ناشناخته';
}

// ── the colour of a sheet = WHOSE TURN it is (owner's rule, ALLIN1 v166) ──
//   نارنجی open      منتظرِ ناظر — و جایی که یادداشتِ تازهٔ مالک برش می‌گرداند
//   سبز    answered  ناظر جواب داده
//   آبی    approved  مالک تیک زد — دورِ بعدِ ناظر بایگانی‌اش می‌کند
//   خاکستری filed     در زونکن — هایلایت برداشته می‌شود
// The OUTCOME (fixed / partial / …) is a word next to it, never the colour.
export const TONE_RGB = {
  open: '245, 158, 11',
  answered: '16, 185, 129',
  approved: '59, 130, 246',
  filed: '107, 114, 128',
};

export const TONE_BG = {
  open: 'bg-amber-500',
  answered: 'bg-emerald-600',
  approved: 'bg-blue-600',
  filed: 'bg-gray-400',
};

export const OUTCOME_BG = {
  fixed: 'bg-emerald-700',
  partial: 'bg-yellow-600',
  'needs-owner': 'bg-purple-600',
  'not-done': 'bg-red-600',
  stale: 'bg-gray-500',
};

export const STATUS_LABEL = {
  open: 'در انتظارِ ناظر',
  answered: 'ناظر پاسخ داد',
  approved: 'تأییدِ تو',
  filed: 'بایگانی',
};

// ── the «sheets changed» event: every action changes a colour somewhere ──
export const SHEETS_EVT = 'lm:inspection-sheets';
export const notifySheetsChanged = () => {
  try { window.dispatchEvent(new CustomEvent(SHEETS_EVT)); } catch { /* SSR / old browser */ }
};

// ── per-viewer display preferences — a preference, not a permission ──
export const HL_ENABLED_KEY = 'lm.inspection.highlights';
export const HL_OPACITY_KEY = 'lm.inspection.highlightOpacity';
export const HL_DEFAULT_OPACITY = 0.22;
export const PREFS_EVT = 'lm:inspection-prefs';
export const clampOpacity = (n) => Math.min(0.9, Math.max(0.04, n));

export function readHighlightsEnabled() {
  try { return localStorage.getItem(HL_ENABLED_KEY) !== '0'; } catch { return true; }
}
export function readHighlightOpacity() {
  try {
    const raw = localStorage.getItem(HL_OPACITY_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? clampOpacity(n) : HL_DEFAULT_OPACITY;
  } catch { return HL_DEFAULT_OPACITY; }
}
export function writeHighlightsEnabled(on) {
  try { localStorage.setItem(HL_ENABLED_KEY, on ? '1' : '0'); } catch { /* blocked */ }
  try { window.dispatchEvent(new CustomEvent(PREFS_EVT)); } catch { /* */ }
}
export function writeHighlightOpacity(v) {
  try { localStorage.setItem(HL_OPACITY_KEY, String(clampOpacity(v))); } catch { /* blocked */ }
  try { window.dispatchEvent(new CustomEvent(PREFS_EVT)); } catch { /* */ }
}
