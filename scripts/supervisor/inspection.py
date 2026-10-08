#!/usr/bin/env python3
"""The supervisor's half of «نظارت و سرکشی» — Lifemanager.

The owner files sheets from any screen. The routine cannot walk over and look,
so this is the bridge: it PULLS the queue, writes every screenshot to a real
image file the routine can OPEN WITH ITS OWN EYES, reads every attached file to
the END, renders it all into one briefing, POSTS the answer back under the
sheet, and FILES the sheets the owner ticked.

    python3 scripts/supervisor/inspection.py whoami
    python3 scripts/supervisor/inspection.py file
    python3 scripts/supervisor/inspection.py pull
    python3 scripts/supervisor/inspection.py urgent
    python3 scripts/supervisor/inspection.py answer 7 --text-file /tmp/a.md \\
        --outcome fixed --after /tmp/after.png --commit abc1234 \\
        --dep "GET /api/tasks=ok" --dep "صفحهٔ لیست‌ها=missing:این فیلتر آنجا نیست" \\
        [--place "داخلِ همان ردیفِ دکمه‌ها، بعد از «ذخیره»"]

EXIT CODES — a contract, not a convenience:
    0  done / the queue is EMPTY (say nothing)
    3  could NOT read or write (server down, mid-deploy, bad credentials) —
       NEVER the same as «empty»: a routine that cannot see the queue must not
       look exactly like one that found it empty
    4  `pull`: the queue still OWES answers
    5  `urgent`: one sheet was claimed and is waiting in URGENT.md

THE RULES IT ENFORCES (ported from ALLIN1 / Detective-1, each one paid for):
  1. No sheet is left unanswered — «نشد» is an answer, silence is not.
  2. `fixed` needs the after-picture (`--after`).
  3. There is deliberately NO approve command — the tick is the owner's.
  4. Every answer carries its dependency walk (`--dep`) unless `--no-deps` says why.
  5. A sheet that asks for a PLACE («اینجا»، «این قسمت»…) and carries an anchored
     box cannot be `fixed` without `--place` saying exactly where it was put.
"""
from __future__ import annotations

import argparse
import base64
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from client import SupervisorError, api, credentials, request  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "docs" / "supervisor" / "inspection"
SHOTS = OUT_DIR / "shots"
FILES = OUT_DIR / "files"
BRIEF = OUT_DIR / "QUEUE.md"
URGENT = OUT_DIR / "URGENT.md"

OUTCOMES = ("fixed", "partial", "needs-owner", "not-done")


def _rel(p: Path) -> str:
    return str(p.relative_to(ROOT))


def _save_shot(shot_id: str, name: str) -> str | None:
    if not shot_id:
        return None
    st, raw = request(f"/api/inspection/shots/{shot_id}")
    if st != 200 or not raw:
        return None
    SHOTS.mkdir(parents=True, exist_ok=True)
    ext = ".png" if raw[:4] == b"\x89PNG" else ".webp" if raw[8:12] == b"WEBP" else ".jpg"
    path = SHOTS / f"{name}{ext}"
    path.write_bytes(raw)
    return _rel(path)


VIEWABLE = (".png", ".jpg", ".jpeg", ".gif", ".webp")
VIDEO_EXT = (".mp4", ".mov", ".mkv", ".webm", ".avi", ".3gp", ".m4v", ".wmv", ".mpeg", ".mpg", ".mts", ".ts")


def ensure_extracted(r: dict) -> dict:
    """Every attachment still `pending` (audio/video awaiting its FULL transcript,
    or an archive holding some) is extracted NOW, before the brief is written —
    then the sheet is re-read. Transcribing an hour of audio takes minutes."""
    pending = [f for f in r.get("files") or [] if f.get("extract_status") == "pending"]
    for f in pending:
        st, raw = request(f"/api/inspection/files/{f['id']}/extract", method="POST", timeout=1800)
        if st != 200:
            print(json.dumps({"extract_failed": f.get("filename"), "http": st,
                              "detail": raw.decode("utf-8", "replace")[:300]}, ensure_ascii=False), file=sys.stderr)
    if pending:
        r = api(f"/api/inspection/{r['id']}").get("report") or r
    return r


def _viewable(path: Path) -> Path | None:
    """A copy the Read tool can SHOW. HEIC/TIFF/BMP/AVIF/ICO… via Pillow (+pillow-heif),
    SVG via the headless browser. None when no converter is installed — said so."""
    ext = path.suffix.lower()
    if ext in VIEWABLE:
        return path
    out = path.with_name(path.name + ".png")
    if ext == ".svg":
        try:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as pw:
                b = pw.chromium.launch()
                pg = b.new_page()
                pg.goto(path.resolve().as_uri())
                pg.screenshot(path=str(out), full_page=True)
                b.close()
            return out
        except Exception:  # noqa: BLE001
            return None
    try:
        from PIL import Image
        try:
            import pillow_heif
            pillow_heif.register_heif_opener()
        except Exception:  # noqa: BLE001
            pass
        with Image.open(path) as im:
            frames = getattr(im, "n_frames", 1)
            im.seek(0)
            im.convert("RGB").save(out)
            for i in range(1, min(frames, 50)):          # multi-page TIFF: every page
                im.seek(i)
                im.convert("RGB").save(path.with_name(f"{path.name}.p{i + 1}.png"))
        return out
    except Exception:  # noqa: BLE001
        return None


def _video_frames(path: Path) -> tuple[str, int]:
    """One frame every 5 s (≤ 360) so the supervisor SEES the video, not only its
    transcript. Needs imageio-ffmpeg (scripts/supervisor/requirements.txt)."""
    try:
        import subprocess

        import imageio_ffmpeg
        dest = path.with_name(path.name + ".frames")
        dest.mkdir(exist_ok=True)
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-loglevel", "error", "-i", str(path),
                        "-vf", "fps=1/5,scale='min(1280,iw)':-2", "-frames:v", "360",
                        str(dest / "t%04d.jpg")], check=True, timeout=1200)
        return _rel(dest), len(list(dest.glob("*.jpg")))
    except Exception as exc:  # noqa: BLE001
        return f"(فریم گرفته نشد: {type(exc).__name__})", 0


def _unzip(path: Path) -> tuple[str, list[str]]:
    """Every member on disk (no path escapes), images made viewable, videos framed."""
    import zipfile
    dest = path.with_name(path.name + ".d")
    notes = []
    with zipfile.ZipFile(path) as z:
        for info in z.infolist():
            target = (dest / info.filename).resolve()
            if info.is_dir() or not str(target).startswith(str(dest.resolve())):
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(z.read(info))
            ext = target.suffix.lower()
            if ext in VIDEO_EXT:
                d, n = _video_frames(target)
                notes.append(f"{info.filename}: {n} فریم در `{d}`")
            elif ext == ".zip":
                d, inner = _unzip(target)
                notes += [f"{info.filename}/ {x}" for x in inner]
            else:
                v = _viewable(target) if ext in (".heic", ".heif", ".tif", ".tiff", ".bmp", ".avif",
                                                    ".ico", ".svg") else None
                if v and v != target:
                    notes.append(f"{info.filename}: برای دیدن ← `{_rel(v)}`")
    return _rel(dest), notes


def _read_file_fully(f: dict, number: int) -> dict:
    """ONE attached sample, completely — the server counts what it served, so a
    partial pull leaves a debt that blocks the answer. That is the point."""
    FILES.mkdir(parents=True, exist_ok=True)
    fid = f.get("id") or ""
    name = f.get("filename") or fid
    status = f.get("extract_status") or ""
    safe = re.sub(r"[^\w.\-() ]+", "_", name)[:120]
    out = {"filename": name, "status": status, "chars": 0, "path": "", "raw_path": "",
           "complete": False, "note": f.get("extract_note") or ""}
    if status == "ok":
        text, offset = "", 0
        for _ in range(500):                      # bounded: a runaway loop must end
            st, raw = request(f"/api/inspection/files/{fid}/text?offset={offset}&limit=2000000")
            if st != 200:
                out["note"] = f"خواندنِ متن شکست خورد: HTTP {st}"
                break
            page = json.loads(raw.decode("utf-8"))
            text += page.get("text") or ""
            if not page.get("has_more"):
                out["complete"] = bool(page.get("fully_read"))
                break
            offset = int(page.get("next_offset") or 0)
        path = FILES / f"r{number}-{safe}.txt"
        path.write_text(text, encoding="utf-8")
        out.update(chars=len(text), path=_rel(path))
        low = name.lower()
        # the text is complete, but some files must ALSO be looked at: what is
        # inside an archive (pictures, videos), a video's picture, a PDF's pages
        if not f.get("text_truncated") and not low.endswith((".zip", ".pdf") + VIDEO_EXT):
            return out
        out["note"] = (out["note"] + " | " if out["note"] else "") + \
            "متنش بریده شده بود — خودِ فایل هم گرفته شد؛ بقیه‌اش فقط در آن است"
        out["complete"] = False
    # no text to read (image / scanned PDF / unknown type) — OPEN it
    st, raw = request(f"/api/inspection/files/{fid}/raw", timeout=600)
    if st == 200 and raw:
        path = FILES / f"r{number}-{safe}"
        path.write_bytes(raw)
        out.update(raw_path=_rel(path), complete=True)
        if not out["path"]:
            out.update(path=_rel(path), chars=len(raw))
        low = name.lower()
        extra = []
        if low.endswith(".zip"):
            d, inner = _unzip(path)
            extra.append(f"همهٔ محتوای آرشیو باز شد در `{d}`" + (" — " + "؛ ".join(inner) if inner else ""))
        elif low.endswith(VIDEO_EXT):
            d, n = _video_frames(path)
            extra.append(f"{n} فریم (هر ۵ ثانیه) در `{d}` — **نگاهشان کن**؛ متنِ کامل (گفتار + شرحِ تصویر) بالاست")
        elif low.endswith(".pdf"):
            extra.append("PDF را با ابزارِ Read و پارامترِ `pages` **همهٔ صفحه‌ها** را ببین (۲۰ تا ۲۰ تا) — "
                         "جدول، شکل و صفحه‌های اسکن فقط آن‌جا دیده می‌شوند")
        elif status == "image" or low.endswith((".heic", ".heif", ".tif", ".tiff", ".bmp", ".avif", ".ico")):
            v = _viewable(path)
            if v is None:
                extra.append("تبدیل به قالبِ قابلِ دیدن نشد — `pip install -r scripts/supervisor/requirements.txt`")
            elif v != path:
                extra.append(f"برای دیدن: `{_rel(v)}`")
                out["raw_path"] = _rel(v)
        if extra:
            out["note"] = (out["note"] + " | " if out["note"] else "") + " | ".join(extra)
    else:
        out["note"] = (out["note"] + " | " if out["note"] else "") + f"گرفتنِ خودِ فایل نشد: HTTP {st}"
    return out


def where_block(r: dict) -> list[str]:
    """WHERE the owner pointed — one description used by BOTH briefs (ALLIN1
    v171: the urgent brief once lacked it and a «put it HERE» sheet was placed
    «above the form»)."""
    if r.get("general"):
        return ["- کجا: **درخواستِ عمومی** — به جای مشخصی از صفحه‌ها اشاره نمی‌کند"
                " (قابلیتِ تازه، تغییرِ کلی، یا سؤال)."]
    out = [f"- کجا: **{r.get('page_label')}**" + (f" ← {r['section_label']}" if r.get("section_label") else "")
           + f" (الگوی مسیر `{r.get('page')}`)",
           f"- نشانیِ بازگشت (همین را باز کن): `{r.get('reopen')}`"]
    if r.get("dom_path"):
        out.append(f"- عنصر: `{r['dom_path']}`")
    if r.get("covered_text"):
        out.append(f"- آنچه در کادر بود: {r['covered_text']}")
    g = r.get("geometry") or {}
    if not g:
        return out
    d, vp, a = g.get("doc") or {}, g.get("viewport") or {}, g.get("anchor") or {}
    anch, rel, arect = a.get("path") or "", a.get("rel") or {}, a.get("rect") or {}
    out.append(f"- **مختصات:** {round(d.get('w', 0))}×{round(d.get('h', 0))} پیکسل در "
               f"x={round(d.get('x', 0))} y={round(d.get('y', 0))} (مختصاتِ سند) · "
               f"پنجره {vp.get('w')}×{vp.get('h')}" + (f" · dpr {g.get('dpr')}" if g.get("dpr") not in (None, 1) else ""))
    out.append(f"- **گره:** `{anch}` — با تغییرِ چیدمان هم همان‌جا می‌ماند" if anch else
               "- **گره:** به عنصری گره نخورد؛ فقط مختصاتِ سند معتبر است (اگر چیدمان عوض شده، تقریبی است)")
    if anch and (rel.get("w") or rel.get("h")):
        pc = lambda v: f"{round(float(v or 0) * 100)}٪"  # noqa: E731
        out.append(f"- **جای دقیق داخلِ همان گره:** از **لبهٔ چپِ** گره {pc(rel.get('x'))}، از **بالای** گره "
                   f"{pc(rel.get('y'))} · اندازهٔ کادر {pc(rel.get('w'))} عرض و {pc(rel.get('h'))} ارتفاعِ گره "
                   f"(خودِ گره {round(float(arect.get('w') or 0))}×{round(float(arect.get('h') or 0))} پیکسل بود)")
        out.append("  > این کسرها «همان‌جا» را می‌گویند و با تغییرِ اندازهٔ پنجره هم معتبرند — صفحه راست‌به‌چپ است "
                   "ولی x مثلِ همیشه از چپ شمرده می‌شود. اگر خواسته «این را اینجا بگذار» است، جایش **همین** است، "
                   "نه «بالای فرم». اگر ممکن نیست، بنویس کجا گذاشتی و چرا، با نتیجهٔ `partial`.")
    return out


def notes_block(r: dict, prefix: str) -> list[str]:
    lines = []
    for i, n in enumerate(r.get("notes") or []):
        who = "🤖 ناظر" if n.get("by") == "reviewer" else "👤 مالک"
        tag = f" · نتیجه: `{n['outcome']}`" if n.get("outcome") else ""
        lines += [f"**{who} — یادداشتِ {i + 1}** ({n.get('at', '')}){tag}", "", n.get("text", ""), ""]
        if i > 0 and n.get("spot"):
            # a follow-up drawn on the page points at ITS OWN place — described as
            # fully as the sheet's (node + fractions), or §0-ب-۴ cannot apply to it
            lines.append("**کادرِ همین یادداشت (جای تازه — نه کادرِ برگهٔ اصلی):**")
            lines += ["  " + ln for ln in where_block(n["spot"])]
        for key, tag2 in (("shot_id", "before"), ("after_shot_id", "after")):
            if n.get(key):
                p = _save_shot(n[key], f"{prefix}r{r['number']}-n{i + 1}-{tag2}")
                if p:
                    lines.append(f"تصویر: `{p}` — **بازش کن و نگاه کن**")
        if n.get("commits"):
            lines.append("کامیت‌ها: " + " · ".join(n["commits"]))
        lines.append("")
    return lines


def files_block(r: dict) -> list[str]:
    if not r.get("files"):
        return []
    by_note = {n["id"]: i + 1 for i, n in enumerate(r.get("notes") or [])}
    lines = ["**فایل‌های مالک — محتوای کاملشان خوانده شد:**", ""]
    for f in r["files"]:
        got = _read_file_fully(f, r["number"])
        owner = f"یادداشتِ {by_note.get(f.get('note_id'), '?')}" if f.get("note_id") else "خودِ گزارش"
        lines.append(f"- {'✅' if got['complete'] else '⚠️'} `{got['filename']}` ({f.get('size_label', '')}، "
                     f"{f.get('extract_label') or got['status']}) — مالِ {owner}")
        if f.get("caption"):
            lines.append(f"  - توضیحِ مالک: {f['caption']}")
        if got["path"]:
            lines.append(f"  - محتوا: `{got['path']}`" + (f" — {got['chars']} نویسه" if got["chars"] else ""))
        if got["raw_path"] and got["raw_path"] != got["path"]:
            lines.append(f"  - خودِ فایل: `{got['raw_path']}` — **بازش کن**")
        if got["note"]:
            lines.append(f"  - {got['note']}")
        if not f.get("durable", True):
            lines.append("  - ⚠️ روی دیسکِ سرور است (با دیپلویِ بعدی پاک می‌شود) — همین دور بخوانش و به مالک بگو درایو وصل نیست")
        elif f.get("store") == "db":
            lines.append(f"  - فعلاً در پایگاه‌داده (منتظرِ انتقال به درایو): {f.get('store_note') or ''} — "
                         "`inspection.py file` منتقلش می‌کند؛ اگر نشد، دلیلش را گزارش کن")
        elif f.get("drive_link"):
            lines.append(f"  - در درایو: {f['drive_link']}")
    lines.append("")
    return lines


def _clean_workdir() -> None:
    for d in (SHOTS, FILES):
        if d.exists():
            for f in d.glob("*"):
                f.unlink()


def cmd_whoami() -> int:
    c = credentials()
    me = api("/api/inspection/whoami")
    st, body = request("/api/inspection/storage")
    store = json.loads(body or b"{}") if st == 200 else {"error": f"HTTP {st}"}
    print(json.dumps({"base": c["base"], "credential_source": c["source"],
                      "supervisor": me.get("supervisor"),
                      "server_configured": me.get("supervisor_configured"),
                      # where the owner's files live: Drive folder + what still waits in the DB
                      "storage": {"drive_connected": (store.get("drive") or {}).get("connected"),
                                  "drive_reason": (store.get("drive") or {}).get("reason"),
                                  "folder_link": (store.get("drive") or {}).get("folder_link"),
                                  "files": store.get("files"), "shots": store.get("shots"),
                                  "db_bytes": store.get("db_bytes"), "error": store.get("error")}},
                     ensure_ascii=False))
    return 0 if me.get("supervisor") else 3


def cmd_file() -> int:
    res = api("/api/inspection/file", payload={}, method="POST")
    # every round also moves what had to wait in the database (Drive was down,
    # or an upload failed its checksum) into the sheet's Drive folder
    off = api("/api/inspection/storage/offload", payload={}, method="POST")
    print(json.dumps({"filed": res.get("filed", 0), "pages": res.get("pages", []),
                      "to_drive": {"drive": off.get("drive"), "files_moved": off.get("files_moved", 0),
                                   "shots_moved": off.get("shots_moved", 0), "left_in_db": off.get("left", 0),
                                   "reason": off.get("reason") or "", "failed": off.get("failed") or []}},
                     ensure_ascii=False))
    return 0


def cmd_pull() -> int:
    q = api("/api/inspection/queue")
    _clean_workdir()
    reports = [ensure_extracted(r) for r in q.get("reports") or []]
    lines = [
        "# کارتابلِ «نظارت و سرکشی» — Lifemanager", "",
        f"- بدهیِ این دور (**باید همین دور جواب بگیرند**): **{q.get('owed', 0)}**",
        f"  - تازه و بی‌پاسخ: {q.get('unanswered', 0)}",
        f"  - **نیمه‌کاره/درست‌نشده — ادامهٔ کارِ دورِ قبل**: {q.get('unfinished', 0)}"
        + (f" (برگه‌های {'، '.join(str(n) for n in q.get('unfinished_numbers') or [])})" if q.get("unfinished_numbers") else ""),
        f"- پاسخ‌داده و تمام، منتظرِ تیکِ مالک: {q.get('waiting_for_owner', 0)}",
        f"- تأییدشده و آمادهٔ بایگانی: {q.get('to_file', 0)}",
        f"- فایل‌هایی که باید کامل خوانده شوند: **{q.get('files_to_read', 0)}**", "",
        "> `partial` یعنی «بقیه‌اش مانده» و `not-done` یعنی «هنوز کارِ نکرده دارد» — هر دو همین دور",
        "> برمی‌گردند و باید ادامه پیدا کنند، نه اینکه همان توضیح دوباره نوشته شود.",
        "> تصویرها در `shots/` و فایل‌ها در `files/` هستند. **بازشان کن و نگاه کن.**", "",
    ]
    for r in reports:
        lines += [f"## گزارشِ {r['number']} — {r['title']}", "",
                  f"- وضعیت: `{r['status']}` · {r['glow'].get('label', '')}"
                  + (f" · نتیجهٔ قبلی: {r['glow'].get('outcome_label')}" if r["glow"].get("outcome_label") else "")
                  + (" · ⚡ فوری" if r.get("urgent") else "")]
        lines += where_block(r)
        lines.append("")
        lines += notes_block(r, "")
        lines += files_block(r)
        if r.get("dependencies"):
            lines.append("**وابستگی‌هایی که قبلاً بررسی شد:**")
            lines += [f"- {d.get('status')} — {d.get('name')} {d.get('note') or ''}" for d in r["dependencies"]]
            lines.append("")
        lines += ["---", ""]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    BRIEF.write_text("\n".join(lines), encoding="utf-8")
    left = api("/api/inspection/queue").get("files_to_read", 0)
    print(json.dumps({"owed": q.get("owed", 0), "unanswered": q.get("unanswered", 0),
                      "unfinished": q.get("unfinished", 0), "unfinished_numbers": q.get("unfinished_numbers") or [],
                      "waiting_for_owner": q.get("waiting_for_owner", 0), "to_file": q.get("to_file", 0),
                      "files_read": q.get("files_to_read", 0), "files_still_unread": left,
                      "brief": _rel(BRIEF)}, ensure_ascii=False))
    return 4 if q.get("owed", 0) else 0


def cmd_urgent() -> int:
    got = api("/api/inspection/urgent/claim", payload={"by": "routine"}, method="POST")
    r = got.get("report")
    if not r:
        print(json.dumps({"claimed": None, "waiting": got.get("waiting", 0),
                          "in_progress_elsewhere": got.get("busy", 0)}, ensure_ascii=False))
        return 0
    _clean_workdir()
    r = ensure_extracted(r)
    lines = [f"# ⚡ فوری — گزارشِ {r['number']}: {r['title']}", "",
             "> مالک این را **خارج از نوبت** خواسته است. همین حالا انجامش بده، بعد جوابش را با",
             "> `inspection.py answer` بنویس. تا جواب ندهی از صفِ فوری بیرون نمی‌رود.", "",
             f"- وضعیت: `{r['status']}` · {r['glow'].get('label', '')}"]
    lines += where_block(r)
    lines += [f"- در صف: {got.get('waiting', 1)} برگه", ""]
    lines += notes_block(r, "urgent-")
    lines += files_block(r)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    URGENT.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"claimed": r["number"], "waiting": got.get("waiting", 1), "brief": _rel(URGENT)},
                     ensure_ascii=False))
    return 5


def _parse_dep(raw: str) -> dict:
    name, _, rest = raw.partition("=")
    status, _, note = rest.partition(":")
    return {"name": name.strip(), "status": (status or "ok").strip(), "note": note.strip()}


def _data_url(path: str) -> str:
    raw = Path(path).read_bytes()
    mime = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
            ".webp": "image/webp"}.get(Path(path).suffix.lower())
    if not mime:
        raise SupervisorError(f"فرمتِ «{Path(path).suffix}» برای تصویرِ بعد پشتیبانی نمی‌شود (png/jpg/webp)")
    return f"data:{mime};base64," + base64.b64encode(raw).decode()


PLACE_WORDS = ("در اینجا", "اینجا", "همین‌جا", "همینجا", "در این قسمت", "این قسمت", "این محل",
               "در این محل", "همین قسمت", "همین بخش", "این نقطه", "این جا")


def asks_for_a_place(report: dict) -> bool:
    """A box anchored to a node — the sheet's own, or one drawn with a follow-up —
    plus words that say «here»."""
    def _anchored(g) -> bool:
        return bool(((g or {}).get("anchor") or {}).get("path"))

    anchored = _anchored(report.get("geometry")) or any(
        _anchored((n.get("spot") or {}).get("geometry"))
        for n in report.get("notes") or [] if n.get("by") != "reviewer")
    if not anchored:
        return False
    said = " ".join(n.get("text", "") for n in report.get("notes") or [] if n.get("by") != "reviewer")
    return any(w in said for w in PLACE_WORDS)


def cmd_install_app(args) -> int:
    """An owner's HTML app attachment becomes a page WITHOUT entering the repo:
    the app serves the attachment itself at /apps/<slug> in a sandboxed iframe.
    Committing such a file as code is what the routine's safety check refuses."""
    body = {"file_id": args.file_id, "title": args.title, "icon": args.icon,
            "group": args.group, "after": args.after}
    if args.slug:
        body["slug"] = args.slug
    res = api("/api/mini-apps", payload=body, method="POST")
    print(json.dumps(res.get("app") or res, ensure_ascii=False))
    return 0


def cmd_answer(args) -> int:
    text = args.text or (Path(args.text_file).read_text(encoding="utf-8") if args.text_file else "")
    if not text.strip():
        raise SupervisorError("متنِ جواب خالی است — «نشد» هم باید نوشته شود")
    if args.outcome == "fixed" and not args.after:
        raise SupervisorError("«fixed» بدونِ تصویرِ بعدش پذیرفته نیست — `--after <عکس>` بده یا نتیجه را "
                              "`partial`/`not-done` بگذار. ادعای بی‌مدرک برگه را سبزِ دروغین می‌کند.")
    deps = [_parse_dep(d) for d in (args.dep or [])]
    if not deps and not args.no_deps:
        raise SupervisorError("هیچ وابستگی‌ای ثبت نشد — `--dep 'نام=ok|missing|risk:توضیح'` (یا اگر واقعاً "
                              "وابستگی ندارد، `--no-deps`)")
    lst = api("/api/inspection?include_filed=true&limit=2000")
    target = next((r for r in lst.get("reports", []) if r["number"] == args.number), None)
    if target is None:
        raise SupervisorError(f"گزارشِ {args.number} پیدا نشد")
    place = (args.place or "").strip()
    if args.outcome == "fixed" and asks_for_a_place(target) and not place:
        raise SupervisorError("این برگه «جا» خواسته (کادرِ گره‌خورده + «اینجا»). برای `fixed` باید "
                              "`--place \"…\"` بدهی و در یک جمله بنویسی دقیقاً کجا گذاشتی‌اش؛ اگر همان‌جا ممکن "
                              "نشد، نتیجه `partial` است.")
    if place:
        text = f"{text.rstrip()}\n\n**جایی که گذاشته شد:** {place}"
    body = {"text": text.strip(), "outcome": args.outcome, "commits": args.commit or [], "dependencies": deps}
    if args.after:
        body["after_shot"] = _data_url(args.after)
    res = api(f"/api/inspection/{target['id']}/notes", payload=body, method="POST")
    print(json.dumps({"ok": True, "number": args.number, "status": res["report"]["status"],
                      "glow": res["report"]["glow"].get("outcome_label")}, ensure_ascii=False))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="«نظارت و سرکشی» — the supervisor's side (Lifemanager)")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("whoami", help="ورود و تأییدِ هویتِ ناظر")
    sub.add_parser("file", help="تیک‌خورده‌ها → زونکن (هر دور)")
    sub.add_parser("pull", help="کارتابل + تصویرها + فایل‌ها")
    sub.add_parser("urgent", help="یک برگهٔ فوری را بردار")
    ia = sub.add_parser("install-app", help="فایلِ HTML ِ پیوستِ مالک → صفحه در منو (داده، نه کد)")
    ia.add_argument("--file-id", required=True)
    ia.add_argument("--title", required=True)
    ia.add_argument("--slug", default="")
    ia.add_argument("--icon", default="")
    ia.add_argument("--group", default="tools")
    ia.add_argument("--after", default="", help="مسیرِ لینکی که صفحه درست بعدش بنشیند، مثلاً /import")
    a = sub.add_parser("answer", help="جواب زیرِ یک برگه")
    a.add_argument("number", type=int)
    a.add_argument("--text")
    a.add_argument("--text-file")
    a.add_argument("--outcome", required=True, choices=OUTCOMES)
    a.add_argument("--after", help="تصویرِ بعد از اصلاح — برای fixed اجباری")
    a.add_argument("--commit", action="append")
    a.add_argument("--dep", action="append", help="'نام=ok|missing|risk:توضیح' — تکرارشدنی")
    a.add_argument("--no-deps", action="store_true")
    a.add_argument("--place", default="", help="یک جمله: دقیقاً کجا گذاشته شد")
    args = ap.parse_args()
    try:
        if args.cmd == "install-app":
            return cmd_install_app(args)
        return {"whoami": cmd_whoami, "file": cmd_file, "pull": cmd_pull, "urgent": cmd_urgent}.get(
            args.cmd, lambda: cmd_answer(args))()
    except SupervisorError as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
