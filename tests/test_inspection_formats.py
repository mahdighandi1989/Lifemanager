"""«هر نوع فرمتی باید خونده بشه … کامل، نه خلاصه» — every format, the WHOLE text."""
import base64
import io
import zipfile
from email.message import EmailMessage
from pathlib import Path

import pytest

from app.services.inspection_files import extract

from tests.test_inspection import _supervisor_token  # noqa: F401  (fixture)

FIX = Path(__file__).parent / "fixtures" / "inspection"


def _zip(files: dict) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        for name, data in files.items():
            z.writestr(name, data)
    return buf.getvalue()


def test_word_97_doc_is_read_in_full():
    ex = extract((FIX / "SampleDoc.doc").read_bytes(), "x.doc")
    assert ex["status"] == "ok"
    assert "I am a test document" in ex["text"] and "It’s also in blue" in ex["text"], "first AND last line"


def test_outlook_msg_is_read():
    ex = extract((FIX / "quick.msg").read_bytes(), "mail.msg")
    assert ex["status"] == "ok" and "Test the content transformer" in ex["text"]
    assert "The quick brown fox jumps over the lazy dog" in ex["text"]


def test_excel_97_xls_every_sheet():
    xlwt = pytest.importorskip("xlwt")
    wb = xlwt.Workbook()
    a, b = wb.add_sheet("هزینه"), wb.add_sheet("درآمد")
    a.write(0, 0, "نام"); a.write(0, 1, "مبلغ"); a.write(1, 0, "علی"); a.write(1, 1, 1200)
    b.write(0, 0, "پایانِ کاربرگِ دوم")
    buf = io.BytesIO(); wb.save(buf)
    ex = extract(buf.getvalue(), "book.xls")
    assert ex["status"] == "ok" and "علی | 1200" in ex["text"] and "پایانِ کاربرگِ دوم" in ex["text"]


def test_rtf_with_unicode_escapes():
    word = "".join("\\u%d?" % ord(c) for c in "سلام")
    rtf = ("{\\rtf1\\ansi\\uc1 " + word + " world\\par second line}").encode()
    ex = extract(rtf, "note.rtf")
    assert ex["status"] == "ok" and "سلام world" in ex["text"] and "second line" in ex["text"]


def test_opendocument_text():
    content = ('<office:document-content xmlns:office="o" xmlns:text="t"><office:body><office:text>'
               '<text:p>بندِ اول</text:p><text:p>بندِ آخر</text:p></office:text></office:body></office:document-content>')
    ex = extract(_zip({"mimetype": "application/vnd.oasis.opendocument.text", "content.xml": content}), "a.odt")
    assert ex["status"] == "ok" and "بندِ اول" in ex["text"] and "بندِ آخر" in ex["text"]


def test_epub_every_chapter_in_order():
    opf = ('<package><manifest><item id="c2" href="two.xhtml"/><item id="c1" href="one.xhtml"/></manifest>'
           '<spine><itemref idref="c1"/><itemref idref="c2"/></spine></package>')
    data = _zip({"META-INF/container.xml": '<container><rootfile full-path="OEBPS/b.opf"/></container>',
                 "OEBPS/b.opf": opf, "OEBPS/one.xhtml": "<p>فصل یک</p>", "OEBPS/two.xhtml": "<p>فصل دو</p>"})
    ex = extract(data, "book.epub")
    assert ex["status"] == "ok" and ex["text"].index("فصل یک") < ex["text"].index("فصل دو")


def test_email_with_its_attachments():
    m = EmailMessage()
    m["From"], m["To"], m["Subject"] = "a@x.com", "b@x.com", "قرارداد"
    m.set_content("متنِ ایمیل")
    m.add_attachment("محتوای پیوست".encode(), maintype="text", subtype="plain", filename="p.txt")
    ex = extract(m.as_bytes(), "m.eml")
    assert ex["status"] == "ok" and "Subject: قرارداد" in ex["text"]
    assert "متنِ ایمیل" in ex["text"] and "محتوای پیوست" in ex["text"]


def test_zip_reads_every_member_recursively():
    inner = _zip({"deep/notes.md": "# عمیق\nخطِ آخرِ درونی"})
    doc = (FIX / "SampleDoc.doc").read_bytes()
    data = _zip({"a.txt": "سلام", "b/c.doc": doc, "inner.zip": inner, "pic.png": b"\x89PNG\r\n"})
    ex = extract(data, "bundle.zip")
    assert ex["status"] == "ok"
    for needle in ("سلام", "I am a test document", "خطِ آخرِ درونی", "pic.png"):
        assert needle in ex["text"], needle
    assert "image: 1" in ex["note"]


def test_media_inside_a_zip_keeps_the_archive_pending():
    ex = extract(_zip({"a.txt": "x", "talk.mp3": b"ID3"}), "z.zip")
    assert ex["status"] == "pending" and "منتظرِ رونویسی" in ex["note"] and "x" in ex["text"]


def test_any_text_whatever_its_extension():
    ex = extract("key = مقدار\nline 2".encode(), "settings.conf9")
    assert ex["status"] == "ok" and "مقدار" in ex["text"]
    assert extract(b"\x00\x01\x02\x03binary", "blob.bin")["status"] == "unsupported"


def test_svg_is_text_and_images_still_must_be_seen():
    assert extract(b"<svg><text>x</text></svg>", "a.svg")["status"] == "ok"
    assert extract(b"\x89PNG\r\n", "a.heic", "image/heic")["status"] == "image"


def test_media_waits_for_a_full_transcript():
    ex = extract(b"ID3....", "voice.mp3", "audio/mpeg")
    assert ex["status"] == "pending"
    from app.models.inspection import file_read_debt
    from types import SimpleNamespace
    row = SimpleNamespace(id="f", filename="voice.mp3", extract_status="pending", viewed_at="now",
                          text_chars=0, read_chars=0, text_truncated=False)
    assert file_read_debt([row])[0]["reason"] == "pending", "opening the bytes is not hearing them"


# ── transcription: complete, continued until the end marker ─────────────────

class _RM:
    provider_key, model_key, api_key, base_url = "gemini", "gemini-x", "k", None
    display_name, max_output_tokens = "Gemini X", 100


@pytest.mark.asyncio
async def test_transcription_continues_until_the_end_and_uses_files_api(monkeypatch):
    import httpx

    from app.services import inspection_media as im

    async def pick(db):
        return _RM()
    monkeypatch.setattr(im, "pick_model", pick)
    monkeypatch.setattr(im, "INLINE_MAX", 10)           # force the Files API path
    calls = {"gen": 0, "upload": 0, "deleted": 0}

    def handler(req: httpx.Request):
        url = str(req.url)
        if "/upload/v1beta/files" in url:
            calls["upload"] += 1
            return httpx.Response(200, headers={"x-goog-upload-url": "https://up.example/session"})
        if url.startswith("https://up.example/session"):
            return httpx.Response(200, json={"file": {"name": "files/abc", "uri": "gs://abc", "state": "ACTIVE"}})
        if req.method == "DELETE":
            calls["deleted"] += 1
            return httpx.Response(200, json={})
        calls["gen"] += 1
        body = req.read().decode()
        assert "gs://abc" in body, "the uploaded file is what is transcribed"
        text = "[00:00:00] بخشِ اول " if calls["gen"] == 1 else "[00:10:00] بخشِ آخر\n<<END>>"
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": text}]}}]})

    real = httpx.AsyncClient
    monkeypatch.setattr(httpx, "AsyncClient", lambda **kw: real(transport=httpx.MockTransport(handler)))
    res = await im.transcribe(None, b"0" * 100, "talk.mp3", "audio/mpeg")
    assert res["ok"] and not res["truncated"]
    assert "بخشِ اول" in res["text"] and "بخشِ آخر" in res["text"] and "<<END>>" not in res["text"]
    assert calls == {"gen": 2, "upload": 1, "deleted": 1}


@pytest.mark.asyncio
async def test_no_audio_model_is_said_plainly(monkeypatch):
    from app.services import inspection_media as im

    async def none(db):
        return None
    monkeypatch.setattr(im, "pick_model", none)
    res = await im.transcribe(None, b"x", "a.mp3", "audio/mpeg")
    assert not res["ok"] and "تنظیمات AI" in res["note"]


@pytest.mark.asyncio
async def test_extract_endpoint_stores_the_full_transcript(api_client, monkeypatch, _supervisor_token):
    from app.services import inspection_media as im
    from tests.test_inspection import SUP, _create

    async def fake(db, data, filename, mime):
        return {"ok": True, "text": f"[00:00:00] رونویسیِ کاملِ {filename}", "note": "رونویسیِ کامل",
                "truncated": False, "model": "fake"}
    monkeypatch.setattr(im, "transcribe", fake)
    rid = _create(api_client)["id"]

    def up(name, data):
        r = api_client.post(f"/api/inspection/{rid}/files", files={"file": (name, data, "")})
        assert r.status_code == 200, r.text
        return r.json()["file"]

    mp3 = up("voice.mp3", b"ID3fake")
    assert mp3["extract_status"] == "pending"
    zf = up("pack.zip", _zip({"note.txt": "یادداشت", "in/talk.ogg": b"OggS"}))
    assert zf["extract_status"] == "pending"
    a = api_client.post(f"/api/inspection/files/{mp3['id']}/extract", headers=SUP).json()["file"]
    assert a["extract_status"] == "ok" and a["text_chars"] > 0
    b = api_client.post(f"/api/inspection/files/{zf['id']}/extract", headers=SUP).json()["file"]
    assert b["extract_status"] == "ok"
    text = api_client.get(f"/api/inspection/files/{zf['id']}/text", headers=SUP).json()["text"]
    assert "یادداشت" in text and "رونویسیِ کاملِ in/talk.ogg" in text
