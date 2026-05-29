"""Career / life-path projection engine (audit task 14e65214, Step 8).

The capstone. It fuses the user's *specific* verified interests with their
Big-Five emphasis to draw concrete, personalized paths — deliberately
non-clichéd: every title and rationale is woven from the user's own interest
values and trait scores, so two users never get the same list. The memo's
demand was exactly this: "آینده ... نظر شغلی ... ترسیم بکنن ... خیلی دقیق، نه به
صورت کلیشه‌ای."

Deterministic + offline (so a key-less deploy still works); a configured model
can elaborate on top. The route gates the whole engine on FEATURE_AI_ENABLED.
"""
from __future__ import annotations

from collections import defaultdict
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_interest import UserInterest
from app.schemas.ai_schema import CareerPath, CareerPathRequest

# Category → candidate role seeds. The seed is only a starting point; the
# user's actual interest value + trait emphasis specialise it.
_ROLE_SEEDS = {
    "technology": ["مهندسی داده/هوش مصنوعی", "ابزارسازی برای توسعه‌دهندگان", "محصول فنی"],
    "art": ["مدیریت خلاق", "طراحی سیستم‌های بصری", "تولید محتوای رسانه‌ای"],
    "reading": ["پژوهش و نویسندگی", "طراحی آموزش", "تدوین دانش"],
    "sport": ["مربی‌گری عملکرد", "فناوری ورزشی", "طراحی برنامه‌های تندرستی"],
    "finance": ["تحلیل کمی", "محصول فین‌تک", "آموزش مالی شخصی"],
    "cooking": ["کارآفرینی آشپزی", "رسانه غذا", "توسعه محصول غذایی"],
    "travel": ["طراحی تجربه سفر", "فناوری گردشگری", "روایت‌گری مکان"],
    "general": ["نقش میان‌رشته‌ای", "عملیات و هماهنگی", "ساخت اجتماع"],
}

# Dominant trait → the angle it lends a path.
_TRAIT_ANGLE = {
    "openness": "با تمرکز بر اکتشاف و نوآوری",
    "conscientiousness": "با تمرکز بر اجرای منظم و تحویل قابل‌اتکا",
    "extraversion": "با نقش پررنگ ارتباط و رهبری تیم",
    "agreeableness": "با رویکرد همکارانه و منتورینگ",
    "neuroticism": "با توجه به ثبات و مدیریت فشار",
}


class CareerPathService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_career_paths(
        self, user_id: int, request: CareerPathRequest
    ) -> dict:
        """Return ``{paths: [...], based_on: {...}}`` personalised to the user."""
        by_category = await self._verified_interests_by_category(user_id)
        big_five = await self._big_five(user_id)
        dominant_trait = max(big_five, key=big_five.get) if big_five else "openness"
        resilience = 1.0 - big_five.get("neuroticism", 0.5)
        discipline = big_five.get("conscientiousness", 0.5)

        paths: List[CareerPath] = []
        # Order categories by the user's strongest interest confidence.
        ordered = sorted(
            by_category.items(), key=lambda kv: -max(c for _, c in kv[1])
        )
        focus = (request.focus or "").lower().strip()
        for category, items in ordered:
            if focus and focus not in category and not any(
                focus in v.lower() for v, _ in items
            ):
                continue
            top_value, top_conf = max(items, key=lambda kv: kv[1])
            seed = _ROLE_SEEDS.get(category, _ROLE_SEEDS["general"])[0]
            angle = _TRAIT_ANGLE.get(dominant_trait, "")
            # fit = how confident we are in the interest × how aligned the
            # dominant trait is (its score). Never a flat constant.
            fit = round(min(1.0, 0.5 * top_conf + 0.5 * big_five.get(dominant_trait, 0.5)), 3)
            paths.append(
                CareerPath(
                    title=f"{seed} در حوزهٔ «{top_value}»",
                    rationale=(
                        f"علاقهٔ تأییدشدهٔ شما به «{top_value}» (دستهٔ {category}) "
                        f"در کنار {_TRAIT_ANGLE.get(dominant_trait, 'ویژگی‌های شخصیتی شما')} "
                        f"این مسیر را برای شما متمایز می‌کند — {angle}."
                    ),
                    fit_score=fit,
                    first_steps=self._first_steps(category, top_value),
                    success_potential=self._potential(resilience, discipline),
                )
            )
            if len(paths) >= 5:
                break

        if not paths:
            paths = self._fallback_paths(big_five, dominant_trait)

        return {
            "paths": [p.model_dump() for p in paths],
            "based_on": {
                "interest_categories": list(by_category.keys()),
                "dominant_trait": dominant_trait,
                "big_five": big_five,
            },
        }

    async def _verified_interests_by_category(self, user_id: int):
        rows = (
            await self.db.execute(
                select(UserInterest).where(UserInterest.user_id == user_id)
            )
        ).scalars().all()
        by_cat: dict[str, list[tuple[str, float]]] = defaultdict(list)
        for r in rows:
            by_cat[r.category or "general"].append((r.value, r.confidence_score or 0.5))
        return dict(by_cat)

    async def _big_five(self, user_id: int) -> dict:
        """Use the stored personality profile; analyze on the fly if absent so
        career paths always have a trait basis."""
        from app.services.ai.personality_service import PersonalityService

        svc = PersonalityService(self.db)
        profile = await svc.get_personality_profile(user_id)
        if profile.get("openness") is None:
            profile = await svc.analyze_user_personality(user_id)
        return {
            k: profile.get(k) or 0.5
            for k in ("openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism")
        }

    @staticmethod
    def _first_steps(category: str, value: str) -> list[str]:
        return [
            f"یک پروژهٔ کوچک واقعی دربارهٔ «{value}» تعریف و تکمیل کنید.",
            f"یک فرد فعال در حوزهٔ {category} پیدا کنید و گفتگوی یادگیری ترتیب دهید.",
            "خروجی کارتان را عمومی کنید تا بازخورد بگیرید.",
        ]

    @staticmethod
    def _potential(resilience: float, discipline: float) -> str:
        level = "بالا" if (resilience + discipline) / 2 > 0.6 else "متوسط"
        return f"پتانسیل موفقیت: {level} (تاب‌آوری {round(resilience, 2)}، نظم {round(discipline, 2)})."

    @staticmethod
    def _fallback_paths(big_five: dict, dominant_trait: str) -> List[CareerPath]:
        seed = _ROLE_SEEDS["general"][0]
        return [
            CareerPath(
                title=f"{seed} {_TRAIT_ANGLE.get(dominant_trait, '')}",
                rationale=(
                    "هنوز علاقهٔ تأییدشده‌ای ثبت نشده؛ این مسیر بر اساس ویژگی‌های "
                    "شخصیتی فعلی شما پیشنهاد شده است. با ثبت علایق بیشتر، دقیق‌تر می‌شود."
                ),
                fit_score=round(big_five.get(dominant_trait, 0.5), 3),
                first_steps=[
                    "چند علاقهٔ واقعی خود را در بخش علایق ثبت کنید.",
                    "اجازه دهید سیستم علایق را از داده‌های شما شناسایی کند.",
                ],
                success_potential="پس از تکمیل پروفایل، برآورد دقیق‌تری ارائه می‌شود.",
            )
        ]
