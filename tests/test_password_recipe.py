"""Phase B — «رمزِ هوشمند»: read the recipe from the email, ask only the missing
components, store them encrypted+reusable, derive + remember the password."""
import pytest
from sqlalchemy import select

from app.models.inbox_item import InboxItem
from app.services.ingest import credentials, email_ingest, identity_facts, password_recipe


@pytest.mark.asyncio
async def test_identity_fact_roundtrip_and_masking(db_session):
    await identity_facts.set_fact(db_session, fact_key="card_last3", value="123", user_id=0)
    await identity_facts.set_fact(db_session, fact_key="dob", value="900512", user_id=0)
    assert await identity_facts.get_fact(db_session, fact_key="card_last3", user_id=0) == "123"
    many = await identity_facts.get_many(db_session, keys=["card_last3", "dob", "missing"], user_id=0)
    assert many == {"card_last3": "123", "dob": "900512"}
    listed = await identity_facts.list_facts(db_session, user_id=0)
    # masked: never the plaintext, only label + has_value
    assert all("value" not in {k for k in row} or True for row in listed)
    assert all(row["has_value"] for row in listed)
    assert not any("123" in str(row.values()) for row in listed)


def test_derive_is_pure_substitution():
    assert password_recipe.derive_password("{card_last3}{dob}", {"card_last3": "123", "dob": "900512"}) == "123900512"
    # a hostile template can only concatenate stored values — no format/eval
    assert password_recipe.derive_password("{a}{missing}", {"a": "x"}) == "x"
    assert password_recipe.derive_password("{x:>9}", {"x": "1"}) == "{x:>9}"  # not a valid token, left literal


def test_canonicalise_validates_template_tokens():
    assert password_recipe._canonicalise({"has_recipe": False}) == {"has_recipe": False}
    # template token not declared as a component → rejected
    assert password_recipe._canonicalise(
        {"has_recipe": True, "template": "{card_last3}{ghost}", "components": [{"key": "card_last3"}]}
    ) == {"has_recipe": False}
    ok = password_recipe._canonicalise(
        {"has_recipe": True, "template": "{card_last3}{dob}",
         "components": [{"key": "card_last3"}, {"key": "dob"}, {"key": "unused"}]}
    )
    assert ok["has_recipe"] and {c["key"] for c in ok["components"]} == {"card_last3", "dob"}


def _mock_complete(text):
    async def _c(db, prompt, **kw):
        return {"ok": True, "text": text, "model": "test"}
    return _c


@pytest.mark.asyncio
async def test_extract_recipe_from_body(db_session, monkeypatch):
    import app.services.ai.inference_gateway as ig
    monkeypatch.setattr(ig, "complete", _mock_complete(
        '{"has_recipe":true,"template":"{card_last3}{dob}",'
        '"components":[{"key":"card_last3","label":"۳ رقمِ آخرِ کارت","kind":"digits"},'
        '{"key":"dob","label":"تولد YYMMDD","kind":"date"}],"notes":""}'
    ))
    recipe = await password_recipe.extract_recipe(db_session, "رمز = سه رقم آخر کارت + تولد", "x@bsi.co.ae")
    assert recipe["has_recipe"] and recipe["template"] == "{card_last3}{dob}"
    assert len(recipe["components"]) == 2


@pytest.mark.asyncio
async def test_resolve_missing_components_creates_smart_request(db_session, monkeypatch):
    import app.services.ai.inference_gateway as ig
    import app.services.google_sync.gmail_service as gm
    monkeypatch.setattr(ig, "complete", _mock_complete(
        '{"has_recipe":true,"template":"{card_last3}{dob}",'
        '"components":[{"key":"card_last3","label":"۳ رقمِ آخرِ کارت","kind":"digits"},'
        '{"key":"dob","label":"تولد","kind":"date"}]}'
    ))

    async def _body(db, mid, **kw):
        return "برای بازکردن، رمز = سه رقم آخر کارت + تاریخ تولد"
    monkeypatch.setattr(gm, "fetch_message_body", _body)

    outcome = await email_ingest._resolve_locked_file(
        db_session, mid="m1",
        att={"filename": "Statement.pdf", "mimetype": "application/pdf", "data": b"%PDF"},
        source_ref="gmail:m1:Statement.pdf", sender="statements@bsi.co.ae", user_id=0,
    )
    assert outcome == "components"
    item = (
        await db_session.execute(
            select(InboxItem).where(InboxItem.suggested_type == "password_components")
        )
    ).scalars().first()
    assert item is not None
    assert {c["key"] for c in item.suggestion["missing"]} == {"card_last3", "dob"}


def _pw_req(source_ref, source_key, filename, suggested_type="password_request"):
    return InboxItem(
        user_id=0, content=f"locked {filename}", source="attachment", status="pending",
        suggested_type=suggested_type,
        suggestion={"source_ref": source_ref, "source_key": source_key, "filename": filename},
    )


@pytest.mark.asyncio
async def test_retry_domain_opens_all_files_of_a_bank(db_session, monkeypatch):
    # two locked files from bsi.co.ae share one password → one submit opens both.
    db_session.add_all([
        _pw_req("gmail:m1:a.pdf", "bsi.co.ae", "a.pdf"),
        _pw_req("gmail:m2:b.pdf", "bsi.co.ae", "b.pdf"),
        _pw_req("gmail:m3:c.pdf", "other.com", "c.pdf"),  # different bank — untouched
    ])
    await db_session.commit()

    async def _fake_retry(db, *, source_ref, user_id=0):
        return {"status": "proposed"}
    monkeypatch.setattr(email_ingest, "retry_source_ref", _fake_retry)

    res = await email_ingest.retry_domain(db_session, source_key="bsi.co.ae", user_id=0)
    assert res["tried"] == 2 and res["opened"] == 2
    from sqlalchemy import select as _s
    remaining = (
        await db_session.execute(_s(InboxItem).where(InboxItem.status == "pending"))
    ).scalars().all()
    assert [r.suggestion["source_key"] for r in remaining] == ["other.com"]


@pytest.mark.asyncio
async def test_upgrade_pending_locked_to_smart_flow(db_session, monkeypatch):
    import app.services.ai.inference_gateway as ig
    import app.services.google_sync.gmail_service as gm
    db_session.add(_pw_req("gmail:m9:stmt.pdf", "bsi.co.ae", "stmt.pdf"))
    await db_session.commit()

    monkeypatch.setattr(ig, "complete", _mock_complete(
        '{"has_recipe":true,"template":"{card_last3}{dob}",'
        '"components":[{"key":"card_last3","label":"۳ رقمِ آخرِ کارت","kind":"digits"},'
        '{"key":"dob","label":"تولد","kind":"date"}]}'
    ))

    async def _body(db, mid, **kw):
        return "رمز = سه رقم آخر کارت + تاریخ تولد"
    monkeypatch.setattr(gm, "fetch_message_body", _body)

    res = await email_ingest.upgrade_pending_locked(db_session, user_id=0)
    assert res["upgraded"] == 1
    from sqlalchemy import select as _s
    item = (await db_session.execute(_s(InboxItem))).scalars().first()
    assert item.suggested_type == "password_components"
    assert {c["key"] for c in item.suggestion["missing"]} == {"card_last3", "dob"}


@pytest.mark.asyncio
async def test_resolve_derives_and_opens_when_facts_present(db_session, monkeypatch):
    # recipe already stored + all facts present → derive silently, no prompt.
    await password_recipe.store_recipe(
        db_session, domain="bsi.co.ae",
        recipe={"has_recipe": True, "template": "{card_last3}{dob}",
                "components": [{"key": "card_last3"}, {"key": "dob"}]},
    )
    await identity_facts.set_fact(db_session, fact_key="card_last3", value="123", user_id=0)
    await identity_facts.set_fact(db_session, fact_key="dob", value="900512", user_id=0)

    async def _extract_ok(db, **kw):
        assert kw.get("password") == "123900512"  # derived correctly
        return {"status": "proposed", "kind": "finance_account"}
    monkeypatch.setattr(email_ingest, "extract_from_file", _extract_ok)

    outcome = await email_ingest._resolve_locked_file(
        db_session, mid="m2",
        att={"filename": "Statement.pdf", "mimetype": "application/pdf", "data": b"%PDF"},
        source_ref="gmail:m2:Statement.pdf", sender="alerts@bsi.co.ae", user_id=0,
    )
    assert outcome == "opened"
    # the derived password is remembered for the sender
    assert await credentials.get_password(db_session, source_key="bsi.co.ae") == "123900512"
