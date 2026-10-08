/**
 * Pictures for «نظارت و سرکشی» — mark the owner's box ON the picture, and make
 * any picture small enough to send. Ported from ALLIN1 (`annotateShot.ts`
 * v153/v165, `shrinkShot.ts` v175), read-only reference.
 *
 * «اون کادر هم باید تو عکس باشه … اگر با مختصات پیدا نکرد با عکس بتونه تطبیق
 * بده» — the coordinates and the marked picture corroborate each other; when the
 * anchor element is later gone, the picture still pins the spot down.
 *
 * «ریشه‌ای درست کن که محدودیتی نباشه» — a pasted 4K screenshot must never be
 * refused for being a screenshot, so everything is re-encoded first, and the
 * re-encoder NEVER fails: if the browser cannot help, the original is kept.
 */

/** The box moved from viewport coordinates into the captured image's own. A CSS
 *  transform (viewport box ÷ layout box) and the rasteriser's density (image ÷
 *  layout box) are two different scales — conflating them was off by 36px. */
export function boxInImage(box, target, image) {
  const lw = target.layoutWidth || target.width;
  const lh = target.layoutHeight || target.height;
  if (!lw || !lh || !image.width || !image.height) return null;
  const zoomX = target.width / lw || 1;
  const zoomY = target.height / lh || 1;
  const sx = image.width / lw;
  const sy = image.height / lh;
  const out = {
    x: ((box.x - target.left) / zoomX) * sx,
    y: ((box.y - target.top) / zoomY) * sy,
    w: (box.w / zoomX) * sx,
    h: (box.h / zoomY) * sy,
  };
  if (out.x + out.w < 0 || out.y + out.h < 0) return null;
  if (out.x > image.width || out.y > image.height) return null;
  return out;
}

/** The crop region, made safe — or null when degenerate / already the whole. */
export function clampCrop(crop, iw, ih) {
  if (!crop || !iw || !ih) return null;
  const x = Math.max(0, Math.floor(crop.x));
  const y = Math.max(0, Math.floor(crop.y));
  const w = Math.min(Math.ceil(crop.w), iw - x);
  const h = Math.min(Math.ceil(crop.h), ih - y);
  if (w < 16 || h < 16) return null;
  if (x === 0 && y === 0 && w === iw && h === ih) return null;
  return { x, y, w, h };
}

export const SHOT_DECODE_MS = 8000;
export const SHOT_MAX_PX = 2600;
export const SHOT_MAX_CHARS = 3_000_000;
export const SHOT_QUALITIES = [0.85, 0.7, 0.55, 0.42];

export function planSize(w, h, maxPx = SHOT_MAX_PX) {
  if (!(w > 0) || !(h > 0)) return { w: 0, h: 0 };
  const long = Math.max(w, h);
  if (long <= maxPx) return { w: Math.round(w), h: Math.round(h) };
  const k = maxPx / long;
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

export function isSmallEnough(dataUrl, w, h, maxChars = SHOT_MAX_CHARS, maxPx = SHOT_MAX_PX) {
  return dataUrl.length <= maxChars && Math.max(w, h) <= maxPx;
}

function loadImage(src, ms = SHOT_DECODE_MS) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // a decoder that never answers must not leave the dialog hanging for ever
    const t = setTimeout(() => reject(new Error('image decode timed out')), ms);
    img.onload = () => { clearTimeout(t); resolve(img); };
    img.onerror = () => { clearTimeout(t); reject(new Error('image did not load')); };
    img.src = src;
  });
}

/** A new data-URL: cropped (when asked), everything outside the box dimmed,
 *  the box outlined dark-under-bright so it reads on any background. */
export async function annotate(dataUrl, box, crop) {
  const img = await loadImage(dataUrl);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const c = clampCrop(crop, iw, ih);
  const canvas = document.createElement('canvas');
  canvas.width = c ? c.w : iw;
  canvas.height = c ? c.h : ih;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  let b = box;
  if (c) {
    ctx.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
    b = { x: box.x - c.x, y: box.y - c.y, w: box.w, h: box.h };
  } else {
    ctx.drawImage(img, 0, 0);
  }
  ctx.fillStyle = 'rgba(17, 17, 17, 0.45)';
  ctx.fillRect(0, 0, canvas.width, Math.max(0, b.y));
  ctx.fillRect(0, b.y + b.h, canvas.width, Math.max(0, canvas.height - (b.y + b.h)));
  ctx.fillRect(0, b.y, Math.max(0, b.x), b.h);
  ctx.fillRect(b.x + b.w, b.y, Math.max(0, canvas.width - (b.x + b.w)), b.h);
  const w = Math.max(2, Math.round(canvas.width / 400));
  ctx.lineWidth = w + 2;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.lineWidth = w;
  ctx.strokeStyle = '#f59e0b';
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  return canvas.toDataURL('image/jpeg', 0.85);
}

/** The same picture, small enough to send. Never throws, never returns nothing.
 *  JPEG on WHITE: a transparent PNG re-encoded without a fill comes out black. */
export async function shrinkShot(dataUrl, opts = {}) {
  const maxPx = opts.maxPx ?? SHOT_MAX_PX;
  const maxChars = opts.maxChars ?? SHOT_MAX_CHARS;
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
  try {
    const img = await loadImage(dataUrl);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (isSmallEnough(dataUrl, w, h, maxChars, maxPx)) return dataUrl;
    let size = planSize(w, h, maxPx);
    for (let pass = 0; pass < 4; pass++) {
      const canvas = document.createElement('canvas');
      canvas.width = size.w;
      canvas.height = size.h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return dataUrl;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size.w, size.h);
      ctx.drawImage(img, 0, 0, size.w, size.h);
      for (const q of SHOT_QUALITIES) {
        const out = canvas.toDataURL('image/jpeg', q);
        if (out.length <= maxChars) return out;
      }
      size = planSize(size.w, size.h, Math.round(Math.max(size.w, size.h) / 2));
      if (size.w < 200 || size.h < 200) {
        return canvas.toDataURL('image/jpeg', SHOT_QUALITIES[SHOT_QUALITIES.length - 1]);
      }
    }
    return dataUrl;
  } catch {
    return dataUrl;
  }
}
