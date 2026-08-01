"""«داده‌هایی که هنوز وصل نیستند» — سیاههٔ انبارهای مردهٔ پروفایل (۲۰۲۶-۰۸-۰۱).

قیدهایی که اینجا میخ می‌شوند (همان چیزهایی که در نسخهٔ قبلِ «من که هستم» شکست):

* هر ادعا یک **جمله** است، نه یک عدد و نه مقدارِ خامِ ستون.
* لحن صادق است: محتوایی که هیچ صفحه‌ای نشانش نمی‌دهد ``watch`` است، خالی‌بودن
  ``neutral``. هیچ خبرِ بدی زیرِ عنوانِ خوب نمی‌نشیند.
* روی پایگاه‌دادهٔ خالی هیچ کارتی ساخته نمی‌شود؛ دربارهٔ سطری که وجود ندارد
  نمی‌شود گفت «خالی است».
* مسیرِ موفق واقعاً اجرا می‌شود، تا غلطِ املاییِ نامِ ستون (همان بلایی که سرِ
  ``TodoItem.title`` آمد، حال آنکه ستون ``content`` است) نتواند پشتِ یک
  ``except`` پنهان بماند.
"""
import pytest
import pytest_asyncio

from app.services.owner_insight.providers import unlinked as U


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


async def _mk_user(db, **kw):
    from app.models.user import User

    user = User(
        email=kw.pop("email", "owner@example.com"),
        username=kw.pop("username", "owner"),
        hashed_password="x",
        **kw,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


def _by_key(facets, key):
    for f in facets or []:
        if f.key == key:
            return f
    return None


# ── پایگاه‌دادهٔ خالی: هیچ ادعایی ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_empty_database_produces_nothing(db):
    """هیچ ردی از مالک نیست ← «نمی‌دانم»، نه کارتِ توخالی."""
    assert await U._collect(db, 0) is None
    assert await U._collect(db, 1) is None


@pytest.mark.asyncio
async def test_user_that_does_not_exist_produces_nothing(db):
    """سطرِ کاربرِ دیگری هست ولی مالِ این uid نیست ← باز هم هیچ."""
    await _mk_user(db, bio="یک متن")
    assert await U._collect(db, 999) is None


# ── محتوا هست و هیچ‌جا دیده نمی‌شود ← watch ─────────────────────────────────

@pytest.mark.asyncio
async def test_filled_stores_are_reported_as_sentences_with_watch_tone(db):
    user = await _mk_user(
        db,
        bio="برنامه‌نویسم، ساکن دبی، و بیشتر وقتم صرف ساختن ابزارهای شخصی می‌شود.",
        display_name="محمدمهدی",
        interests={"verified": ["برنامه‌نویسی", "کتاب", "سفر"]},
        personality_traits={"openness": 0.72, "conscientiousness": 0.41},
        mood_patterns={"evening": "خسته"},
    )

    facets = await U._collect(db, user.id)
    assert facets, "مسیرِ موفق باید واقعاً اجرا شود"

    bio = _by_key(facets, "unlinked_users_bio")
    assert bio is not None
    # ۱) جمله است، نه مقدارِ خام.
    assert bio.statement.startswith("یک متنِ معرفی از خودت در پایگاه‌داده ذخیره شده")
    assert "روی هیچ صفحه‌ای" in bio.statement
    assert bio.statement.endswith(".")
    # ۲) محتوای واقعی نشان داده می‌شود، ساخته نمی‌شود.
    assert "برنامه‌نویسم، ساکن دبی" in bio.statement
    # ۳) لحن صادق + قرارداد facet.
    assert bio.tone == "watch"
    assert bio.group == "unlinked"
    assert bio.kind == "fact"
    assert bio.owns_page == "/system-map"
    assert bio.evidence and all(len(e) > 10 and "{" not in e for e in bio.evidence)

    name = _by_key(facets, "unlinked_users_display_name")
    assert name is not None and name.tone == "watch"
    assert "«محمدمهدی»" in name.statement

    interests = _by_key(facets, "unlinked_users_interests")
    assert interests is not None and interests.tone == "watch"
    assert "برنامه‌نویسی" in interests.statement

    traits = _by_key(facets, "unlinked_users_personality_traits")
    assert traits is not None and traits.tone == "watch"
    # عدد داخلِ جمله می‌نشیند و با رقمِ فارسی — نه به‌عنوانِ کلِ ادعا.
    assert "openness: ۰٫۷۲" in traits.statement
    assert "personality_assessments" in traits.statement

    mood = _by_key(facets, "unlinked_users_mood_patterns")
    assert mood is not None and mood.tone == "watch"

    # هیچ‌کدام از این کارت‌ها نباید «خوب» علامت بخورد.
    assert not any(f.tone == "good" for f in facets)


@pytest.mark.asyncio
async def test_long_bio_is_truncated_not_dumped(db):
    user = await _mk_user(db, bio="الف " * 200)
    facets = await U._collect(db, user.id)
    bio = _by_key(facets, "unlinked_users_bio")
    assert bio is not None
    assert "…»" in bio.statement
    assert len(bio.statement) < 400


# ── خالی است ← خبرِ بد نیست، ولی گفته می‌شود ────────────────────────────────

@pytest.mark.asyncio
async def test_all_stores_empty_reports_emptiness_with_neutral_tone(db):
    user = await _mk_user(db)

    facets = await U._collect(db, user.id)
    assert facets is not None

    empty = _by_key(facets, "unlinked_empty_stores")
    assert empty is not None
    assert empty.tone == "neutral"
    assert empty.group == "unlinked"
    assert empty.owns_page == "/system-map"
    for column in (
        "users.bio",
        "users.display_name",
        "users.interests",
        "users.personality_traits",
        "users.mood_patterns",
        "ai_assessments",
        "personality_assessments",
    ):
        assert column in empty.statement
    # خالی‌بودن هشدار نیست.
    assert all(f.tone == "neutral" for f in facets)


@pytest.mark.asyncio
async def test_structurally_present_but_semantically_empty_json_counts_as_empty(db):
    """``{"verified": []}`` همان چیزی است که سرویسِ علاقه‌ها وقتی چیزی پیدا
    نمی‌کند می‌نویسد — نباید به‌عنوان «محتوا» گزارش شود."""
    user = await _mk_user(db, interests={"verified": []}, personality_traits={}, mood_patterns=[])

    facets = await U._collect(db, user.id)
    assert _by_key(facets, "unlinked_users_interests") is None
    empty = _by_key(facets, "unlinked_empty_stores")
    assert empty is not None and "users.interests" in empty.statement


# ── ارزیابی‌ها ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_assessments_without_a_page_are_reported(db):
    from app.models.ai_assessment import AIAssessment

    user = await _mk_user(db)
    db.add_all(
        [
            AIAssessment(user_id=user.id, assessment_type="holistic_profile", openness=0.6),
            AIAssessment(user_id=user.id, assessment_type="sentiment", sentiment="positive"),
            AIAssessment(user_id=user.id, assessment_type="sentiment", sentiment="neutral"),
            # این یکی صفحه دارد (خودنگاره) — نباید در شمارش بیاید.
            AIAssessment(user_id=user.id, assessment_type="self_model", score=40.0),
        ]
    )
    await db.commit()

    facets = await U._collect(db, user.id)
    card = _by_key(facets, "unlinked_ai_assessments")
    assert card is not None
    assert card.tone == "watch"
    assert card.statement.startswith("۳ ارزیابیِ ذخیره‌شده دربارهٔ تو")
    assert "sentiment (۲ سطر)" in card.statement
    assert "holistic_profile (۱ سطر)" in card.statement
    assert "self_model" not in card.statement
    assert any("خودنگاره" in e for e in card.evidence)

    # چون سطر هست (هرچند بعضی صفحه‌دار)، نباید «ai_assessments خالی است» بگوید.
    empty = _by_key(facets, "unlinked_empty_stores")
    assert empty is not None and "ai_assessments" not in empty.statement


@pytest.mark.asyncio
async def test_only_surfaced_assessments_produce_no_unlinked_card(db):
    from app.models.ai_assessment import AIAssessment

    user = await _mk_user(db)
    db.add(AIAssessment(user_id=user.id, assessment_type="sahat_map", score=1.0))
    await db.commit()

    facets = await U._collect(db, user.id)
    assert _by_key(facets, "unlinked_ai_assessments") is None


@pytest.mark.asyncio
async def test_person_scoped_assessments_are_not_counted_as_the_owners(db):
    from app.models.ai_assessment import AIAssessment

    user = await _mk_user(db)
    db.add(AIAssessment(user_id=user.id, person_id=7, assessment_type="relationship", score=3.0))
    await db.commit()

    facets = await U._collect(db, user.id)
    assert _by_key(facets, "unlinked_ai_assessments") is None
    empty = _by_key(facets, "unlinked_empty_stores")
    assert empty is not None and "ai_assessments" in empty.statement


@pytest.mark.asyncio
async def test_personality_assessments_are_reported_as_connected_not_as_an_island(db):
    from app.models.personality import PersonalityAssessment

    user = await _mk_user(db)
    db.add(
        PersonalityAssessment(
            user_id=user.id,
            summary="برجسته‌ترین ویژگی‌های شخصیتی شما: گشودگی، وظیفه‌شناسی.",
            traits={"openness": 0.8},
        )
    )
    await db.commit()

    facets = await U._collect(db, user.id)
    card = _by_key(facets, "unlinked_personality_assessments")
    assert card is not None
    # وصل است ← هشدار نیست.
    assert card.tone == "neutral"
    assert "جزیره نیست" in card.statement
    assert "«شخصیت»" in card.statement
    assert any("گشودگی" in e for e in card.evidence)

    empty = _by_key(facets, "unlinked_empty_stores")
    assert empty is not None and "personality_assessments" not in empty.statement


# ── حالتِ تک‌کاربرهٔ برنامه (uid=۰) ──────────────────────────────────────────

@pytest.mark.asyncio
async def test_anonymous_scope_resolves_the_single_owner_row(db):
    await _mk_user(db, bio="یادداشتِ کوتاهی دربارهٔ خودم.")
    facets = await U._collect(db, 0)
    bio = _by_key(facets, "unlinked_users_bio")
    assert bio is not None and "یادداشتِ کوتاهی دربارهٔ خودم." in bio.statement


@pytest.mark.asyncio
async def test_anonymous_scope_does_not_guess_between_two_users(db):
    await _mk_user(db, bio="متنِ نفرِ اول", email="a@example.com", username="a")
    await _mk_user(db, bio="متنِ نفرِ دوم", email="b@example.com", username="b")
    facets = await U._collect(db, 0)
    # هیچ‌کدام نباید به دیگری نسبت داده شود.
    assert _by_key(facets, "unlinked_users_bio") is None


# ── ثبت در رجیستری ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_provider_is_registered_with_a_real_page():
    import app.services.owner_insight as oi

    # عمداً از رجیستری خوانده می‌شود و نه از ``oi.providers()``: به‌محضِ اینکه
    # زیرپکیجِ ``providers`` جایی import شود، پایتون همان نام را روی پکیجِ والد
    # می‌نشاند و تابعِ هم‌نام را می‌پوشانَد. این یک مشکلِ فایلِ مشترک است و در
    # یادداشتِ تحویل گزارش شده؛ اینجا دست نمی‌خورد.
    provider = oi._REGISTRY.get("unlinked")
    assert provider is not None
    assert provider.owns_page == "/system-map"   # در routesMeta.js موجود است
    assert provider.group_order == 90
