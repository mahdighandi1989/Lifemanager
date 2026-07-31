"""مکان‌ها و سفرها — «کجا بودم، کِی، و با کدام گوشی».

خواستهٔ مالک (۲۰۲۶-۰۷-۳۱): ردیابیِ لحظه‌به‌لحظهٔ موقعیت، کشفِ خانه و محلِ کار،
کشفِ الگوهای رفت‌وآمد، و — مهم‌ترین قید — «برای مسیری که الگویش کشف شده دیگر
سؤال نکن، مگر خلافِ الگو کاری انجام شده باشد».

سه جدول، چون سه چیزِ متفاوت‌اند:

* ``places``    — یک نقطهٔ **تکرارشونده** که مالک آنجا می‌ماند (خانه/کار/…).
  از خوشه‌بندیِ نقاطِ خام ساخته می‌شود، نه از پرسش.
* ``visits``    — یک بارِ حضور در یک مکان (ورود/خروج). واحدِ «چه‌کار کردی؟».
* ``trips``     — جابه‌جایی از مکانی به مکانِ دیگر. الگوها روی این‌ها ساخته
  می‌شوند: (مبدأ، مقصد، روزِ هفته، بازهٔ ساعت) که چند بار تکرار شده باشد
  «عادی» است و دیگر پرسیده نمی‌شود.

``device`` روی همه هست چون مالک چند گوشی دارد و باید معلوم باشد **با کدام**
جابه‌جا شده — همان چیزی که خواسته بود.

جدولِ تازه ⇒ create_all + alembic 0059.
"""
from sqlalchemy import (
    JSON, Boolean, Column, DateTime, Float, Integer, String, Text, UniqueConstraint,
)
from sqlalchemy.sql import func

from app.database import Base


class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)

    label = Column(String(160), nullable=True)      # «خانه» / «دفتر» / نامی که مالک داد
    kind = Column(String(24), nullable=True, index=True)  # home | work | gym | other | unknown
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_m = Column(Float, nullable=False, default=150.0)
    address = Column(String(400), nullable=True)

    visit_count = Column(Integer, nullable=False, default=0)
    total_minutes = Column(Float, nullable=False, default=0.0)
    # ساعاتِ حضور (۰..۲۳ → دقیقه) — پایهٔ تشخیصِ خانه از محلِ کار.
    hour_histogram = Column(JSON, nullable=True)
    first_seen_at = Column(DateTime(timezone=True), nullable=True)
    last_seen_at = Column(DateTime(timezone=True), nullable=True, index=True)

    # مالک اسم/نوعش را خودش گفته → استنتاج رویش نمی‌نویسد.
    owner_locked = Column(Boolean, nullable=False, default=False)
    asked_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Visit(Base):
    __tablename__ = "place_visits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    place_id = Column(Integer, nullable=True, index=True)   # بدونِ FK، مثل activity_logs

    device = Column(String(64), nullable=True, index=True)
    arrived_at = Column(DateTime(timezone=True), nullable=True, index=True)
    left_at = Column(DateTime(timezone=True), nullable=True)
    minutes = Column(Float, nullable=True)
    # «آنجا چه کردی؟» — جوابِ مالک، اگر پرسیده و داده شده باشد.
    note = Column(Text, nullable=True)
    asked_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Trip(Base):
    __tablename__ = "place_trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    device = Column(String(64), nullable=True, index=True)

    from_place_id = Column(Integer, nullable=True, index=True)
    to_place_id = Column(Integer, nullable=True, index=True)
    started_at = Column(DateTime(timezone=True), nullable=True, index=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    minutes = Column(Float, nullable=True)
    distance_km = Column(Float, nullable=True)

    # امضای الگو: from:to:weekday:hour_bucket — شمارشش در RoutePattern است.
    pattern_key = Column(String(120), nullable=True, index=True)
    # آیا این سفر خلافِ الگوی شناخته‌شده بود (تنها حالتی که سؤال/هشدار دارد)
    is_anomaly = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RoutePattern(Base):
    __tablename__ = "route_patterns"
    __table_args__ = (
        UniqueConstraint("user_id", "pattern_key", name="uq_route_pattern_user_key"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    pattern_key = Column(String(120), nullable=False, index=True)

    from_place_id = Column(Integer, nullable=True)
    to_place_id = Column(Integer, nullable=True)
    weekday = Column(Integer, nullable=True)        # 0=دوشنبه … (datetime.weekday)
    hour_bucket = Column(Integer, nullable=True)    # ساعتِ شروع، گردشده

    occurrences = Column(Integer, nullable=False, default=0)
    avg_minutes = Column(Float, nullable=True)
    last_seen_at = Column(DateTime(timezone=True), nullable=True)
    # وقتی به حدِ نصاب رسید «آموخته» می‌شود و دیگر دربارهٔ آن پرسیده نمی‌شود.
    learned = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
