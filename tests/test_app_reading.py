"""Attachments are read COMPLETELY (owner 2026-10-14: «کامل بخواند و بفهمد و خلاصه‌کاری نکند … هر چقدر هم زیاد،
چه در یک فایل و چه در تعدادِ مختلف … فرمت‌های بیشتر»). The model is faked; what is tested is that every byte of
every file reaches it (or the call says exactly what was not read)."""
from __future__ import annotations

import io
import zipfile

import pytest

pytestmark = pytest.mark.asyncio


class _Drive:
    def __init__(self, blobs):
        self.blobs = blobs

    async def download(self, did):
        return self.blobs[did]


async def _files(db, specs):
    from app.models.app_file import AppFile

    blobs, ids = {}, []
    for i, (name, mime, data) in enumerate(specs):
        f = AppFile(user_id=1, app="learning-architecture", rec_id="r1", name=name, mime=mime, size=len(data), drive_id=f"d{i}")
        db.add(f)
        await db.flush()
        blobs[f"d{i}"] = data
        ids.append(f.id)
    await db.commit()
    return blobs, ids


def _patch(monkeypatch, blobs, calls, *, fail_label=None):
    from app.services import app_reading as ar
    from app.services import google_api_client as g
    from app.services.ai import inference_gateway as gw

    ar._CACHE.clear()

    async def drive(db):
        return _Drive(blobs)

    async def complete(db, prompt, *, task="chat", system=None, max_tokens=1024, **kw):
        calls.append(("text", prompt, system))
        if fail_label and fail_label in prompt:
            return {"ok": False, "error": "boom", "text": ""}
        if system and "خوانندهٔ دقیقِ یک بخش" in system:
            return {"ok": True, "text": "NOTES[" + prompt[-40:] + "]" + ar.END, "model": "m"}
        return {"ok": True, "text": "ANSWER", "model": "m"}

    async def multimodal(db, prompt, files, *, task="x", system=None, max_tokens=1, **kw):
        calls.append(("mm", prompt, [f["filename"] for f in files]))
        return {"ok": True, "text": "DESC of " + files[0]["filename"] + " " + ar.END, "model": "m"}

    monkeypatch.setattr(g, "build_drive_client", drive)
    monkeypatch.setattr(gw, "complete", complete)
    monkeypatch.setattr(gw, "complete_multimodal", multimodal)


def _docx(text):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("[Content_Types].xml", "<Types/>")
        z.writestr("word/document.xml", f'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>{text}</w:t></w:r></w:p></w:body></w:document>')
    return buf.getvalue()


async def test_every_format_fully_in_one_call(db_session, monkeypatch):
    from app.services.app_reading import answer_with_files

    long_txt = ("سطرِ " + "x" * 50 + "\n") * 2000  # 112k chars — would have been cut at 6 000 before
    specs = [("notes.txt", "text/plain", long_txt.encode()), ("table.csv", "text/csv", "a,b\n1,2\n".encode()),
             ("word.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", _docx("متنِ ورد")),
             ("page.html", "text/html", b"<html><script>var k=1;</script><p>hi</p></html>"),
             ("blob.bin", "application/octet-stream", bytes(range(256)) * 40),
             ("shot.png", "image/png", b"\x89PNG....")]
    blobs, ids = await _files(db_session, specs)
    calls = []
    _patch(monkeypatch, blobs, calls)
    res = await answer_with_files(db_session, user_id=1, app="learning-architecture", file_ids=ids, task="lla_assistant",
                                  system="S", user="سؤال", max_tokens=100)
    assert res["ok"] and res["mode"] == "single"
    kind, prompt, files = calls[-1]
    assert kind == "mm" and files == ["shot.png"], "the image goes to the vision model with the full texts"
    assert long_txt.strip()[-200:] in prompt, "the END of a long file is in the prompt (no 6 000-char cut)"
    assert "متنِ ورد" in prompt and "a | b" in prompt and "var k=1" in prompt
    st = {m["name"]: m["status"] for m in res["files"]}
    assert st["blob.bin"] == "unsupported" and "unsupported" in prompt, "an unreadable file is named, never silently dropped"
    assert st["notes.txt"] == "ok" and st["shot.png"] == "image" and len(res["files"]) == 6


async def test_too_big_for_one_call_reads_every_chunk(db_session, monkeypatch):
    from app.services import app_reading as ar

    monkeypatch.setattr(ar, "SINGLE_CHARS", 50_000)
    monkeypatch.setattr(ar, "CHUNK_CHARS", 20_000)
    big = "".join(f"پاراگرافِ {i} " + "y" * 90 + "\n\n" for i in range(1500))  # ~150k chars
    blobs, ids = await _files(db_session, [("book.txt", "text/plain", big.encode())])
    calls = []
    _patch(monkeypatch, blobs, calls)
    res = await ar.answer_with_files(db_session, user_id=1, app="learning-architecture", file_ids=ids,
                                     task="learning_architecture", system="S", user="سؤال", max_tokens=100)
    assert res["ok"] and res["mode"] == "map"
    maps = [c for c in calls if c[2] and "خوانندهٔ دقیقِ یک بخش" in c[2]]
    chunks = ar.split_text("=== فایل: «book.txt» — ok ===\n" + big)
    assert len(maps) >= len(chunks) >= 7
    assert "پاراگرافِ 1499" in "".join(c[1] for c in maps), "the last paragraph was read"


async def test_a_failed_chunk_fails_the_call_instead_of_a_partial_answer(db_session, monkeypatch):
    from app.services import app_reading as ar

    monkeypatch.setattr(ar, "SINGLE_CHARS", 50_000)
    monkeypatch.setattr(ar, "CHUNK_CHARS", 20_000)
    big = "".join(f"p{i} " + "z" * 90 + "\n\n" for i in range(1500))
    blobs, ids = await _files(db_session, [("book.txt", "text/plain", big.encode())])
    calls = []
    _patch(monkeypatch, blobs, calls, fail_label="بخشِ 3 از")
    res = await ar.answer_with_files(db_session, user_id=1, app="learning-architecture", file_ids=ids,
                                     task="learning_architecture", system="S", user="q", max_tokens=100)
    assert not res["ok"] and "بخشِ 3 از" in res["error"]
    assert not any(c[2] == "S" for c in calls), "no final answer from a partial read"


async def test_many_images_are_each_read_not_dropped(db_session, monkeypatch):
    from app.services import app_reading as ar

    specs = [(f"p{i}.jpg", "image/jpeg", b"\xff\xd8" + b"0" * 10) for i in range(20)]  # > 16 inline
    blobs, ids = await _files(db_session, specs)
    calls = []
    _patch(monkeypatch, blobs, calls)
    res = await ar.answer_with_files(db_session, user_id=1, app="learning-architecture", file_ids=ids,
                                     task="lla_assistant", system="S", user="q", max_tokens=100)
    assert res["ok"]
    described = [c for c in calls if c[0] == "mm"]
    assert len(described) == 20
    assert all(f"DESC of p{i}.jpg" in calls[-1][1] for i in range(20))


async def test_scanned_pdf_pages_are_read_by_the_vision_model(db_session, monkeypatch):
    from app.services import app_reading as ar
    from app.services import inspection_files as inf

    blobs, ids = await _files(db_session, [("scan.pdf", "application/pdf", b"%PDF-fake")])
    calls = []
    _patch(monkeypatch, blobs, calls)
    monkeypatch.setattr(inf, "extract", lambda d, n, m="": {"status": "ok", "text": "--- صفحهٔ 2 ---\nلایهٔ متنی",
                                                           "note": "", "page_count": 3, "truncated": True})
    monkeypatch.setattr(ar, "_pdf_pages", lambda d: (["", "لایهٔ متنیِ صفحهٔ دو", ""], 3))
    monkeypatch.setattr(ar, "_pdf_slice", lambda d, pages: b"%PDF-slice")
    res = await ar.answer_with_files(db_session, user_id=1, app="learning-architecture", file_ids=ids,
                                     task="learning_architecture", system="S", user="q", max_tokens=100)
    assert res["ok"]
    final = calls[-1][1]
    assert final.count("DESC of pages.pdf") == 2 and "لایهٔ متنیِ صفحهٔ دو" in final
    assert res["files"][0]["complete"] is True


def test_split_covers_every_character():
    from app.services.app_reading import split_text

    t = "".join(f"جمله {i}. " for i in range(40000))
    parts = split_text(t, 10_000, 500)
    # every character is in some part, in order
    pos = 0
    for p in parts:
        k = t.find(p, max(0, pos - 600))
        assert k != -1 and k <= pos
        pos = k + len(p)
    assert pos == len(t)
