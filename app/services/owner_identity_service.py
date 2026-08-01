"""ساختنِ «من» از تمامِ داده‌های برنامه — و پرسیدنِ آنچه نمی‌داند.

خواستهٔ مالک: نام، سن، تاریخ تولد، محلِ تولد، محلِ زندگی، محلِ کار و شغل،
ویژگی‌های شخصیتی، نقاط قوت و ضعف — همه خودکار استخراج شوند، در پروفایل
قابلِ ویرایش باشند، ابهام‌ها در تلگرام پرسیده شوند، و همه‌چیز به همه‌چیز
وصل باشد.

معماری — عمداً روی چیزهای موجود سوار است، نه کنارشان:

* **استخراج‌کننده‌ها یک رجیستری‌اند** (`_EXTRACTORS`): هر فیلد یک تابع که
  `(value, source, confidence, evidence)` برمی‌گرداند یا `None`. فیلدِ تازه =
  یک تابع + یک خط. همان الگویی که مسیریابِ سیگنال و فایل‌کننده‌های صندوق دارند.
* **حرفِ مالک قفل است**: فیلدی که خودش ویرایش کرده (`owner_locked`) هرگز
  بازنویسی نمی‌شود — مثل `owner_balance_at` در مالی.
* **منبع و شواهد** با هر مقدار ذخیره می‌شوند، تا «این را از کجا آوردی؟»
  جوابِ واقعی داشته باشد.
* **آنچه نمی‌داند را می‌پرسد** — از همان حلقهٔ `clarification_service`، با
  `source_ref` یکتا به‌ازای هر فیلد تا هرگز دو بار پرسیده نشود.
* برای «قوت/ضعف/علاقه» چرخ دوباره اختراع نمی‌شود: `self_model_service` و
  لیست‌های خودِ مالک («عادت‌های بد»، «دزدان انرژی و زمان») منبع‌اند.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import date, datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Tuple

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# فیلدها + برچسبِ فارسی + اینکه اگر خالی ماند بپرسیم یا نه.
FIELDS: List[Tuple[str, str, bool]] = [
    ("full_name", "نام کامل", True),
    ("given_name", "نام", False),
    ("family_name", "نام خانوادگی", False),
    ("date_of_birth", "تاریخ تولد", True),
    ("age", "سن", False),                 # مشتق است، پرسیده نمی‌شود
    ("birthplace", "محل تولد", True),
    ("nationality", "ملیت", False),
    ("residence", "محل زندگی", True),
    ("workplace", "محل کار", True),
    ("occupation", "شغل / چه کار می‌کنم", True),
    ("personality", "ویژگی‌های شخصیتی", False),
    ("strengths", "نقاط قوت", False),
    ("weaknesses", "نقاط ضعف", False),
    ("interests", "علاقه‌مندی‌ها", False),
]
LABELS = {key: label for key, label, _ in FIELDS}
ASKABLE = {key for key, _, ask in FIELDS if ask}


def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


# ── استخراج‌کننده‌ها ─────────────────────────────────────────────────────────

async def _docs(db: AsyncSession, uid: int) -> List[Any]:
    from app.models.identity_document import IdentityDocument

    return (
        await db.execute(
            select(IdentityDocument)
            .where(_scope(IdentityDocument.user_id, uid))
            .order_by(IdentityDocument.id.desc())
        )
    ).scalars().all()


async def _licences(db: AsyncSession, uid: int) -> List[Any]:
    try:
        from app.models.uae_license import UAEDrivingLicenseRecord

        return (
            await db.execute(
                select(UAEDrivingLicenseRecord)
                .where(_scope(UAEDrivingLicenseRecord.user_id, uid))
                .order_by(UAEDrivingLicenseRecord.id.desc())
            )
        ).scalars().all()
    except Exception:
        return []


def _hit(value, source, confidence, evidence=None):
    text = str(value or "").strip()
    if not text:
        return None
    return {"value": text, "source": source, "confidence": confidence,
            "sources": [evidence] if evidence else []}


async def _x_full_name(db, uid):
    """نام: گواهینامه (دوزبانه) > کارتِ هویت > حسابِ بانکی.

    املاها ناهماهنگ‌اند («MOHAMMAD MEHDI…» / «Mohammadmehdi»)، پس ترتیبِ
    اعتماد صریح است و بقیه به‌عنوان شاهد نگه داشته می‌شوند."""
    evidence = []
    best = None
    for lic in await _licences(db, uid):
        name = getattr(lic, "name_en", None) or getattr(lic, "name_ar", None)
        if name:
            evidence.append({"where": "uae_driving_licenses", "id": lic.id, "raw": name})
            best = best or _hit(name, "driving_licence", 0.95)
    for doc in await _docs(db, uid):
        if doc.full_name:
            evidence.append({"where": "identity_documents", "id": doc.id, "raw": doc.full_name})
            best = best or _hit(doc.full_name, "identity_document", 0.9)
    if best:
        best["sources"] = evidence[:6]
    return best


def _split_name(full: str) -> Tuple[str, str]:
    parts = [p for p in re.split(r"\s+", (full or "").strip()) if p]
    if len(parts) < 2:
        return (parts[0] if parts else ""), ""
    return " ".join(parts[:-1]), parts[-1]


async def _x_given_name(db, uid):
    full = await _x_full_name(db, uid)
    if not full:
        return None
    given, _ = _split_name(full["value"])
    return _hit(given, full["source"], (full["confidence"] or 0.8) - 0.05)


async def _x_family_name(db, uid):
    full = await _x_full_name(db, uid)
    if not full:
        return None
    _, family = _split_name(full["value"])
    return _hit(family, full["source"], (full["confidence"] or 0.8) - 0.05)


_DATE_FORMATS = ("%d %b %Y", "%d %B %Y", "%Y-%m-%d", "%d/%m/%Y", "%b %d, %Y")


def parse_loose_date(value: Any) -> Optional[date]:
    """تاریخِ «همان‌طور که روی کارت نوشته» را می‌خواند («08 Mar 1989»)."""
    if isinstance(value, date):
        return value
    text = str(value or "").strip()
    if not text:
        return None
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(text).date()
    except ValueError:
        return None


async def _x_date_of_birth(db, uid):
    for lic in await _licences(db, uid):
        dob = getattr(lic, "date_of_birth", None)
        if dob:
            return _hit(parse_loose_date(dob) or dob, "driving_licence", 0.97,
                        {"where": "uae_driving_licenses", "id": lic.id, "raw": str(dob)})
    for doc in await _docs(db, uid):
        if getattr(doc, "date_of_birth", None):
            parsed = parse_loose_date(doc.date_of_birth)
            return _hit(parsed or doc.date_of_birth, "identity_document", 0.93,
                        {"where": "identity_documents", "id": doc.id, "raw": doc.date_of_birth})
    # مالک ممکن است خودش در «واقعیت‌های هویتی» وارد کرده باشد (رمزنگاری‌شده،
    # فقط سمتِ سرور خوانده می‌شود — هرگز به کلاینت نمی‌رود).
    try:
        from app.services.ingest import identity_facts

        raw = await identity_facts.get_fact(db, fact_key="dob", user_id=uid)
        if raw:
            return _hit(parse_loose_date(raw) or raw, "owner_fact", 0.99,
                        {"where": "identity_facts", "id": None, "raw": "(رمزنگاری‌شده)"})
    except Exception:
        pass
    return None


async def _x_age(db, uid):
    # سن از **همان مقداری** حساب می‌شود که در پروفایل نشسته، نه از استخراجِ
    # دوبارهٔ سند. اگر مالک تاریخِ تولد را اصلاح و قفل کرده باشد، خواندنِ
    # دوبارهٔ سند سنِ متناقض می‌ساخت: تاریخِ تولدِ اصلاح‌شده کنارِ سنِ قدیمی.
    # (ممیزیِ ۲۰۲۶-۰۸-۰۱)
    stored = await _row(db, uid, "date_of_birth")
    dob = ({"value": stored.value, "confidence": 1.0} if stored is not None
           and stored.owner_locked and stored.value else await _x_date_of_birth(db, uid))
    if not dob or not dob.get("value"):
        return None
    parsed = parse_loose_date(dob["value"])
    if not parsed:
        return None
    today = datetime.now(timezone.utc).date()
    years = today.year - parsed.year - ((today.month, today.day) < (parsed.month, parsed.day))
    if not (0 < years < 130):
        return None
    return _hit(years, "derived", dob.get("confidence") or 0.9,
                {"where": "date_of_birth", "id": None, "raw": str(parsed)})


async def _x_nationality(db, uid):
    for lic in await _licences(db, uid):
        if getattr(lic, "nationality", None):
            return _hit(lic.nationality, "driving_licence", 0.95,
                        {"where": "uae_driving_licenses", "id": lic.id, "raw": lic.nationality})
    for doc in await _docs(db, uid):
        if getattr(doc, "nationality", None):
            return _hit(doc.nationality, "identity_document", 0.9,
                        {"where": "identity_documents", "id": doc.id, "raw": doc.nationality})
    return None


async def _x_workplace(db, uid):
    """کفیلِ ویزا قوی‌ترین نشانهٔ کارفرماست («BANK SADERAT IRAN»)."""
    for doc in await _docs(db, uid):
        if doc.sponsor:
            return _hit(doc.sponsor, "visa_sponsor", 0.7,
                        {"where": "identity_documents", "id": doc.id, "raw": doc.sponsor})
    return None


async def _x_occupation(db, uid):
    for doc in await _docs(db, uid):
        if doc.profession:
            return _hit(doc.profession, "identity_document", 0.75,
                        {"where": "identity_documents", "id": doc.id, "raw": doc.profession})
    return None


async def _x_residence(db, uid):
    """محلِ زندگی — از «مکان‌های کشف‌شده» اگر باشد، وگرنه امارتِ صدورِ مدرک."""
    try:
        from app.services import place_service

        home = await place_service.get_named_place(db, uid, kind="home")
        if home:
            return _hit(home.get("label") or home.get("address"), "location_pattern", 0.85,
                        {"where": "places", "id": home.get("id"), "raw": home.get("address") or ""})
    except Exception:
        pass
    for doc in await _docs(db, uid):
        if doc.issue_place:
            return _hit(doc.issue_place, "identity_document", 0.5,
                        {"where": "identity_documents", "id": doc.id, "raw": doc.issue_place})
    return None


async def _x_strengths(db, uid):
    """قوت‌ها از شاخصِ پشتکار + علایقِ خودمدلی — نه حدسِ تازه."""
    try:
        from app.services import self_model_service as sm

        diligence = await sm.compute_diligence(db, uid)
        score = diligence.get("score")
        if score is None:
            return None
        bits = [f"شاخص پشتکار {score}/۱۰۰"]
        if diligence.get("trend"):
            bits.append(f"روند: {diligence['trend']}")
        return _hit("، ".join(bits), "self_model", 0.6,
                    {"where": "self_model.diligence", "id": None, "raw": json.dumps(diligence, ensure_ascii=False)[:400]})
    except Exception:
        return None


_WEAKNESS_LISTS = ("عادت‌های بد", "دزدان انرژی", "دزدان زمان", "مبارزه با هوای نفس", "ترس")


async def _x_weaknesses(db, uid):
    """ضعف‌ها را خودِ مالک قبلاً نوشته — در لیست‌های «عادت‌های بد»، «دزدان
    انرژی و زمان»، «مبارزه با هوای نفس». حدس نمی‌زنیم، نقل می‌کنیم."""
    try:
        from app.models.todo_item import TodoItem
        from app.models.todo_list import TodoList, todo_list_items

        lists = (
            await db.execute(select(TodoList).where(_scope(TodoList.user_id, uid)))
        ).scalars().all()
        wanted = [x for x in lists if any(k in (x.name or "") for k in _WEAKNESS_LISTS)]
        if not wanted:
            return None
        items = (
            await db.execute(
                select(TodoItem.title)
                .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
                .where(todo_list_items.c.todo_list_id.in_([x.id for x in wanted]))
                .limit(12)
            )
        ).all()
        titles = [t for (t,) in items if t]
        if not titles:
            return None
        return _hit("، ".join(titles[:8]), "own_lists", 0.8,
                    {"where": "todo_lists", "id": wanted[0].id,
                     "raw": "، ".join(x.name for x in wanted[:4])})
    except Exception:
        return None


async def _x_interests(db, uid):
    try:
        from app.services import self_model_service as sm

        res = await sm.compute_interests(db, uid)
        names = [i.get("name") or i.get("topic") for i in (res.get("interests") or [])]
        names = [n for n in names if n][:8]
        if not names:
            return None
        return _hit("، ".join(names), "self_model", 0.65,
                    {"where": "self_model.interests", "id": None, "raw": ""})
    except Exception:
        return None


async def _x_personality(db, uid):
    """شخصیت از آخرین ارزیابیِ موجود — بازمحاسبه نمی‌کنیم."""
    try:
        from app.models.ai_assessment import AIAssessment

        row = (
            await db.execute(
                select(AIAssessment)
                .where(_scope(AIAssessment.user_id, uid),
                       AIAssessment.assessment_type.in_(("big_five", "holistic_profile")))
                .order_by(AIAssessment.id.desc())
                .limit(1)
            )
        ).scalars().first()
        if row is None:
            return None
        text = re.sub(r"\s+", " ", str(row.analysis_text or ""))[:400]
        return _hit(text, f"assessment:{row.assessment_type}", 0.55,
                    {"where": "ai_assessments", "id": row.id, "raw": ""})
    except Exception:
        return None


_EXTRACTORS: Dict[str, Callable] = {
    "full_name": _x_full_name,
    "given_name": _x_given_name,
    "family_name": _x_family_name,
    "date_of_birth": _x_date_of_birth,
    "age": _x_age,
    "nationality": _x_nationality,
    "workplace": _x_workplace,
    "occupation": _x_occupation,
    "residence": _x_residence,
    "strengths": _x_strengths,
    "weaknesses": _x_weaknesses,
    "interests": _x_interests,
    "personality": _x_personality,
    # birthplace عمداً استخراج‌کننده ندارد: هیچ منبعِ قابل‌اعتمادی در برنامه
    # نیست و حدس‌زدنش بدتر از پرسیدن است — پس فقط پرسیده می‌شود.
}


# ── ذخیره / خواندن ──────────────────────────────────────────────────────────

async def _row(db: AsyncSession, uid: int, field: str):
    from app.models.owner_identity import OwnerIdentityField

    return (
        await db.execute(
            select(OwnerIdentityField).where(
                OwnerIdentityField.user_id == uid, OwnerIdentityField.field == field
            ).limit(1)
        )
    ).scalar_one_or_none()


async def refresh(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """همهٔ فیلدها را دوباره استخراج کن. فیلدِ قفل‌شدهٔ مالک دست نمی‌خورد."""
    from app.models.owner_identity import OwnerIdentityField

    updated = skipped = locked = 0
    for field, extractor in _EXTRACTORS.items():
        try:
            hit = await extractor(db, uid)
        except Exception as exc:
            logger.debug("identity extractor %s failed: %r", field, exc)
            hit = None
        row = await _row(db, uid, field)
        if row is not None and row.owner_locked:
            locked += 1
            continue
        if hit is None:
            skipped += 1
            continue
        value = str(hit["value"])
        if row is None:
            row = OwnerIdentityField(user_id=uid, field=field, label_fa=LABELS.get(field))
            db.add(row)
        if row.value != value:
            updated += 1
        row.value = value
        row.label_fa = LABELS.get(field)
        row.source = hit.get("source")
        row.confidence = hit.get("confidence")
        row.sources = hit.get("sources") or []
    await db.commit()
    return {"updated": updated, "skipped": skipped, "locked": locked}


async def get_identity(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """تصویرِ فعلی — همیشه همهٔ فیلدها، حتی خالی‌ها (تا مالک ببیند چه نمی‌دانیم)."""
    from app.models.owner_identity import OwnerIdentityField

    rows = {
        r.field: r
        for r in (
            await db.execute(
                select(OwnerIdentityField).where(OwnerIdentityField.user_id == uid)
            )
        ).scalars().all()
    }
    out = []
    for field, label, askable in FIELDS:
        r = rows.get(field)
        out.append({
            "field": field,
            "label": label,
            "value": (r.value if r else None),
            "source": (r.source if r else None),
            "confidence": (r.confidence if r else None),
            "sources": (r.sources if r else []) or [],
            "owner_locked": bool(r.owner_locked) if r else False,
            "askable": askable,
        })
    known = sum(1 for f in out if f["value"])
    return {"fields": out, "known": known, "total": len(out)}


async def set_field(db: AsyncSession, uid: int, field: str, value: str, *, lock: bool = True) -> Dict[str, Any]:
    """ویرایشِ دستیِ مالک — و به‌صورت پیش‌فرض قفل، تا استخراجِ خودکار
    فردا اصلاحش را پاک نکند."""
    from app.models.owner_identity import OwnerIdentityField

    if field not in LABELS:
        raise ValueError(f"unknown identity field: {field}")
    row = await _row(db, uid, field)
    if row is None:
        row = OwnerIdentityField(user_id=uid, field=field, label_fa=LABELS[field])
        db.add(row)
    text = str(value or "").strip()
    row.value = text or None
    row.label_fa = LABELS[field]
    row.owner_locked = bool(lock) and bool(text)
    row.source = "owner" if text else None
    row.confidence = 1.0 if text else None
    row.sources = [{"where": "owner", "id": None, "raw": "ویرایشِ دستی"}]
    await db.commit()
    # سن مشتقِ تاریخ تولد است — دستی که عوض شد، دوباره حساب شود.
    if field == "date_of_birth":
        try:
            await refresh_derived(db, uid)
        except Exception:
            pass
    return {"ok": True, "field": field, "value": row.value, "owner_locked": row.owner_locked}


async def refresh_derived(db: AsyncSession, uid: int = 0) -> None:
    """فیلدهای مشتق (فعلاً «سن») را از روی مقدارِ فعلی بازحساب کن."""
    from app.models.owner_identity import OwnerIdentityField

    dob_row = await _row(db, uid, "date_of_birth")
    if dob_row is None or not dob_row.value:
        return
    parsed = parse_loose_date(dob_row.value)
    if not parsed:
        return
    today = datetime.now(timezone.utc).date()
    years = today.year - parsed.year - ((today.month, today.day) < (parsed.month, parsed.day))
    if not (0 < years < 130):
        return
    row = await _row(db, uid, "age")
    if row is not None and row.owner_locked:
        return
    if row is None:
        row = OwnerIdentityField(user_id=uid, field="age", label_fa=LABELS["age"])
        db.add(row)
    row.value = str(years)
    row.source = "derived"
    row.confidence = dob_row.confidence or 0.9
    row.sources = [{"where": "date_of_birth", "id": None, "raw": str(parsed)}]
    await db.commit()


# ── پرسیدنِ آنچه نمی‌دانیم ──────────────────────────────────────────────────

async def ask_missing(db: AsyncSession, uid: int = 0, *, limit: int = 2) -> Dict[str, Any]:
    """برای فیلدهای مهمِ خالی، فرمِ پرسش بساز — با سقف، تا سیل نشود.

    `source_ref` به‌ازای هر فیلد یکتاست، پس حلقهٔ ابهام خودش تضمین می‌کند
    یک فیلد دو بار پرسیده نشود؛ و اگر مالک جواب ندهد، همان backoff و
    park خودش اعمال می‌شود."""
    from app.services import clarification_service as clar

    snapshot = await get_identity(db, uid)
    missing = [
        f for f in snapshot["fields"]
        if f["askable"] and not f["value"]
    ][:max(0, int(limit))]
    asked = []
    for f in missing:
        row = await _row(db, uid, f["field"])
        if row is not None and row.asked_at:
            continue
        c = await clar.ask(
            db,
            topic=f"پروفایل من: {f['label']}",
            context="این را از هیچ‌کدام از داده‌های برنامه نتوانستم دربیاورم.",
            source="identity",
            source_ref=f"identity:{uid}:{f['field']}",
            target={"kind": "owner_identity", "field": f["field"], "user_id": uid},
            questions=[{
                "key": f["field"],
                "label": f["label"] + "؟",
                "type": "date" if f["field"] == "date_of_birth" else "short",
                "why": "تا پروفایلت کامل شود و تحلیل‌ها درست‌تر باشند.",
                "required": False,
            }],
            priority=2,
            user_id=uid,
        )
        if c is not None:
            if row is None:
                from app.models.owner_identity import OwnerIdentityField

                row = OwnerIdentityField(user_id=uid, field=f["field"], label_fa=f["label"])
                db.add(row)
            row.asked_at = datetime.now(timezone.utc)
            asked.append(f["field"])
    await db.commit()
    return {"asked": asked}


async def apply_clarification_answer(db: AsyncSession, target: Dict[str, Any], value: str) -> List[Dict[str, Any]]:
    """جوابِ فرمِ تلگرام → همان فیلدِ پروفایل (و قفل، چون حرفِ خودِ مالک است)."""
    field = str(target.get("field") or "")
    uid = int(target.get("user_id") or 0)
    if field not in LABELS or not str(value or "").strip():
        return []
    await set_field(db, uid, field, value, lock=True)
    return [{"where": "owner_identity", "id": None,
             "label": f"پروفایل: {LABELS[field]} ثبت شد"}]


async def summary_lines(db: AsyncSession, uid: int = 0) -> List[str]:
    """خطوطِ فارسیِ کوتاه برای دستیار و گزارشِ روزانه — تا این داده هم
    مثل بقیه واقعاً به‌کار برود، نه اینکه فقط ذخیره شود."""
    snapshot = await get_identity(db, uid)
    lines = []
    for f in snapshot["fields"]:
        if f["value"]:
            lines.append(f"{f['label']}: {f['value']}")
    return lines[:14]
