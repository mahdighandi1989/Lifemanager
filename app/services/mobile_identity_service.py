"""هویتِ یک اعلانِ گوشی: «از کدام اپ» و «از طرفِ چه کسی».

مسئله‌ای که این فایل حل می‌کند (گزارشِ مالک، ۲۰۲۶-۰۷-۳۱): خیلی از اعلان‌های
ثبت‌شده نه اپ‌شان معلوم بود نه فرستنده‌شان — فقط متن. دو علتِ جدا داشت:

1. **اپ** با نامِ بستهٔ نرم‌افزاری ذخیره می‌شد (`org.telegram.messenger`) که
   برای آدمیزاد یعنی «نامعلوم». حالا نامِ خواندنی می‌نشیند، و برای رکوردهای
   قدیمی هم در لحظهٔ نمایش ترجمه می‌شود (بدون مهاجرت، بدون دست‌زدن به داده).
2. **فرستنده** فقط از `android.title` خوانده می‌شد؛ اعلان‌های تبلیغاتی و
   سیستمی و حتی خیلی از پیام‌رسان‌ها آن را خالی می‌گذارند و نامِ واقعی جای
   دیگری است. اینجا یک ترتیبِ اولویتِ صریح تعریف شده تا همیشه یک «فرستنده»
   قابل‌نمایش به‌دست بیاید و در بدترین حالت به نامِ اپ برگردد — «بی‌نام» نداریم.

اینجا فقط منطقِ نام‌گذاری است؛ نه I/O، نه FastAPI.
"""
from __future__ import annotations

import re
from typing import Optional, Sequence

# بسته‌های پرکاربرد با نامِ فارسی/برندی. فهرست کوتاه و صریح است: هرچه اینجا
# نباشد با قاعدهٔ عمومیِ زیر خوانا می‌شود، پس نبودنِ یک اپ «شکست» نیست.
KNOWN_APPS = {
    "org.telegram.messenger": "تلگرام",
    "org.telegram.messenger.web": "تلگرام",
    "org.thunderdog.challegram": "تلگرام X",
    "com.whatsapp": "واتس‌اپ",
    "com.whatsapp.w4b": "واتس‌اپ بیزینس",
    "com.instagram.android": "اینستاگرام",
    "com.instagram.lite": "اینستاگرام لایت",
    "com.facebook.katana": "فیسبوک",
    "com.facebook.orca": "مسنجر",
    "com.twitter.android": "ایکس (توییتر)",
    "com.linkedin.android": "لینکدین",
    "com.google.android.gm": "جی‌میل",
    "com.google.android.calendar": "تقویم گوگل",
    "com.google.android.apps.docs": "گوگل درایو",
    "com.google.android.apps.messaging": "پیام‌ها",
    "com.google.android.youtube": "یوتیوب",
    "com.android.vending": "گوگل‌پلی",
    "com.android.mms": "پیامک",
    "com.samsung.android.messaging": "پیامک سامسونگ",
    "com.android.dialer": "تلفن",
    "com.google.android.dialer": "تلفن",
    "com.android.systemui": "سیستم اندروید",
    "android": "سیستم اندروید",
    "com.android.settings": "تنظیمات",
    "com.spotify.music": "اسپاتیفای",
    "ir.divar": "دیوار",
    "ir.mci.ecareapp": "همراه من (همراه اول)",
    "ir.irancell.myirancell": "ایرانسل من",
    "com.digikala": "دیجی‌کالا",
    "ir.snapp.passenger": "اسنپ",
    "cab.snapp.passenger": "اسنپ",
    "com.tap30.passenger": "تپسی",
    "ir.bmi.bam": "بام (بانک ملی)",
    "com.pooya.melat": "بانک ملت",
    "ir.co.sadadpsp.bmi": "سداد",
    "com.isc.mobilebank": "همراه‌بانک",
    "net.jhoobin.jhub": "چارخونه",
    "ir.eitaa.messenger": "ایتا",
    "ir.nasim": "بله",
    "mobi.mmdt.ottplus": "سروش",
    "ir.rubika.messenger": "روبیکا",
    "ir.resaneh1.iptv": "روبیکا",
}

# پیشوندهای دامنه‌ای و واژه‌های بی‌معنا در نامِ بسته — برای قاعدهٔ عمومی.
_PKG_STOP = {
    "com", "org", "net", "io", "ir", "co", "me", "app", "apps", "android",
    "mobile", "client", "free", "pro", "lite", "plus", "beta", "release",
    "google", "samsung", "huawei", "xiaomi", "mi", "oppo", "vivo", "oneplus",
}

_PKG_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$")


def looks_like_package(value: Optional[str]) -> bool:
    """آیا این رشته نامِ بستهٔ نرم‌افزاری است (نه نامِ آدم/اپ)؟"""
    return bool(value) and bool(_PKG_RE.match((value or "").strip()))


def pretty_app(package: Optional[str], label: Optional[str] = None) -> str:
    """نامِ خواندنیِ اپ. اولویت: برچسبِ خودِ گوشی → فهرستِ شناخته‌شده →
    قاعدهٔ عمومی روی نامِ بسته → خودِ نامِ بسته (هرگز رشتهٔ خالی)."""
    label = (label or "").strip()
    if label and not looks_like_package(label):
        return label[:64]
    pkg = (package or "").strip()
    if not pkg:
        return ""
    if pkg in KNOWN_APPS:
        return KNOWN_APPS[pkg]
    if not looks_like_package(pkg):
        return pkg[:64]
    parts = [p for p in pkg.split(".") if p]
    meaningful = [p for p in parts if p.lower() not in _PKG_STOP]
    token = (meaningful[0] if meaningful else parts[-1]).replace("_", " ")
    # camelCase → دو کلمه، بعد حرفِ اولِ بزرگ.
    token = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", token)
    return token.title()[:64]


def resolve_sender(
    *,
    app: Optional[str] = None,
    app_label: Optional[str] = None,
    title: Optional[str] = None,
    sender_name: Optional[str] = None,
    conversation: Optional[str] = None,
    sub_text: Optional[str] = None,
) -> str:
    """«چه کسی/چه چیزی این را فرستاد؟» با ترتیبِ اولویتِ صریح.

    ``sender_name`` (سبکِ MessagingStyle) دقیق‌ترین است چون خودِ پیام‌رسان
    نامِ مخاطب را آنجا می‌گذارد؛ بعد نامِ گفتگو، بعد عنوان، بعد زیرنویس (جایی
    که برندها نامشان را می‌گذارند) و در آخر نامِ خودِ اپ — پس خروجی هرگز خالی
    نیست و «فرستندهٔ نامعلوم» از بین می‌رود."""
    for candidate in (sender_name, conversation, title, sub_text):
        value = (candidate or "").strip()
        # عنوانی که فقط شمارش است («۳ پیام جدید») فرستنده نیست.
        if value and not _is_countish(value) and not looks_like_package(value):
            return value[:120]
    return pretty_app(app, app_label)


_COUNT_RE = re.compile(
    r"(?i)^\s*[\d۰-۹]+\s*(new\s+)?(messages?|notifications?|پیام|اعلان|اعلانات|پیام‌?ها)\b"
)


def _is_countish(value: str) -> bool:
    return bool(_COUNT_RE.match(value or ""))


def notification_label(sender: str, app_name: str) -> str:
    """برچسبِ ستونِ لاگ: «فرستنده · اپ» — دو سؤالِ مالک در یک ستون. اگر
    فرستنده همان اپ باشد (اعلانِ خودِ اپ)، تکرار نمی‌شود."""
    sender = (sender or "").strip()
    app_name = (app_name or "").strip()
    if not sender:
        return app_name
    if not app_name or sender == app_name:
        return sender
    return f"{sender} · {app_name}"[:255]


def display_entity_label(entity_type: Optional[str], entity_label: Optional[str]) -> Optional[str]:
    """ترجمهٔ برچسبِ رکوردهای **قدیمی** در لحظهٔ نمایش.

    رکوردهای پیش از این اصلاح، نامِ بسته را در ``entity_label`` دارند. به‌جای
    مهاجرتِ داده (که برگشت‌ناپذیر است) همان‌جا که سریالایز می‌شود خوانا می‌شود:
    داده دست‌نخورده می‌ماند، نمایش درست می‌شود."""
    if entity_type != "phone_notification" or not entity_label:
        return entity_label
    raw = entity_label.strip()
    if looks_like_package(raw):
        return pretty_app(raw)
    # برچسبِ ترکیبیِ «فرستنده · بسته» هم ممکن است از کلاینتِ قدیمی آمده باشد.
    if " · " in raw:
        left, _, right = raw.partition(" · ")
        if looks_like_package(right):
            return f"{left} · {pretty_app(right)}"
    return entity_label


# ── دستهٔ اعلامیِ خودِ اندروید ────────────────────────────────────────────────
# اپ‌ها خودشان اعلان را برچسب می‌زنند (Notification.CATEGORY_*). این دقیق‌ترین
# منبعِ ممکن است و تا امروز دور ریخته می‌شد در حالی که از مدل می‌پرسیدیم متن
# تبلیغ است یا نه.
_ANDROID_CATEGORY_MAP = {
    "promo": "promo",
    "recommendation": "promo",
    "event": "appointment",
    "reminder": "appointment",
    "alarm": "appointment",
    "msg": "message",
    "social": "message",
    "email": "message",
    "call": "message",
    "missed_call": "message",
    # اعلان‌های «جاری»/سرویسی: پخش موسیقی، دانلود، مسیریابی، وضعیت باتری —
    # ثبت می‌شوند ولی هرگز مسیریابی نمی‌شوند.
    "transport": "system",
    "progress": "system",
    "service": "system",
    "status": "system",
    "sys": "system",
    "navigation": "system",
    "err": "system",
}


def category_hint(android_category: Optional[str], ongoing: bool = False) -> Optional[str]:
    """دستهٔ پیشنهادیِ برآمده از اعلامِ خودِ اپ (یا None اگر چیزی نگفته)."""
    key = (android_category or "").strip().lower()
    hint = _ANDROID_CATEGORY_MAP.get(key)
    if hint is None and ongoing:
        return "system"
    return hint


def compose_text(
    *,
    title: Optional[str] = None,
    text: Optional[str] = None,
    sub_text: Optional[str] = None,
    lines: Optional[Sequence[str]] = None,
) -> str:
    """متنِ کاملِ اعلان برای تحلیل — بدون تکرارِ بخش‌هایی که در هم آمده‌اند."""
    chunks = []
    for part in (title, text, sub_text):
        value = (part or "").strip()
        if value and value not in chunks:
            chunks.append(value)
    for line in (lines or [])[:10]:
        value = (line or "").strip()
        if value and value not in chunks:
            chunks.append(value)
    return "\n".join(chunks).strip()
