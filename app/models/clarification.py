"""Clarification — «پرسشِ رفعِ ابهام» از مالک، به‌جای حدس‌زدن یا رهاکردن.

خواستهٔ مالک (۲۰۲۶-۰۷-۳۱): وقتی موتور دارد داده‌ها را مسیریابی می‌کند و
جایی برایش سؤال است — یا موضوع آن‌قدر مهم است که باید خودِ او جواب بدهد —
سؤال‌ها به شکلِ یک **فرمِ پرشدنی** در تلگرام برود، او فیلدها را پر کند و
بفرستد، هوش مصنوعی جواب‌ها را تحلیل کند و در قسمت‌های مربوطه ثبت شود.

قواعدی که این جدول باید پشتیبانی کند (همه از خواستهٔ مالک):

* **فیلدها هرگز هاردکد نیستند** — هر بار برحسب موضوع ساخته می‌شوند، پس
  ``questions`` یک JSON پویاست نه ستون‌های ثابت.
* **جوابِ نصفه** طبیعی است: هر فیلد جوابِ کوتاه، بلند یا **خالی** می‌گیرد؛
  فیلدِ بی‌جواب باز می‌ماند و بعداً دوباره پرسیده می‌شود.
* **دوباره‌فرستادن**: اگر پیام دیده نشد یا بالا رفت، با فاصلهٔ فزاینده تکرار
  می‌شود (``attempts`` / ``last_sent_at``).
* **ادغام**: اگر تا زمانِ ارسالِ بعدی سؤالِ تازه‌ای دربارهٔ همین موضوع پیدا شد،
  به همین فرم اضافه می‌شود — نه یک فرمِ دومِ موازی.
* **بایگانی، نه حذف**: فرمِ رهاشده ``parked`` می‌شود و در برنامه دیده می‌شود؛
  هیچ سؤالی پاک نمی‌شود (قاعدهٔ «هیچ‌چیز گم نمی‌شود»).

``target`` می‌گوید جوابِ این فرم قرار است کجا بنشیند (مثلاً یک آیتمِ صندوق،
یک حسابِ مالی، یک فرد) و ``result`` می‌گوید در عمل کجا نشست — تا فیدبکِ
تلگرام واقعی باشد نه تعارف.

New table ⇒ Base.metadata.create_all() at startup (registered in
app/models/__init__.py) + alembic 0055 for the production path.
"""
from sqlalchemy import JSON, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class Clarification(Base):
    __tablename__ = "clarifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)

    # موضوع (یک خط فارسی، تیترِ فرم) و متنِ خامی که ابهام از آن آمده.
    topic = Column(String(300), nullable=False)
    context = Column(Text, nullable=True)

    # کدام بخشِ سامانه پرسیده (dispatcher/inbox/finance/person/…) و کلیدِ
    # ضدتکرار: دو ابهامِ یکسان نباید دو فرم بسازند.
    source = Column(String(48), nullable=True, index=True)
    source_ref = Column(String(191), nullable=True, index=True)

    # {"kind": "inbox_item"|"finance_account"|"person"|"none", "id": ...}
    target = Column(JSON, nullable=True)

    # [{key,label,type,choices,why,required,answer,answered_at,status}, …]
    questions = Column(JSON, nullable=True)
    # تاریخچهٔ خامِ جواب‌ها: [{"at": iso, "text": "...", "via": "telegram"}]
    answers = Column(JSON, nullable=True)
    # نتیجهٔ ثبت: [{"where": "task", "id": 12, "label": "…"}]
    result = Column(JSON, nullable=True)
    # گفتگوی دوطرفه دربارهٔ همین ابهام (۲۰۲۶-۰۷-۳۱، خواستهٔ مالک: «اگر خودم
    # سؤالی داشتم بتوانم بپرسم و جواب بگیرم، حتی چند بار — ولی موضوع و
    # سؤال‌های اصلی نباید گم شود»). هر عنصر: {"at","role":"owner|assistant","text"}
    discussion = Column(JSON, nullable=True)

    # open | partial | answered | filed | skipped | parked
    status = Column(String(16), nullable=False, default="open", index=True)
    priority = Column(Integer, nullable=False, default=0)

    attempts = Column(Integer, nullable=False, default=0)
    last_sent_at = Column(DateTime(timezone=True), nullable=True)
    snoozed_until = Column(DateTime(timezone=True), nullable=True)
    # پیامِ تلگرامِ همین فرم — جوابِ کاربر با reply به همین پیام گره می‌خورد،
    # پس چند فرمِ باز هم‌زمان قاطی نمی‌شوند و پیامِ قدیمی هم قابل‌جواب می‌ماند.
    chat_id = Column(String(64), nullable=True)
    message_id = Column(String(32), nullable=True, index=True)

    ai_model = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    filed_at = Column(DateTime(timezone=True), nullable=True)
