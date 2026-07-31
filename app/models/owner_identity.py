"""OwnerIdentity — «من که هستم»، یک تصویرِ واحد از خودِ مالک.

خواستهٔ مالک (۲۰۲۶-۰۷-۳۱): «اسم و فامیلم، سنم، تاریخ تولدم، ویژگی‌های
شخصیتی‌ام، محلِ کارم و اینکه چه‌کار می‌کنم، کجا زندگی می‌کنم، محلِ تولدم،
ضعف‌ها و قوت‌هایم — همه از تمامِ داده‌ها و تحلیل‌های برنامه استخراج و
به‌روز شود، در پروفایلم قابلِ ویرایش باشد، و ابهام‌هایش در تلگرام پرسیده شود.»

تا امروز چنین موجودیتی نبود: نام در پنج جدولِ مختلف با پنج املا، تاریخ تولد
فقط در گواهینامه، محلِ تولد هیچ‌جا، و هیچ چیزِ استخراج‌شده‌ای قابلِ ویرایش نبود.

طراحی — سه قاعده که همه از تجربه‌های همین مخزن می‌آیند:

1. **هر فیلد، یک رکورد** (نه یک بلابِ JSON). چون هر فیلد باید منبع، درجهٔ
   اطمینان و «حرفِ آخرِ مالک» جدا داشته باشد. یک بلاب یعنی نمی‌شود فقط یک
   قلم را اصلاح کرد — همان اشتباهی که در `self_model` هست و اینجا تکرار نشد.
2. **حرفِ مالک همیشه برنده است** (`owner_locked`) — دقیقاً مثل
   `owner_balance_at` در مالی و `relationship_override` در پروفایلِ افراد.
   استخراجِ خودکار هرگز روی قفل نمی‌نویسد.
3. **منبع و شواهد ذخیره می‌شوند** تا وقتی مالک می‌پرسد «این را از کجا
   آوردی؟» جوابِ واقعی باشد، نه اعتماد کور.

جدولِ تازه ⇒ `Base.metadata.create_all()` می‌سازدش (ثبت در
app/models/__init__.py) + alembic 0058 برای مسیرِ تولید.
"""
from sqlalchemy import JSON, Boolean, Column, DateTime, Float, Integer, String, Text, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class OwnerIdentityField(Base):
    __tablename__ = "owner_identity_fields"
    __table_args__ = (UniqueConstraint("user_id", "field", name="uq_owner_identity_user_field"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)

    # کلیدِ فیلد: given_name, family_name, full_name, date_of_birth, age,
    # birthplace, nationality, residence, workplace, occupation, strengths,
    # weaknesses, personality, interests …  فهرست باز است — افزودنِ فیلدِ
    # تازه نیازی به مهاجرت ندارد.
    field = Column(String(64), nullable=False, index=True)
    label_fa = Column(String(120), nullable=True)
    value = Column(Text, nullable=True)

    # از کجا آمد و چقدر مطمئنیم (0..1). `sources` فهرستِ شواهد است:
    # [{"where": "identity_documents", "id": 3, "raw": "…"}]
    source = Column(String(64), nullable=True)
    confidence = Column(Float, nullable=True)
    sources = Column(JSON, nullable=True)

    # حرفِ آخرِ مالک: وقتی True است، هیچ استخراجِ خودکاری بازنویسی‌اش نمی‌کند.
    owner_locked = Column(Boolean, nullable=False, default=False)
    # آیا برای این فیلد از مالک پرسیده‌ایم (تا دوباره سیل نشود)
    asked_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
