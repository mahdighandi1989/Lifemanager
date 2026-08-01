"""منبعِ «مدارکِ هویتی» در «من که هستم» (۲۰۲۶-۰۸-۰۱).

قیدهایی که اینجا میخ می‌شوند — هر کدام یک خرابیِ واقعیِ نسخهٔ قبل:
  * ادعا باید **جمله** باشد و بگوید این «نوشتهٔ روی سند» است، نه اینکه املای
    لاتینِ گذرنامه را بی‌توضیح به‌عنوان نامِ او قالب کند.
  * ``issue_place`` (جایی که مدرک صادر شده) هرگز نباید به‌عنوان محلِ زندگی —
    یا هر ادعای دیگری — بیرون بیاید.
  * ``profession``/``sponsor`` باید صراحتاً «عنوان و کفیلِ ویزا» معرفی شوند.
  * دیتابیسِ خالی یعنی **هیچ ادعایی**، نه جملهٔ توخالی.
  * مسیرِ خوشحال واقعاً باید اجرا شود؛ غلطِ املاییِ نامِ ستون (همان باگِ
    ``TodoItem.title`` که ستونش ``content`` بود) نباید بی‌صدا بماند.
"""
import datetime as dt

import pytest
import pytest_asyncio

from app.models.identity_document import IdentityDocument
from app.models.uae_license import UAEDrivingLicenseRecord
from app.services.owner_insight import collect
from app.services.owner_insight.providers import documents as prov


@pytest_asyncio.fixture
async def db():
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from app.database import Base

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session
    await engine.dispose()


def _age_on(born: dt.date) -> int:
    """همان فرمولِ سن، مستقل از ماژول — تا ادعای عدد راستی‌آزمایی شود."""
    today = dt.datetime.now(dt.timezone.utc).date()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


def _fa(value) -> str:
    return str(value).translate(str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹"))


async def _seed_licence(db, uid=None, **over):
    row = UAEDrivingLicenseRecord(
        user_id=uid,
        license_no="1234567",
        name_en="MOHAMMAD MEHDI MAHMOUD GHANDI",
        name_ar="محمد مهدي محمود قندي",
        nationality="IRAN",
        date_of_birth=dt.date(1989, 3, 8),
        issue_date=dt.date(2021, 5, 2),
        expiry_date=dt.date(2031, 5, 1),
        place_of_issue="DUBAI",
    )
    for key, value in over.items():
        setattr(row, key, value)
    db.add(row)
    await db.commit()
    return row


async def _seed_document(db, uid=None, **over):
    row = IdentityDocument(
        user_id=uid,
        emirates_id_number="784198991846589",
        file_number="201/2008/2626430",
        passport_number="I96955239",
        full_name="MOHAMMADMEHDI MAHMOUD GHANDI",
        profession="OFFICE CLERK",
        sponsor="BANK SADERAT IRAN (MAIN BRANCH)",
        issue_date="15 Aug 2025",
        expiry_date="14 Aug 2027",
        issue_place="DUBAI",
        date_of_birth="08 Mar 1989",
        sex="M",
        nationality="IRAN",
    )
    for key, value in over.items():
        setattr(row, key, value)
    db.add(row)
    await db.commit()
    return row


def _by_key(facets):
    return {f.key: f for f in facets}


# ── مسیرِ خوشحال: گواهینامه + کارتِ هویت ────────────────────────────────────

@pytest.mark.asyncio
async def test_licence_and_id_card_produce_four_sentences(db):
    await _seed_licence(db)
    await _seed_document(db)

    facets = await prov._collect(db, 0)
    assert facets is not None
    got = _by_key(facets)
    assert set(got) == {"doc_full_name", "doc_date_of_birth", "doc_nationality", "doc_visa_job"}

    name = got["doc_full_name"]
    assert name.statement == (
        "نامت روی گواهینامهٔ رانندگیِ امارات این‌طور نوشته شده: "
        "«MOHAMMAD MEHDI MAHMOUD GHANDI» — این املای خودِ سند است، نه لزوماً "
        "شکلی که خودت اسمت را می‌نویسی."
    )
    assert name.tone == "neutral"
    assert name.kind == "fact"
    assert name.group == "facts"
    assert name.owns_page == "/life-file"
    # املاهای دیگر به‌عنوان شاهد، نه به‌عنوان ادعای دوم.
    assert "املای دیگری که در مدارکت ثبت شده: «محمد مهدي محمود قندي»." in name.evidence
    assert (
        "املای دیگری که در مدارکت ثبت شده: «MOHAMMADMEHDI MAHMOUD GHANDI»."
        in name.evidence
    )

    dob = got["doc_date_of_birth"]
    age = _age_on(dt.date(1989, 3, 8))
    assert dob.statement == (
        f"طبقِ گواهینامهٔ رانندگیِ امارات، تاریخِ تولدت ۸ مارس ۱۹۸۹ است — "
        f"الان {_fa(age)} سالت است."
    )
    assert dob.tone == "neutral"

    nat = got["doc_nationality"]
    assert nat.statement == "در مدارکِ رسمی‌ات ملیتت ایران ثبت شده است."
    assert nat.evidence == ["روی گواهینامهٔ رانندگیِ امارات نوشته شده: IRAN."]

    visa = got["doc_visa_job"]
    assert visa.statement == (
        "روی ویزای اقامتت عنوانِ شغلی «OFFICE CLERK» و کفیل "
        "«BANK SADERAT IRAN (MAIN BRANCH)» ثبت شده — این عنوان و کفیلِ حقوقیِ "
        "ویزاست، نه شرحِ کاری که واقعاً هر روز انجام می‌دهی."
    )
    assert visa.tone == "neutral"

    # همهٔ ادعاها جمله‌اند و به صفحهٔ صاحبِ داده وصل‌اند.
    for facet in facets:
        assert facet.owns_page == "/life-file"
        assert facet.source_label
        assert facet.evidence
        assert len(facet.statement) > 25 and facet.statement.endswith((".", "‌"))


@pytest.mark.asyncio
async def test_issue_place_is_never_sold_as_where_he_lives(db):
    """خرابیِ اصلیِ نسخهٔ قبل: امارتِ صدورِ مدرک = «محلِ زندگی»."""
    await _seed_licence(db)
    await _seed_document(db)

    facets = await prov._collect(db, 0)
    blob = " ".join(f.statement + " " + " ".join(f.evidence) for f in facets)
    assert "DUBAI" not in blob            # نه امارتِ صدورِ گواهینامه، نه کارت
    assert "محلِ زندگی" not in blob
    assert not any("residence" in f.key or "محل" in f.title for f in facets)


# ── دیتابیسِ خالی: «نمی‌دانم» جوابِ درست است ─────────────────────────────────

@pytest.mark.asyncio
async def test_empty_database_produces_no_facet_at_all(db):
    assert await prov._collect(db, 0) is None


@pytest.mark.asyncio
async def test_a_licence_with_only_a_number_still_produces_nothing(db):
    await _seed_licence(
        db, name_en=None, name_ar=None, nationality=None, date_of_birth=None
    )
    assert await prov._collect(db, 0) is None


@pytest.mark.asyncio
async def test_another_users_documents_are_not_his(db):
    await _seed_licence(db, uid=99)
    await _seed_document(db, uid=99)
    assert await prov._collect(db, 7) is None


# ── شاخه‌ها: گواهینامه غایب، ویزا ناقص، تاریخِ ناخوانا ──────────────────────

@pytest.mark.asyncio
async def test_id_card_alone_says_it_is_the_id_card(db):
    await _seed_document(db)

    got = _by_key(await prov._collect(db, 0))
    assert got["doc_full_name"].statement == (
        "نامت روی کارتِ هویتِ امارات این‌طور نوشته شده: "
        "«MOHAMMADMEHDI MAHMOUD GHANDI» — این املای خودِ سند است، نه لزوماً "
        "شکلی که خودت اسمت را می‌نویسی."
    )
    assert got["doc_full_name"].source_label == "کارتِ هویتِ امارات"
    # «08 Mar 1989»ی که رشته ذخیره شده باید خوانده و به سن تبدیل شود.
    age = _age_on(dt.date(1989, 3, 8))
    assert got["doc_date_of_birth"].statement == (
        f"طبقِ کارتِ هویتِ امارات، تاریخِ تولدت ۸ مارس ۱۹۸۹ است — "
        f"الان {_fa(age)} سالت است."
    )


@pytest.mark.asyncio
async def test_arabic_spelling_is_labelled_as_such(db):
    await _seed_licence(db, name_en=None)
    got = _by_key(await prov._collect(db, 0))
    assert got["doc_full_name"].statement == (
        "نامت روی گواهینامهٔ رانندگیِ امارات (املای عربی) این‌طور نوشته شده: "
        "«محمد مهدي محمود قندي» — این املای خودِ سند است، نه لزوماً "
        "شکلی که خودت اسمت را می‌نویسی."
    )


@pytest.mark.asyncio
async def test_sponsor_without_profession_talks_only_about_the_visa(db):
    await _seed_document(db, profession=None)
    got = _by_key(await prov._collect(db, 0))
    assert got["doc_visa_job"].statement == (
        "کفیلِ ویزای اقامتت «BANK SADERAT IRAN (MAIN BRANCH)» ثبت شده — یعنی "
        "اقامتت حقوقاً به این کارفرما وصل است؛ این ادعایی دربارهٔ کارِ واقعی‌ات "
        "نیست."
    )


@pytest.mark.asyncio
async def test_profession_without_sponsor_is_still_labelled_a_visa_title(db):
    await _seed_document(db, sponsor=None)
    got = _by_key(await prov._collect(db, 0))
    assert got["doc_visa_job"].statement == (
        "روی ویزای اقامتت عنوانِ شغلی «OFFICE CLERK» ثبت شده — این عنوانِ "
        "حقوقیِ ویزاست، نه شرحِ کاری که واقعاً هر روز انجام می‌دهی."
    )


@pytest.mark.asyncio
async def test_no_visa_fields_means_no_visa_facet(db):
    await _seed_document(db, profession=None, sponsor=None)
    got = _by_key(await prov._collect(db, 0))
    assert "doc_visa_job" not in got
    assert "doc_full_name" in got


@pytest.mark.asyncio
async def test_unreadable_birth_date_is_reported_without_inventing_an_age(db):
    await _seed_document(db, date_of_birth="حدودِ ۶۸")
    got = _by_key(await prov._collect(db, 0))
    assert got["doc_date_of_birth"].statement == (
        "طبقِ کارتِ هویتِ امارات، تاریخِ تولدت «حدودِ ۶۸» ثبت شده است."
    )
    assert "سالت" not in got["doc_date_of_birth"].statement


@pytest.mark.asyncio
async def test_unknown_nationality_is_quoted_verbatim_not_guessed(db):
    await _seed_licence(db, nationality="ATLANTIS")
    got = _by_key(await prov._collect(db, 0))
    assert got["doc_nationality"].statement == (
        "در مدارکِ رسمی‌ات ملیتت «ATLANTIS» ثبت شده است."
    )


# ── واقعاً از رجیستری رد می‌شود؟ ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_registered_and_reachable_through_collect(db):
    """اگر نامِ ستونی غلط بود، اینجا باید صدا کند — نه اینکه ساکت غیب شود."""
    await _seed_licence(db, uid=7)
    await _seed_document(db, uid=7)

    payload = await collect(db, 7, only="documents")
    assert payload["unavailable"] == []
    assert payload["sources"] == [
        {"key": "documents", "label": "مدارکِ هویتی", "owns_page": "/life-file", "ok": True}
    ]
    assert len(payload["facets"]) == 4
    assert payload["groups"][0]["group"] == "facts"
    assert payload["groups"][0]["label"] == "واقعیت‌های هویتی"
    keys = {f["key"] for f in payload["facets"]}
    assert keys == {"doc_full_name", "doc_date_of_birth", "doc_nationality", "doc_visa_job"}


@pytest.mark.asyncio
async def test_collect_reports_the_source_as_absent_on_an_empty_database(db):
    payload = await collect(db, 0, only="documents")
    assert payload["facets"] == []
    assert payload["unavailable"] == ["documents"]
