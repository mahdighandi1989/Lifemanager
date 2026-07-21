---
title: "Rate-limited dict endpoints need a Response param (and tests that disable the limiter hide it)"
tags: ["rate-limiting", "slowapi", "fastapi", "testing", "production-only-bug"]
topic_canonical: "rate-limited-dict-endpoint-needs-response-param"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-21T00:00:00Z"
created_at: "2026-07-21T00:00:00Z"
updated_at: "2026-07-21T00:00:00Z"
merged_from: []
---

# Rate-Limited Dict Endpoints Need a `Response` Param

## 🎯 چالش / Challenge

یک endpoint که هم decoratorِ rate-limit دارد (slowapi `@limiter.limit(...)`) و هم
یک `dict`/مدل برمی‌گرداند (نه یک `Response`)، در **تولید** با ۵۰۰ می‌افتد:

```
slowapi/extension.py _inject_headers
Exception: parameter `response` must be an instance of starlette.responses.Response
```

slowapi بعد از اجرای endpoint باید هدرهای `X-RateLimit-*` را در یک شیء
`Response` تزریق کند؛ اگر endpoint پارامتر `response: Response` نداشته باشد،
چیزی برای تزریق پیدا نمی‌کند و استثناء می‌دهد.

نکتهٔ خطرناک: تقریباً همهٔ پروژه‌ها rate-limit را در تست **غیرفعال** می‌کنند
(سرعت + پرهیز از ۴۲۹ اتفاقی). پس مسیرِ تزریقِ هدر در تست هرگز اجرا نمی‌شود و این
باگ **فقط در تولید** دیده می‌شود — یک کلاسِ کامل از باگ‌ها که کل تستِ سبز از آن
بی‌خبر است.

بدتر: این باگ می‌تواند سال‌ها «نهفته» بماند و با یک تغییرِ بی‌ربط ظاهر شود. در
مورد ما، endpointِ بکاپ قبلاً پیش از `return` به‌خاطر OOM کشته می‌شد؛ وقتی OOM را
با استریم رفع کردیم، endpoint سالم return کرد، به تزریقِ هدر رسید، و ۵۰۰ رونمایی
شد.

## 💡 راه‌حل / Solution

هر endpointِ rate-limited که Response خام برنمی‌گرداند، یک پارامتر
`response: Response` بگیرد. FastAPI یک Response موقت تزریق می‌کند، slowapi هدرها را
در آن می‌گذارد، و FastAPI هدرها را روی پاسخِ نهایی (که از dict ساخته می‌شود)
merge می‌کند.

```python
from fastapi import Request, Response

@router.post("/api/thing")
@limiter.limit("6/hour")
async def run_thing(
    request: Request,
    response: Response,   # ← slowapi هدرهای X-RateLimit-* را در این می‌گذارد
    db: AsyncSession = Depends(get_db),
) -> dict:               # برگرداندنِ dict حالا امن است
    return await service.do(db)
```

اگر بین decoratorها یک wrapper دیگر هم هست (مثلاً `@handle_errors`)، باید با
`functools.wraps` امضا را حفظ کند تا FastAPI و slowapi هر دو `response: Response`
را در امضا ببینند و مقدارش را در زمان فراخوانی به‌عنوان kwarg پیدا کنند.

## 🧪 تست رگرسیون (کلید ماجرا)

باگ فقط با limiterِ **فعال** دیده می‌شود، پس تستِ رگرسیون باید limiter را روشن کند
(نه با تنظیمات پیش‌فرضِ تست که خاموش است):

```python
@pytest_asyncio.fixture
async def rate_limited_client(monkeypatch):
    monkeypatch.setattr(app.state.limiter, "enabled", True)  # روشن!
    app.state.limiter.reset()
    ...  # engine/override معمول
    yield TestClient(app)
    app.state.limiter.reset()

def test_endpoint_under_active_limiter_returns_200_not_500(rate_limited_client):
    r = rate_limited_client.post("/api/thing")
    assert r.status_code == 200, r.text          # نه ۵۰۰ از تزریقِ هدر
    keys = {k.lower() for k in r.headers.keys()}
    assert "x-ratelimit-limit" in keys or "x-ratelimit-remaining" in keys
```

قبل از رفع، این تست ۵۰۰ می‌دهد؛ بعد از رفع ۲۰۰. (اثباتش: پارامتر `response` را
موقتاً بردار و تست را ببین.)

## ⚠️ نکات حیاتی / Pitfalls

- **هر cross-cutting concern که در تست خاموش می‌شود، یک نقطه‌کورِ تولید است.**
  rate-limit، auth سخت‌گیرانه، CSP، pagination اجباری — برای هر کدام حداقل یک تست
  با آن ویژگی **روشن** بگذار، وگرنه تستِ سبز دروغ می‌گوید.
- **همهٔ endpointهای rate-limited را یک‌جا ممیزی کن**، نه فقط آن که گزارش شده.
  با یک grep روی `limiter.limit` کل لیست را دربیاور و هر کدام که `dict` برمی‌گرداند
  و `response: Response` ندارد را رفع کن (ما دو مورد داشتیم، فقط یکی گزارش شده بود).
- **باگِ «فقط تولید» را با یک رفعِ بی‌ربط پنهان نکن.** وقتی یک خطا (اینجا OOM)
  یک خطای دیگر را ماسک می‌کرده، رفعِ اولی دومی را رو می‌کند — انتظارش را داشته باش
  و بعد از دیپلویِ رفعِ اول، لاگِ تولید را دوباره بخوان.
- **پیام‌های `last_error` ذخیره‌شده stale می‌مانند.** اگر وضعیت را در یک blob نگه
  می‌داری، مطمئن شو مسیرِ موفقیت `last_error` را به None برمی‌گرداند وگرنه کاربر یک
  خطای رفع‌شدهٔ قدیمی را برای همیشه می‌بیند.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. `grep -rn "limiter.limit"` بزن؛ هر endpointی که Response خام برنمی‌گرداند باید
   `response: Response` در امضا داشته باشد.
2. یک fixture با limiterِ **فعال** بساز و برای هر خانوادهٔ endpoint یک تستِ
   «۲۰۰-not-500 + هدرِ x-ratelimit» بگذار.
3. برای هر middleware/decoratorِ سراسری که در تست خاموش می‌شود، یک تستِ کوچک با
   حالتِ **روشن** اضافه کن تا نقطه‌کورِ تولید بسته شود.
4. بعد از هر رفعِ خطایی که ممکن بوده خطای دیگری را ماسک کند، لاگِ تولید را دوباره
   بخوان — رفع، لایهٔ بعدی را رو می‌کند.

## 🔗 References

- مرتبط: [full-db-json-export-with-degraded-cloud-backup] (رفعِ OOM که این باگ را رو کرد)
- مرتبط: [write-gate-next-to-optional-identity] (یک gate دیگر که باید کنارِ هویت بنشیند)
