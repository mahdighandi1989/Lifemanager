"""Execution review 2026-10-15 of the attachment reader (owner: «کامل بخواند … هر حجمی، هر تعدادی … خلاصه‌کاری نکند;
مدل خودکار، سریع، دقیق، نه گران»):

1. the single-pass limit comes from the serving model's REAL context window (fixed 360k only as a fallback);
2. text beyond the window: the user's OWN question is asked of every full chunk (quotes + locations), merged, and the
   reply is marked ``reading="chunked"`` with a Persian ``reading_note`` — never generic «notes»;
3. a chunk answer missing its end marker is split in half and asked again; still cut ⇒ complete=False, named;
4. the final prompt always fits the window (merged until it does; never sent over the limit);
7. images inside zip/docx/pptx go through the same image path as attached images; unreadable ones ⇒ complete=False.
"""
from __future__ import annotations

import io
import zipfile

import pytest

from tests.test_app_reading import _Drive, _files

pytestmark = pytest.mark.asyncio

PNG = (b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
       b"\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82")


async def _gemini_window(db, monkeypatch, window_tokens):
    """A configured Gemini provider whose every enabled model has ``window_tokens`` of context."""
    from sqlalchemy import select

    from app.models.ai_catalog import AICatalogModel, AICatalogProvider
    from app.services.ai.catalog import seed_ai_catalog

    await seed_ai_catalog(db)
    for k in ("ANTHROPIC_API_KEY", "OPENAI_API_KEY", "CLAUDE_CODE_OAUTH_TOKEN"):
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "g-test-123456")
    for p in (await db.execute(select(AICatalogProvider))).scalars().all():
        p.enabled = p.key == "gemini"
    for m in (await db.execute(select(AICatalogModel).where(AICatalogModel.provider_key == "gemini"))).scalars().all():
        m.context_window = window_tokens
    await db.commit()


def _patch(monkeypatch, blobs, calls, *, map_reply=None):
    """Fake drive + model. ``map_reply(prompt, system) -> text`` answers chunk/merge calls (default: echo the label + END)."""
    from app.services import app_reading as ar
    from app.services import google_api_client as g
    from app.services.ai import inference_gateway as gw

    ar._CACHE.clear()

    async def drive(db):
        return _Drive(blobs)

    async def complete(db, prompt, *, task="chat", system=None, max_tokens=1024, **kw):
        if system and "خوانندهٔ دقیقِ یک بخش" in system:
            kind = "merge" if system == ar._MERGE_SYS else "map"
            calls.append((kind, prompt, system, max_tokens))
            if map_reply:
                return {"ok": True, "text": map_reply(prompt, system), "model": "m"}
            label = prompt.split("\n# ", 2)[-1].split("\n", 1)[0]
            return {"ok": True, "text": f"پاسخِ «{label}»: «نقلِ قولِ عینی» (صفحهٔ ۳) " + ar.END, "model": "m"}
        calls.append(("final", prompt, system, max_tokens))
        return {"ok": True, "text": "ANSWER", "model": "m"}

    async def multimodal(db, prompt, files, *, task="x", system=None, max_tokens=1, **kw):
        calls.append(("mm", prompt, [f["filename"] for f in files], max_tokens))
        return {"ok": True, "text": "DESC of " + files[0]["filename"], "model": "m"}

    monkeypatch.setattr(g, "build_drive_client", drive)
    monkeypatch.setattr(gw, "complete", complete)
    monkeypatch.setattr(gw, "complete_multimodal", multimodal)


async def _ask(db, ids, user="کدام بند دربارهٔ مهلتِ پرداخت است؟", system="S", max_tokens=6000):
    from app.services.app_reading import answer_with_files

    return await answer_with_files(db, user_id=1, app="learning-architecture", file_ids=ids, task="lla_assistant",
                                   system=system, user=user, max_tokens=max_tokens)


# ---------------------------------------------------------------------------- 1. window-derived single-pass limit
async def test_single_pass_limit_follows_the_models_real_window(db_session, monkeypatch):
    from app.services import app_reading as ar

    await _gemini_window(db_session, monkeypatch, 60_000)
    chars, window = await ar.window_chars(db_session, "lla_assistant", 6000)
    assert window == 60_000
    assert chars == int((60_000 - 6000 - ar.PROMPT_RESERVE_TOKENS) * ar.CHARS_PER_TOKEN) == 125_000

    # 200k characters: under the old fixed 360k it went in ONE call — far beyond a 60k-token window
    text = ("بندِ قرارداد " + "x" * 60 + "\n") * 2700
    blobs, ids = await _files(db_session, [("contract.txt", "text/plain", text.encode())])
    calls = []
    _patch(monkeypatch, blobs, calls)
    res = await _ask(db_session, ids)
    assert res["ok"] and res["mode"] == "map", res
    assert res["window_tokens"] == 60_000 and res["single_pass_chars"] == 125_000


async def test_a_big_window_reads_far_more_than_360k_in_one_call(db_session, monkeypatch):
    await _gemini_window(db_session, monkeypatch, 1_048_576)
    text = ("سطر " + "y" * 70 + "\n") * 7000  # 525k chars: the old constant forced map-reduce here
    blobs, ids = await _files(db_session, [("book.txt", "text/plain", text.encode())])
    calls = []
    _patch(monkeypatch, blobs, calls)
    res = await _ask(db_session, ids)
    assert res["ok"] and res["mode"] == "single" and res["reading"] == "single" and res["reading_note"] == ""
    assert [c[0] for c in calls] == ["final"] and text.strip() in calls[0][1]


async def test_unknown_window_falls_back_to_360k(db_session, monkeypatch):
    from app.services import app_reading as ar

    chars, window = await ar.window_chars(db_session, "lla_assistant", 6000)  # nothing configured at all
    assert (chars, window) == (ar.SINGLE_CHARS, None) and ar.SINGLE_CHARS == 360_000


# ---------------------------------------------------------------------------- 2. the user's question per FULL chunk
async def test_chunks_answer_the_users_question_and_the_reply_says_so(db_session, monkeypatch):
    from app.services import app_reading as ar

    await _gemini_window(db_session, monkeypatch, 60_000)
    text = "".join(f"--- صفحهٔ {p} ---\n" + ("متنِ صفحه " + "z" * 80 + "\n") * 30 for p in range(1, 120))
    blobs, ids = await _files(db_session, [("big.txt", "text/plain", text.encode())])
    calls = []
    _patch(monkeypatch, blobs, calls)
    question = "کدام بند دربارهٔ مهلتِ پرداخت است؟ عینِ جمله را بیاور."
    res = await _ask(db_session, ids, user=question)
    assert res["ok"] and res["reading"] == "chunked" and res["mode"] == "map"
    assert "بخش‌به‌بخش" in res["reading_note"]
    maps = [c for c in calls if c[0] == "map"]
    assert len(maps) >= 2
    for _k, prompt, system, _mt in maps:
        assert question in prompt, "the user's own question is asked of every chunk"
        assert "نقلِ قولِ عینی" in system and "جای دقیقش" in system and "یک خلاصهٔ عمومی" in system
    # every character of the file is inside some chunk, each chunk whole and labelled with its location
    joined = "".join(c[1] for c in maps)
    for line in text.splitlines()[::97]:
        assert line in joined
    assert all("نویسه‌های" in c[1] for c in maps)
    final = [c for c in calls if c[0] == "final"][0][1]
    assert "بخش‌به‌بخش" in final and "پاسخِ «" in final


# ---------------------------------------------------------------------------- 3. a cut answer is never accepted silently
async def test_a_cut_chunk_answer_is_halved_and_asked_again(db_session, monkeypatch):
    from app.services import app_reading as ar

    await _gemini_window(db_session, monkeypatch, 60_000)
    text = ("داده " + "q" * 90 + "\n") * 3000
    blobs, ids = await _files(db_session, [("big.txt", "text/plain", text.encode())])
    calls = []

    def reply(prompt, system):  # a full chunk is cut at the budget; a half fits
        return "نیمه " + ar.END if "نیمهٔ" in prompt else "پاسخِ بلندی که وسطِ جمله بری"

    _patch(monkeypatch, blobs, calls, map_reply=reply)
    res = await _ask(db_session, ids)
    halves = [c for c in calls if c[0] == "map" and "نیمهٔ" in c[1]]
    fulls = [c for c in calls if c[0] == "map" and "نیمهٔ" not in c[1]]
    assert halves and len(halves) == 2 * len(fulls)
    assert res["ok"] and res["files"][0]["complete"] is True, "halves ended properly ⇒ the read is complete"


async def test_still_cut_after_halving_is_reported_by_name(db_session, monkeypatch):
    await _gemini_window(db_session, monkeypatch, 60_000)
    text = ("داده " + "q" * 90 + "\n") * 3000
    blobs, ids = await _files(db_session, [("big.txt", "text/plain", text.encode())])
    calls = []
    _patch(monkeypatch, blobs, calls, map_reply=lambda p, s: "همیشه بریده")
    res = await _ask(db_session, ids)
    f = res["files"][0]
    assert f["complete"] is False and "بریده شد" in f["note"] and "بخشِ 1 از" in f["note"] and "نیمهٔ 1 از ۲" in f["note"]
    assert "(ناقص)" in [c for c in calls if c[0] == "final"][0][1], "the final model is told the read is incomplete"


# ---------------------------------------------------------------------------- 4. the final prompt always fits
async def test_merge_repeats_until_the_final_prompt_fits(db_session, monkeypatch):
    from app.services import app_reading as ar

    await _gemini_window(db_session, monkeypatch, 40_000)
    text = ("w" * 99 + "\n") * 15_000  # 1.5 MB
    blobs, ids = await _files(db_session, [("huge.txt", "text/plain", text.encode())])
    calls = []
    # verbose but legal chunk answers (≈ 20k chars each) — the old code sent everything in one over-limit prompt
    _patch(monkeypatch, blobs, calls, map_reply=lambda p, s: "N" * 20_000 + ar.END if s == ar._MAP_SYS else "M" * 3_000 + ar.END)
    res = await _ask(db_session, ids)
    limit = res["single_pass_chars"]
    assert res["ok"] and any(c[0] == "merge" for c in calls)
    for kind, prompt, system, _mt in calls:
        if kind == "final":
            assert len(prompt) + len(system or "") <= limit, (len(prompt), limit)


async def test_a_merge_that_does_not_shrink_fails_honestly_instead_of_overflowing(db_session, monkeypatch):
    from app.services import app_reading as ar

    await _gemini_window(db_session, monkeypatch, 40_000)
    text = ("w" * 99 + "\n") * 15_000
    blobs, ids = await _files(db_session, [("huge.txt", "text/plain", text.encode())])
    calls = []
    _patch(monkeypatch, blobs, calls, map_reply=lambda p, s: "N" * 60_000 + ar.END)
    res = await _ask(db_session, ids)
    assert res["ok"] is False and "ظرفیت" in res["error"]
    assert not [c for c in calls if c[0] == "final"], "an over-limit prompt is never sent"


# ---------------------------------------------------------------------------- 7. images inside containers
def _zip(members):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        for n, d in members:
            z.writestr(n, d)
    return buf.getvalue()


async def test_images_inside_zip_and_docx_reach_the_vision_model(db_session, monkeypatch):
    docx = _zip([("[Content_Types].xml", "<Types/>"),
                 ("word/document.xml", '<w:document xmlns:w="x"><w:body><w:p><w:r><w:t>متنِ ورد</w:t></w:r></w:p></w:body></w:document>'),
                 ("word/media/image1.png", PNG + b"docx")])  # different bytes: identical images are read once
    bundle = _zip([("a.txt", "ZIP_TXT"), ("pics/pic.png", PNG), ("old.bmp", b"BM" + b"\0" * 60), ("inner.docx", docx)])
    blobs, ids = await _files(db_session, [("bundle.zip", "application/zip", bundle),
                                           ("report.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docx)])
    calls = []
    _patch(monkeypatch, blobs, calls)
    res = await _ask(db_session, ids)
    assert res["ok"]
    mm = [c for c in calls if c[0] == "mm"]
    assert len(mm) == 1, "small images go inline with the final call, like attached images"
    sent = mm[0][2]
    assert "bundle.zip › pics/pic.png" in sent and "bundle.zip › inner.docx › word/media/image1.png" in sent
    assert "report.docx › word/media/image1.png" in sent
    z, d = res["files"]
    assert z["complete"] is False and "old.bmp" in z["note"] and "مدل‌های بینا نمی‌خوانند" in z["note"]
    assert d["complete"] is True and d["embedded_images"] == 1
    assert "inspection.py pull" not in z["note"] and "inspection.py pull" not in mm[0][1]
    assert "`pull`" not in mm[0][1], "the inspection-only hint is not shown to the page's AI"


async def test_embedded_images_beyond_the_inline_budget_are_each_described(db_session, monkeypatch):
    from app.services import app_reading as ar

    pngs = [(f"ppt/media/image{i}.png", PNG + bytes([i])) for i in range(ar.INLINE_IMAGE_COUNT + 3)]
    pptx = _zip([("[Content_Types].xml", "<Types/>"),
                 ("ppt/slides/slide1.xml", '<p:sld xmlns:a="x" xmlns:p="y"><a:p><a:r><a:t>SLIDE</a:t></a:r></a:p></p:sld>')] + pngs)
    blobs, ids = await _files(db_session, [("deck.pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation", pptx)])
    calls = []
    _patch(monkeypatch, blobs, calls)
    res = await _ask(db_session, ids)
    mm = [c for c in calls if c[0] == "mm"]
    assert res["ok"] and len(mm) == len(pngs), "every embedded image is read on its own (none dropped)"
    final = [c for c in calls if c[0] == "final"][0][1]
    assert final.count("تصویرِ داخلِ فایل") == len(pngs)
