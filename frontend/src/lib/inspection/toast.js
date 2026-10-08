/**
 * A tiny announcement channel for «نظارت و سرکشی». The app has no toast
 * library; this is an event so the overlay (mounted once, in Layout) can show
 * what the board or the capture dialog did, without either importing the other.
 */
export const TOAST_EVT = 'lm:inspection-toast';

export function toast(text, kind = 'info', ms = 5000) {
  try {
    window.dispatchEvent(new CustomEvent(TOAST_EVT, { detail: { text, kind, ms, id: Date.now() + Math.random() } }));
  } catch { /* SSR */ }
}

toast.success = (t, ms) => toast(t, 'success', ms);
toast.error = (t, ms) => toast(t, 'error', ms ?? 8000);
