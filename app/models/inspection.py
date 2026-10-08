"""«نظارت و سرکشی» — the owner's own inspection rounds over the app's screens.

THE LOOP
    the owner switches on 📝, draws a box around a fault or a wish on ANY page
    (or files a «درخواستِ عمومی» that points at no page at all)  →  a sheet is
    filed with the exact way BACK to that spot  →  a Claude Code routine reads
    the queue, does the work, and writes its answer UNDER the sheet  →  the
    owner looks and ticks it  →  the NEXT round archives it into a binder.

Ported from two sibling projects the owner built this with (ALLIN1 and
Detective-1, both read-only references — nothing there was changed). Every rule
below was paid for there first; the docstrings say what broke.

THE THREE RULES THIS SHAPE ENFORCES
  1. **`status` is whose turn it is; `outcome` is what actually happened.** They
     were one field once, and a supervisor that merely REPLIED («نشد») turned the
     sheet as green as one really fixed. The owner's verdict on that: «برای همه
     نوشته انجام شده ولی هیچکدوم درست نشده».
  2. **A claim of «fixed» needs the picture that proves it.** `outcome='fixed'`
     without an after-shot is refused at the API.
  3. **Only the owner ticks.** A GUARD, not a written rule: the supervisor's
     token is refused by the approve endpoint.

Screenshots and file bodies live in their own tables so a list of sheets never
ships megabytes.
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, LargeBinary, String, Text
from sqlalchemy.sql import func

from app.database import Base

# ---------------------------------------------------------------------------
# Whose turn — NOT how it went.
# ---------------------------------------------------------------------------
STATUS_OPEN = "open"            # ثبت شد / مالک دوباره نوشت — منتظرِ ناظر
STATUS_ANSWERED = "answered"    # ناظر زیرش نوشت (هر جوابی، حتی «نشد»)
STATUS_APPROVED = "approved"    # مالک تیک زد — دورِ بعد بایگانی می‌شود
STATUS_FILED = "filed"          # در زونکن
STATUSES = (STATUS_OPEN, STATUS_ANSWERED, STATUS_APPROVED, STATUS_FILED)

STATUS_LABEL = {
    STATUS_OPEN: "در انتظارِ ناظر",
    STATUS_ANSWERED: "ناظر پاسخ داد",
    STATUS_APPROVED: "تأییدِ مالک",
    STATUS_FILED: "بایگانی‌شده",
}

# ---------------------------------------------------------------------------
# What ACTUALLY happened — the supervisor's verdict on its own work.
# Deliberately NO value meaning «I think I fixed it».
# ---------------------------------------------------------------------------
OUTCOME_FIXED = "fixed"
OUTCOME_PARTIAL = "partial"
OUTCOME_NEEDS_OWNER = "needs-owner"
OUTCOME_NOT_DONE = "not-done"
OUTCOMES = (OUTCOME_FIXED, OUTCOME_PARTIAL, OUTCOME_NEEDS_OWNER, OUTCOME_NOT_DONE)

OUTCOME_LABEL = {
    OUTCOME_FIXED: "✓ درست شد",
    OUTCOME_PARTIAL: "◑ نیمه‌کاره",
    OUTCOME_NEEDS_OWNER: "؟ منتظرِ انتخابِ مالک",
    OUTCOME_NOT_DONE: "✗ درست نشد",
}

#: Sheets per binder before a new one is started.
BINDER_CAPACITY = 40

#: How long a claim on an urgent sheet is honoured. Long enough for a real
#: answer, short enough that a crashed run does not park a sheet for a day.
URGENT_CLAIM_TTL_S = 45 * 60

#: Where a sheet that points at no place on screen says it is from.
GENERAL_PAGE = "/inspection"
GENERAL_SECTION = "general"


class InspectionReport(Base):
    """One sheet: where the owner was, what they saw, and the conversation on it."""

    __tablename__ = "inspection_reports"

    id = Column(String(40), primary_key=True)
    #: Sequential, so the owner and the supervisor can both say «گزارشِ ۷».
    number = Column(Integer, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    status = Column(String(12), index=True, default=STATUS_OPEN, nullable=False)
    #: First line of the first note — the sheet's headline.
    title = Column(String(200), default="")
    created_by = Column(String(80), default="")

    # --- WHERE IN THE INTERFACE -------------------------------------------
    #: The route PATTERN, e.g. `/lists/:listId` — what the inventory knows it as.
    page = Column(String(200), default="", index=True)
    page_label = Column(String(200), default="")
    #: The section inside it (a hub tab, or a `data-report-section` block).
    section_id = Column(String(120), default="")
    section_label = Column(String(200), default="")
    #: THE load-bearing field: the exact URL that puts the supervisor back here,
    #: query and all (`/settings?tab=drive`) — Lifemanager's hubs are tabs.
    reopen = Column(String(400), default="", index=True)
    #: A short readable DOM path of what the box covered.
    dom_path = Column(String(400), default="")
    #: The visible text inside the box — what the owner was actually looking at.
    covered_text = Column(Text, default="")
    #: The box and the window, kept for older readers.
    rect_json = Column(Text, default="")
    viewport_json = Column(Text, default="")
    #: THE PRECISE RECORD: document coordinates, scroll, window, dpr, and the
    #: anchor element's verified selector with the box as FRACTIONS of it, so a
    #: highlight follows its content when the layout moves.
    geometry_json = Column(Text, default="")

    #: The conversation — a JSON list of notes.
    notes_json = Column(Text, default="[]")
    #: The dependency walk the supervisor did before answering — a JSON list.
    deps_json = Column(Text, default="[]")

    # --- «⚡ فوری»: four fields, four different questions --------------------
    #: WHEN it was asked for — the sort key, so «whichever I pressed first» is
    #: answered by the data, not by whatever order a query happens to return.
    urgent_at = Column(DateTime(timezone=True), nullable=True, index=True)
    #: A run has TAKEN it; a second run skips it. Time-stamped so a crashed run
    #: releases it after `URGENT_CLAIM_TTL_S`.
    urgent_claimed_at = Column(DateTime(timezone=True), nullable=True)
    urgent_claimed_by = Column(String(80), default="")
    #: Dealt with. Kept (rather than clearing `urgent_at`) so the page can say
    #: «what you rushed was answered».
    urgent_done_at = Column(DateTime(timezone=True), nullable=True)

    #: Set when filed.
    binder_id = Column(String(40), default="")
    binder_number = Column(Integer, default=0)
    binder_page = Column(Integer, default=0)
    filed_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<InspectionReport(number={self.number}, status='{self.status}')>"


class InspectionShot(Base):
    """A picture belonging to one note — `before` (what the owner saw) or
    `after` (the supervisor's proof of a fix)."""

    __tablename__ = "inspection_shots"

    id = Column(String(40), primary_key=True)
    report_id = Column(String(40), index=True, nullable=False)
    note_id = Column(String(40), index=True, default="")
    kind = Column(String(10), default="before")
    mime = Column(String(40), default="image/jpeg")
    #: base64 payload WITHOUT the data-URL prefix.
    data = Column(Text, default="")
    byte_size = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InspectionFile(Base):
    """ANY file attached to a sheet (or to one note under it), and the proof the
    supervisor read it.

    The owner's requirement that decides the design (ALLIN1, 2026-09-28):
    «حجم هم باعث نشه ناظر نتونه بگه من نمیخونمش». So the TEXT IS EXTRACTED AT
    UPLOAD, served in slices, and the slices are COUNTED (`read_chars`). A
    supervisor reply is refused while any readable file is unread.

    `extract_status` never collapses «nothing to read» into «I read nothing»:
    ok · empty · unsupported · failed · image are five different answers.
    """

    __tablename__ = "inspection_files"

    id = Column(String(40), primary_key=True)
    report_id = Column(String(40), index=True, nullable=False)
    #: The note this file belongs to; empty = the sheet itself.
    note_id = Column(String(40), index=True, default="")
    uploaded_by = Column(String(80), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    filename = Column(String(260), default="")
    mime = Column(String(120), default="application/octet-stream")
    byte_size = Column(Integer, default=0)
    sha256 = Column(String(64), default="")
    caption = Column(Text, default="")

    # --- where the bytes actually are --------------------------------------
    #: `drive` and `db` are durable (Drive folder, or chunk rows in
    #: `inspection_file_chunks`); `local` = container disk, wiped on the next
    #: deploy — only ever a last resort, and it says so in `store_note`.
    store = Column(String(12), default="")
    drive_id = Column(String(120), default="")
    drive_link = Column(String(400), default="")
    local_path = Column(String(400), default="")
    #: Why the durable store was not used, when it was not. Never silent.
    store_note = Column(Text, default="")

    # --- what the supervisor must read --------------------------------------
    extract_status = Column(String(12), default="pending")
    extract_note = Column(Text, default="")
    text = Column(Text, default="")
    text_chars = Column(Integer, default=0)
    page_count = Column(Integer, default=0)
    #: The extracted text is NOT the whole file (a ceiling was hit, or a PDF had
    #: scanned pages) — finishing the text does not discharge the duty.
    text_truncated = Column(Boolean, default=False)

    # --- the proof it was read ----------------------------------------------
    read_chars = Column(Integer, default=0)
    read_at = Column(DateTime(timezone=True), nullable=True)
    read_by = Column(String(80), default="")
    #: An image has no text; looking at it is fetching the bytes.
    viewed_at = Column(DateTime(timezone=True), nullable=True)


class InspectionFileChunk(Base):
    """The bytes of an attachment when Google Drive is not connected.

    Render's container disk is wiped on every deploy — and every supervisor fix
    IS a deploy — so a file kept there would vanish the moment the work on it
    shipped. Detective-1 keeps such files in the database in chunk rows; so do
    we. Chunked so one row never holds 100 MB and a read can stream in order.
    """

    __tablename__ = "inspection_file_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(String(40), index=True, nullable=False)
    seq = Column(Integer, nullable=False, default=0)
    data = Column(LargeBinary, nullable=False)


#: Bytes per chunk row.
FILE_CHUNK_BYTES = 1024 * 1024


#: The states in which a file HAS text a reviewer is obliged to finish.
READABLE = ("ok",)
EXTRACT_LABEL = {
    "ok": "متن استخراج شد — ناظر باید کاملش را بخواند",
    "empty": "فایل باز شد ولی متنی نداشت",
    "unsupported": "برای این نوع، استخراجِ متن نداریم — ناظر باید خودِ فایل را باز کند",
    "failed": "استخراج شکست خورد — دلیلش ثبت شده",
    "image": "تصویر است — ناظر باید نگاهش کند",
    "pending": "هنوز استخراج نشده",
}


def file_read_debt(files: list) -> list:
    """Which attached files the supervisor still owes a read on.

    An empty list is the only thing that lets it answer the sheet. Deliberately
    NOT «read_chars > 0»: fetching the first slice of a 90-page sample is not
    reading it — the debt is the remainder.
    """
    debt = []
    for f in files or []:
        status = str(getattr(f, "extract_status", "") or "")
        name = str(getattr(f, "filename", "") or "?")
        fid = getattr(f, "id", "")
        if status in READABLE:
            total = int(getattr(f, "text_chars", 0) or 0)
            got = int(getattr(f, "read_chars", 0) or 0)
            if total and got < total:
                debt.append({"file_id": fid, "filename": name, "reason": "text",
                             "read_chars": got, "text_chars": total,
                             "remaining": total - got})
            elif getattr(f, "text_truncated", False) and getattr(f, "viewed_at", None) is None:
                debt.append({"file_id": fid, "filename": name, "reason": "truncated",
                             "read_chars": got, "text_chars": total, "remaining": 1})
        elif status in ("image", "unsupported"):
            if getattr(f, "viewed_at", None) is None:
                debt.append({"file_id": fid, "filename": name, "reason": "unopened",
                             "read_chars": 0, "text_chars": 0, "remaining": 1})
    return debt


class InspectionBinder(Base):
    """A binder in the archive: where ticked sheets go to rest."""

    __tablename__ = "inspection_binders"

    id = Column(String(40), primary_key=True)
    number = Column(Integer, nullable=False)
    label = Column(String(120), default="")
    subtitle = Column(String(240), default="")
    opened_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
    #: Report ids, oldest first, as JSON.
    report_ids_json = Column(Text, default="[]")


def sheet_glow(status: str, notes: list) -> dict:
    """THE COLOUR — derived from the conversation, never stored.

    `tone` is the LIFECYCLE colour the owner asked for (ALLIN1 v166):
        نارنجی open — منتظرِ ناظر (یا مالک دوباره نوشت)
        سبز    answered — ناظر جواب داد
        آبی    approved — مالک تیک زد؛ دورِ بعد بایگانی می‌شود
        خاکستری filed
    `outcome` is what the supervisor claimed, shown as a word next to it — and a
    «fixed» with no after-picture is reported as `partial`, because proof is the
    thing that makes green mean something.
    """
    base = {"key": status, "label": STATUS_LABEL.get(status, status), "tone": status}
    if status in (STATUS_OPEN, STATUS_APPROVED, STATUS_FILED):
        last = next((n for n in reversed(notes or []) if n.get("by") == "reviewer"), None)
        if last and last.get("outcome"):
            base["outcome"] = last["outcome"]
            base["outcome_label"] = OUTCOME_LABEL.get(last["outcome"], last["outcome"])
        return base

    last = next((n for n in reversed(notes or []) if n.get("by") == "reviewer"), None)
    outcome = (last or {}).get("outcome")
    if not outcome:
        return {**base, "outcome": "stale", "outcome_label": "پاسخ بدونِ نتیجه"}
    if outcome == OUTCOME_FIXED and not (last or {}).get("after_shot_id"):
        return {**base, "outcome": OUTCOME_PARTIAL,
                "outcome_label": "ادعای انجام، بدونِ تصویرِ بعدش"}
    return {**base, "outcome": outcome, "outcome_label": OUTCOME_LABEL[outcome]}
