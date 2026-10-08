"""Readers for the formats `inspection_files.extract` used to give up on.

The owner's rule (2026-10-08): «هر نوع فرمتی باید خونده بشه توسط ناظر … و حتی
کامل هم خونده بشه نه خلاصه و یا اوایل اون فایل». So every reader here returns
the WHOLE text, never a sample:

    .doc   Word 97–2003 — the piece table, read straight from the OLE container
    .xls   Excel 97–2003 — every sheet, every non-empty cell (xlrd)
    .rtf   rich text (striprtf; \\uN unicode escapes included)
    .odt .ods .odp   OpenDocument — content.xml
    .epub  every chapter, in spine order
    .eml   e-mail — headers, every text part, and every attachment (recursively)
    .msg   Outlook — subject, sender, body, and every attachment (recursively)
    .zip   EVERY member, recursively, each through its own reader
    *      anything that is really text, whatever its extension

Audio and video go through `inspection_media` (a full transcript, not a summary).
"""
from __future__ import annotations

import email
import email.policy
import io
import mimetypes
import re
import struct
import zipfile
from pathlib import Path
from typing import Callable

#: zip safety — a bomb must not take the server down, and hitting a cap is
#: reported (truncated=True), never silent
ZIP_MAX_MEMBERS = 3000
ZIP_MAX_TOTAL_BYTES = 600 * 1024 * 1024
ZIP_MAX_DEPTH = 4

MEDIA_EXT = (".mp3", ".wav", ".m4a", ".ogg", ".oga", ".opus", ".flac", ".aac", ".amr", ".wma",
             ".aif", ".aiff", ".weba", ".mp4", ".mov", ".mkv", ".webm", ".avi", ".3gp", ".m4v",
             ".wmv", ".mpeg", ".mpg", ".mts", ".ts")


def is_media(name: str, mime: str = "") -> bool:
    mime = (mime or "").lower()
    return mime.startswith(("audio/", "video/")) or Path((name or "").lower()).suffix in MEDIA_EXT


def guess_mime(name: str) -> str:
    return mimetypes.guess_type(name or "")[0] or ""


# ---------------------------------------------------------------------------
# anything that is really text
# ---------------------------------------------------------------------------
def sniff_text(data: bytes) -> str | None:
    """The text, when the bytes ARE text whatever the extension says (a .conf,
    a .kt, a log with no extension…). None for binary."""
    if not data:
        return None
    if data.startswith((b"\xff\xfe", b"\xfe\xff")):
        try:
            return data.decode("utf-16")
        except UnicodeDecodeError:
            return None
    head = data[:65536]
    if b"\x00" in head:
        return None
    for enc in ("utf-8-sig", "cp1256"):
        try:
            text = data.decode(enc)
        except UnicodeDecodeError:
            continue
        printable = sum(ch.isprintable() or ch in "\r\n\t" for ch in text[:20000])
        if printable >= 0.97 * min(len(text), 20000):
            return text
    return None


# ---------------------------------------------------------------------------
# Word 97–2003 (.doc)
# ---------------------------------------------------------------------------
def doc_text(data: bytes) -> str:
    """The document text from the piece table (CLX) — the same text Word shows,
    in order, both 8-bit (cp1252) and UTF-16 pieces (Persian is UTF-16)."""
    import olefile

    ole = olefile.OleFileIO(io.BytesIO(data))
    wd = ole.openstream("WordDocument").read()
    flags = struct.unpack_from("<H", wd, 0x0A)[0]
    table = ole.openstream("1Table" if flags & 0x0200 else "0Table").read()
    fc_clx, lcb_clx = struct.unpack_from("<II", wd, 0x01A2)
    clx = table[fc_clx:fc_clx + lcb_clx]
    i = 0
    while i < len(clx) and clx[i] == 0x01:                 # Prc — formatting, skip
        i += 3 + struct.unpack_from("<H", clx, i + 1)[0]
    if i >= len(clx) or clx[i] != 0x02:
        raise ValueError("جدولِ قطعه‌ها (CLX) پیدا نشد")
    lcb = struct.unpack_from("<I", clx, i + 1)[0]
    plc = clx[i + 5:i + 5 + lcb]
    n = (lcb - 4) // 12
    cps = struct.unpack_from(f"<{n + 1}I", plc, 0)
    out = []
    for k in range(n):
        pcd = plc[(n + 1) * 4 + k * 8:(n + 1) * 4 + k * 8 + 8]
        fc = struct.unpack_from("<I", pcd, 2)[0]
        count = cps[k + 1] - cps[k]
        if fc & 0x40000000:
            start = (fc & 0x3FFFFFFF) // 2
            out.append(wd[start:start + count].decode("cp1252", "replace"))
        else:
            out.append(wd[fc:fc + 2 * count].decode("utf-16-le", "replace"))
    text = "".join(out)
    text = re.sub(r"\x13[^\x14\x15]*\x14?", "", text)       # field instructions
    text = text.replace("\x07", " | ").replace("\x0b", "\n").replace("\r", "\n").replace("\x0c", "\n")
    return re.sub(r"[\x00-\x08\x0e-\x1f]", "", text)


# ---------------------------------------------------------------------------
# Excel 97–2003 (.xls)
# ---------------------------------------------------------------------------
def xls_text(data: bytes) -> str:
    import xlrd

    book = xlrd.open_workbook(file_contents=data)
    parts = []
    for sh in book.sheets():
        parts.append(f"=== کاربرگ: {sh.name} ({sh.nrows}×{sh.ncols}) ===")
        for r in range(sh.nrows):
            cells = [str(v).strip() for v in sh.row_values(r)]
            if any(cells):
                parts.append(" | ".join(cells))
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# RTF, OpenDocument, EPUB
# ---------------------------------------------------------------------------
def rtf_text(data: bytes) -> str:
    from striprtf.striprtf import rtf_to_text

    return rtf_to_text(data.decode("latin-1"), errors="ignore")


def _xml_paras(xml: str) -> str:
    xml = re.sub(r"<(text:p|text:h|table:table-row)\b[^>]*/>", "\n", xml)
    xml = re.sub(r"</(text:p|text:h|table:table-row|text:list-item)>", "\n", xml)
    xml = re.sub(r"</table:table-cell>", " | ", xml)
    xml = re.sub(r"<text:tab/>", "\t", xml)
    xml = re.sub(r"<text:line-break/>", "\n", xml)
    xml = re.sub(r"<[^>]+>", "", xml)
    import html as _html

    return _html.unescape(re.sub(r"\n{3,}", "\n\n", xml))


def odf_text(data: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        return _xml_paras(z.read("content.xml").decode("utf-8", "replace"))


def epub_text(data: bytes, html_text: Callable[[bytes], str]) -> str:
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        names = z.namelist()
        order: list[str] = []
        try:
            container = z.read("META-INF/container.xml").decode("utf-8", "replace")
            opf_path = re.search(r'full-path="([^"]+)"', container).group(1)
            opf = z.read(opf_path).decode("utf-8", "replace")
            base = opf_path.rsplit("/", 1)[0] + "/" if "/" in opf_path else ""
            items = dict(re.findall(r'<item\b[^>]*\bid="([^"]+)"[^>]*\bhref="([^"]+)"', opf))
            items.update({k: v for v, k in re.findall(r'<item\b[^>]*\bhref="([^"]+)"[^>]*\bid="([^"]+)"', opf)})
            order = [base + items[i] for i in re.findall(r'<itemref\b[^>]*\bidref="([^"]+)"', opf) if i in items]
        except Exception:  # noqa: BLE001 — fall back to name order
            order = []
        if not order:
            order = sorted(n for n in names if n.lower().endswith((".xhtml", ".html", ".htm")))
        parts = []
        for n in order:
            if n in names:
                parts.append(f"=== {n} ===\n" + html_text(z.read(n)))
        return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# e-mail (.eml) and Outlook (.msg) — with their attachments
# ---------------------------------------------------------------------------
def eml_text(data: bytes, read: Callable[[bytes, str, str, int], dict], depth: int,
             html_text: Callable[[bytes], str]) -> str:
    msg = email.message_from_bytes(data, policy=email.policy.default)
    head = [f"{h}: {msg[h]}" for h in ("From", "To", "Cc", "Date", "Subject") if msg[h]]
    parts, plain_seen = [], False
    for part in msg.walk():
        if part.is_multipart():
            continue
        fname = part.get_filename()
        payload = part.get_payload(decode=True) or b""
        ctype = part.get_content_type()
        if fname:
            sub = read(payload, fname, ctype, depth + 1)
            parts.append(f"=== پیوستِ ایمیل: {fname} ({sub['status']}) ===\n{sub['text'] or sub['note']}")
        elif ctype == "text/plain":
            plain_seen = True
            parts.append(payload.decode(part.get_content_charset() or "utf-8", "replace"))
        elif ctype == "text/html" and not plain_seen:
            parts.append(html_text(payload))
    return "\n".join(head) + "\n\n" + "\n\n".join(parts)


def msg_text(data: bytes, read: Callable[[bytes, str, str, int], dict], depth: int) -> str:
    import olefile

    ole = olefile.OleFileIO(io.BytesIO(data))

    def s(path: str) -> str:
        for suffix, enc in (("001F", "utf-16-le"), ("001E", "cp1252")):
            p = path + suffix
            if ole.exists(p):
                return ole.openstream(p).read().decode(enc, "replace").rstrip("\x00")
        return ""

    out = [f"From: {s('__substg1.0_0C1A')} <{s('__substg1.0_0C1F')}>",
           f"To: {s('__substg1.0_0E04')}", f"Subject: {s('__substg1.0_0037')}", "", s("__substg1.0_1000")]
    seen = set()
    for entry in ole.listdir():
        if entry and entry[0].startswith("__attach_version1.0_") and entry[0] not in seen:
            seen.add(entry[0])
            base = entry[0] + "/"
            name = s(base + "__substg1.0_3707") or s(base + "__substg1.0_3704") or entry[0]
            if ole.exists(base + "__substg1.0_37010102"):
                sub = read(ole.openstream(base + "__substg1.0_37010102").read(), name, guess_mime(name), depth + 1)
                out.append(f"\n=== پیوستِ ایمیل: {name} ({sub['status']}) ===\n{sub['text'] or sub['note']}")
    return "\n".join(out)


# ---------------------------------------------------------------------------
# zip — every member, through its own reader
# ---------------------------------------------------------------------------
def zip_text(data: bytes, read: Callable[[bytes, str, str, int], dict], depth: int) -> tuple[str, bool, str, int]:
    """`(text, truncated, note, media_pending)`. Each member is read by `read` (the full
    `extract`), so a .docx in a .zip in a .zip is read like any .docx."""
    if depth > ZIP_MAX_DEPTH:
        return "", True, f"آرشیوِ تو در تو عمیق‌تر از {ZIP_MAX_DEPTH} لایه — بقیه را باید جدا باز کرد", 0
    parts, total, truncated, counts = [], 0, False, {}
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        infos = [i for i in z.infolist() if not i.is_dir()]
        if len(infos) > ZIP_MAX_MEMBERS:
            infos, truncated = infos[:ZIP_MAX_MEMBERS], True
        for info in infos:
            total += info.file_size
            if total > ZIP_MAX_TOTAL_BYTES:
                truncated = True
                parts.append(f"=== {info.filename} — از سقفِ حجمِ بازشده گذشت؛ بقیه خوانده نشد ===")
                break
            sub = read(z.read(info), info.filename, guess_mime(info.filename), depth + 1)
            counts[sub["status"]] = counts.get(sub["status"], 0) + 1
            truncated = truncated or bool(sub.get("truncated"))
            body = sub["text"] if sub["text"] else f"[{sub['note']}]"
            parts.append(f"===== {info.filename} ({sub['status']}) =====\n{body}")
    note = (f"آرشیو: {sum(counts.values())} فایل، هر کدام با خوانندهٔ خودش — "
            + "، ".join(f"{k}: {v}" for k, v in sorted(counts.items()))
            + ("؛ تصویر/صوت/ویدیوی داخلش را `inspection.py pull` جدا باز می‌کند" if
               counts.get("image") or counts.get("pending") else ""))
    return "\n\n".join(parts), truncated, note, counts.get("pending", 0)
