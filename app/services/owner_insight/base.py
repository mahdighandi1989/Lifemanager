"""شکلِ یک «ادعا دربارهٔ مالک» و قراردادِ یک منبع.

طراحی از روی دو شکستِ مشخصِ نسخهٔ قبل:

* آنجا هر فیلد یک **رشتهٔ تنها** بود، پس «شاخص پشتکار ۱۰/۱۰۰» و «نام: علی»
  از نظر ساختار یکی بودند و رابط نمی‌توانست بفهمد کدام واقعیت است و کدام
  استنباط، یا کدام خوب است و کدام بد. اینجا هر ادعا `kind` و `tone` و
  `evidence` دارد.
* آنجا هیچ ادعایی به صفحهٔ صاحبش وصل نبود، پس صفحه جزیره شد. اینجا
  `owns_page` اجباری است.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Awaitable, Callable, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession


class FacetGroup(str, Enum):
    """دسته‌بندیِ آنچه مالک می‌بیند — از «قطعی» به «استنباطی»."""

    FACTS = "facts"            # واقعیت‌های سخت (سند، مدرک)
    SELF = "self"              # شخصیت، ارزش‌ها، قوت و ضعف
    BEHAVIOUR = "behaviour"    # آنچه واقعاً انجام می‌دهد: خواب، روتین، مکان
    HABITS = "habits"          # پشتکار، عادت‌ها، چیزهایی که رها می‌کند
    WORLD = "world"            # آدم‌ها و پول — رابطه با بیرون
    UNLINKED = "unlinked"      # دادهٔ موجود که هنوز به هیچ‌جا وصل نیست

    @staticmethod
    def label(value: str) -> str:
        return {
            "facts": "واقعیت‌های هویتی",
            "self": "من از نگاهِ خودم",
            "behaviour": "آنچه واقعاً می‌کنم",
            "habits": "عادت‌ها و پشتکار",
            "world": "آدم‌ها و پول",
            "unlinked": "داده‌هایی که هنوز وصل نیستند",
        }.get(value, value)


class Tone(str, Enum):
    """این ادعا خبرِ خوب است، بد، یا خنثی؟

    نبودِ همین یک فیلد بود که «شاخص پشتکار ۱۰/۱۰۰» را زیرِ عنوانِ «نقاط قوت»
    نشاند. حالا provider موظف است بگوید یافته‌اش چه معنایی دارد.
    """

    GOOD = "good"
    NEUTRAL = "neutral"
    WATCH = "watch"     # جای توجه — نه فاجعه، ولی خبرِ خوب هم نیست


class Kind(str, Enum):
    FACT = "fact"            # از یک سند/ستون؛ قابلِ راستی‌آزمایی
    MEASURED = "measured"    # از دادهٔ واقعیِ رفتاری محاسبه شده
    INFERRED = "inferred"    # استنباط (مدل یا اکتشافی) — همیشه با شواهد
    OWNER = "owner"          # حرفِ خودِ مالک؛ بالاتر از همه


@dataclass
class Facet:
    """یک ادعای واحد دربارهٔ مالک."""

    key: str
    title: str                       # عنوانِ فارسیِ کوتاه
    statement: str                   # خودِ ادعا — **جمله**، نه عدد
    group: str = FacetGroup.FACTS.value
    kind: str = Kind.FACT.value
    tone: str = Tone.NEUTRAL.value
    confidence: Optional[float] = None
    # شواهد: هر قلم یک جملهٔ کوتاهِ قابلِ‌فهم، نه dump. «این را از کجا آوردی؟»
    evidence: List[str] = field(default_factory=list)
    source_label: str = ""           # نامِ خواندنیِ منبع
    owns_page: str = ""              # مسیرِ صفحه‌ای که صاحبِ این داده است
    owner_locked: bool = False       # مالک خودش نوشته/قفل کرده
    editable_field: Optional[str] = None   # اگر قابلِ ویرایشِ مستقیم است

    def as_dict(self) -> Dict[str, Any]:
        return {
            "key": self.key,
            "title": self.title,
            "statement": self.statement,
            "group": self.group,
            "kind": self.kind,
            "tone": self.tone,
            "confidence": self.confidence,
            "evidence": list(self.evidence)[:6],
            "source_label": self.source_label,
            "owns_page": self.owns_page,
            "owner_locked": self.owner_locked,
            "editable_field": self.editable_field,
        }


@dataclass
class Provider:
    """یک منبعِ ثبت‌شده.

    ``owns_page`` اجباری است و بی‌دلیل نیست: هر چیزی که این صفحه نشان می‌دهد
    باید دری به صفحه‌ای داشته باشد که واقعاً صاحبِ آن داده است. همین قید است
    که «گردآورنده» را از «جزیرهٔ تازه» جدا می‌کند.
    """

    key: str
    label: str
    owns_page: str
    collect: Callable[[AsyncSession, int], Awaitable[Optional[List[Facet]]]]
    group_order: int = 50
    timeout_s: float = 8.0
