package ir.lifemanager.companion

import android.Manifest
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.concurrent.TimeUnit

/**
 * صفحهٔ جفت‌سازی: آدرس سرور + توکن (از /api/mobile/token داخل برنامهٔ وب) را
 * بگیر، دسترسی‌ها را راهنمایی کن، و کارگرهای دوره‌ای (ضربان + گزارش کارکرد
 * روزانه) را روشن کن. UI ساده و کدنویسی‌شده — بدون لایهٔ اضافه.
 */
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val prefs = Net.prefs(this)
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 96, 48, 48)
            layoutDirection = android.view.View.LAYOUT_DIRECTION_RTL
        }

        val title = TextView(this).apply {
            text = "همراهِ مدیریت زندگی — رصدگر"
            textSize = 20f
        }
        val urlInput = EditText(this).apply {
            hint = "آدرس سرور (https://…)"
            setText(prefs.getString("base_url", ""))
        }
        val tokenInput = EditText(this).apply {
            hint = "توکن دستگاه (از /api/mobile/token)"
            setText(prefs.getString("token", ""))
        }
        val deviceInput = EditText(this).apply {
            hint = "نام این گوشی (مثلاً s24-اصلی)"
            setText(prefs.getString("device", android.os.Build.MODEL))
        }
        val status = TextView(this)

        val saveBtn = Button(this).apply {
            text = "اتصال و شروع رصد"
            setOnClickListener {
                prefs.edit()
                    .putString("base_url", urlInput.text.toString().trim())
                    .putString("token", tokenInput.text.toString().trim())
                    .putString("device", deviceInput.text.toString().trim())
                    .apply()
                requestSmsPermission()
                schedulePeriodicWork()
                LocationTrackingService.startIfEnabled(this)
                sendHeartbeat()
                status.text = "ذخیره شد. ضربان فرستاده شد — در برنامهٔ وب /api/mobile/status را ببین.\n" +
                    "دسترسی اعلان‌ها و آمار مصرف را هم از دکمه‌های زیر بده."
            }
        }
        val notifBtn = Button(this).apply {
            text = "دادن دسترسی اعلان‌ها (Notification access)"
            setOnClickListener {
                startActivity(Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS"))
            }
        }
        // ردیابیِ دقیق: اختیاری و پیش‌فرض خاموش، چون باتری می‌برد. متنِ دکمه
        // خودش وضعیت را می‌گوید تا معلوم باشد الان روشن است یا نه.
        lateinit var preciseBtn: Button
        preciseBtn = Button(this).apply {
            text = if (LocationTrackingService.isEnabled(this@MainActivity))
                "⏹ خاموش‌کردن ردیابی دقیق مسیر" else "▶️ روشن‌کردن ردیابی دقیق مسیر (باتری بیشتر)"
            setOnClickListener {
                val turningOn = !LocationTrackingService.isEnabled(this@MainActivity)
                if (turningOn && !LocationWorker.hasPermission(this@MainActivity)) {
                    requestSmsPermission()
                    return@setOnClickListener
                }
                LocationTrackingService.setEnabled(this@MainActivity, turningOn)
                preciseBtn.text = if (turningOn)
                    "⏹ خاموش‌کردن ردیابی دقیق مسیر" else "▶️ روشن‌کردن ردیابی دقیق مسیر (باتری بیشتر)"
                refreshPermissionStatus()
            }
        }

        // «همیشه روشن» دو پیش‌نیاز دارد که اپ تا امروز هیچ‌کدام را نمی‌خواست:
        // (۱) اجازهٔ موقعیتِ پس‌زمینه — از اندروید ۱۰ باید **جدا** خواسته شود و
        //     از اندروید ۱۱ اصلاً دیالوگ ندارد و فقط از تنظیمات می‌شود.
        // (۲) معافیت از بهینه‌سازیِ باتری — وگرنه سازنده سرویس را می‌کشد.
        val alwaysBtn = Button(this).apply {
            text = "🔓 اجازهٔ «همیشه» + آزادسازی از بهینه‌سازی باتری"
            setOnClickListener {
                if (!LocationWorker.hasPermission(this@MainActivity)) {
                    requestSmsPermission()
                    return@setOnClickListener
                }
                if (!Perms.backgroundLocation(this@MainActivity)) {
                    if (android.os.Build.VERSION.SDK_INT in 29..29) {
                        ActivityCompat.requestPermissions(
                            this@MainActivity,
                            arrayOf(Manifest.permission.ACCESS_BACKGROUND_LOCATION), 2,
                        )
                    } else {
                        // اندروید ۱۱+: فقط از صفحهٔ تنظیماتِ خودِ اپ، گزینهٔ
                        // «Allow all the time».
                        status.text = "در صفحهٔ باز شده: مجوزها ← موقعیت مکانی ← «همیشه»"
                        startActivity(
                            Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                                .setData(android.net.Uri.parse("package:$packageName"))
                        )
                    }
                    return@setOnClickListener
                }
                if (!Perms.batteryUnrestricted(this@MainActivity)) {
                    try {
                        startActivity(
                            Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                                .setData(android.net.Uri.parse("package:$packageName"))
                        )
                    } catch (_: Exception) {
                        startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
                    }
                    return@setOnClickListener
                }
                status.text = "✅ همه‌چیز برای «همیشه روشن» آماده است."
                refreshPermissionStatus()
            }
        }

        val usageBtn = Button(this).apply {
            text = "دادن دسترسی آمار مصرف (Usage access)"
            setOnClickListener {
                startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
            }
        }
        val a11yBtn = Button(this).apply {
            text = "دادن دسترسی خواندن صفحه (Accessibility) — اختیاری"
            setOnClickListener {
                startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
            }
        }

        // وضعیتِ زندهٔ دسترسی‌ها — «چرا اعلان‌ها ثبت نمی‌شود؟» باید همین‌جا
        // با یک نگاه جواب بگیرد، نه با حدس. اندروید دسترسیِ اعلان‌ها را با
        // هر نصبِ مجددِ اپ خاموش می‌کند؛ این صفحه آن را لو می‌دهد.
        val permStatus = TextView(this).apply { setPadding(0, 24, 0, 8) }
        permStatusView = permStatus

        val testBtn = Button(this).apply {
            text = "ارسال رویدادِ تست (برای بررسی اتصال)"
            setOnClickListener {
                val json = JSONObject()
                    .put("app", "ir.lifemanager.companion")
                    .put("title", "تست اتصال")
                    .put("text", "این یک رویداد آزمایشی از اپ همراه است")
                    .put("device", Net.deviceName(this@MainActivity))
                    .toString()
                Net.enqueue(this@MainActivity, "/api/mobile/notification", json)
                sendHeartbeat()
                status.text = "رویداد تست فرستاده شد — در «لاگ فعالیت‌ها» یا /api/mobile/diagnostics ببین."
            }
        }

        listOf(title, urlInput, tokenInput, deviceInput, saveBtn, notifBtn, usageBtn, a11yBtn,
               preciseBtn, alwaysBtn, testBtn, permStatus, status)
            .forEach { root.addView(it) }
        setContentView(root)
        refreshPermissionStatus()
    }

    private var permStatusView: TextView? = null

    override fun onResume() {
        super.onResume()
        refreshPermissionStatus()   // برگشت از تنظیمات → وضعیت تازه
    }

    /** ✅/❌ برای هر دسترسی، تا خاموش‌بودنِ یکی پنهان نماند. */
    private fun refreshPermissionStatus() {
        val sms = Perms.sms(this)
        val calls = Perms.callLog(this)
        val notif = Perms.notifications(this)
        val usage = Perms.usage(this)
        val a11y = Perms.accessibility(this)
        val loc = Perms.location(this)
        fun mark(on: Boolean) = if (on) "✅" else "❌"
        permStatusView?.text = buildString {
            append("وضعیت دسترسی‌ها:\n")
            append("${mark(sms)} پیامک\n")
            append("${mark(calls)} تاریخچهٔ تماس\n")
            append("${mark(notif)} اعلان‌ها (Notification access)\n")
            append("${mark(usage)} آمار مصرف (Usage access)\n")
            append("${mark(a11y)} خواندن صفحه (Accessibility — اختیاری)\n")
            append("${mark(loc)} موقعیت مکانی\n")
            append("${mark(LocationTrackingService.isEnabled(this@MainActivity))} ردیابی دقیق مسیر\n")
            append("${mark(Perms.backgroundLocation(this@MainActivity))} موقعیت در پس‌زمینه («همیشه»)\n")
            append("${mark(Perms.batteryUnrestricted(this@MainActivity))} آزاد از بهینه‌سازی باتری\n")
            if (!notif) append("\n⚠️ اعلان‌ها خاموش است — دکمهٔ بالا را بزن و اپ را در فهرست فعال کن.")
            if (!loc) append("\n🛑 موقعیت مکانی ثبت نمی‌شود — اجازه را روی «همیشه» بگذار و GPS را روشن کن.")
            if (loc && !Perms.backgroundLocation(this@MainActivity))
                append("\n⚠️ اجازه فقط «موقع استفاده» است — با بسته‌شدنِ اپ، ثبت قطع می‌شود.")
            if (!Perms.batteryUnrestricted(this@MainActivity))
                append("\n⚠️ بهینه‌سازی باتری روشن است — گوشی ممکن است سرویس را بخوابانَد.")
        }
    }

    // خواندنِ وضعیتِ دسترسی‌ها در Perms.kt است — همان‌جایی که نبض هم از آن
    // می‌خواند، تا صفحهٔ اپ و گزارشِ سرور هرگز دو حرفِ متفاوت نزنند.

    private fun requestSmsPermission() {
        val need = mutableListOf<String>()
        if (checkSelfPermission(Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED)
            need.add(Manifest.permission.RECEIVE_SMS)
        if (checkSelfPermission(Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED)
            need.add(Manifest.permission.READ_CALL_LOG)
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED)
            need.add(Manifest.permission.ACCESS_FINE_LOCATION)
        if (android.os.Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED)
            need.add("android.permission.POST_NOTIFICATIONS")
        if (need.isNotEmpty()) ActivityCompat.requestPermissions(this, need.toTypedArray(), 1)
    }

    private fun sendHeartbeat() {
        val json = JSONObject()
            .put("device", Net.deviceName(this))
            .put("app_version", "1.0")
            // وضعیتِ دسترسی‌ها همراهِ نبض می‌رود تا سرور بتواند «مجرای خاموش»
            // را تشخیص بدهد، نه حدس بزند.
            .put("perms", Perms.asJson(this))
            .toString()
        Net.enqueue(this, "/api/mobile/heartbeat", json)
    }

    private fun schedulePeriodicWork() {
        val wm = WorkManager.getInstance(this)
        wm.enqueueUniquePeriodicWork(
            "heartbeat", ExistingPeriodicWorkPolicy.UPDATE,
            PeriodicWorkRequestBuilder<HeartbeatWorker>(30, TimeUnit.MINUTES).build(),
        )
        wm.enqueueUniquePeriodicWork(
            "usage", ExistingPeriodicWorkPolicy.UPDATE,
            PeriodicWorkRequestBuilder<UsageWorker>(12, TimeUnit.HOURS).build(),
        )
        wm.enqueueUniquePeriodicWork(
            "calllog", ExistingPeriodicWorkPolicy.UPDATE,
            PeriodicWorkRequestBuilder<CallLogWorker>(1, TimeUnit.HOURS).build(),
        )
        // ۱۵ دقیقه کمترین دورهٔ مجازِ WorkManager است. نقطه‌ها در بافرِ محلی
        // جمع می‌شوند، پس قطعیِ اینترنت چیزی را از بین نمی‌برد.
        wm.enqueueUniquePeriodicWork(
            "location", ExistingPeriodicWorkPolicy.UPDATE,
            PeriodicWorkRequestBuilder<LocationWorker>(15, TimeUnit.MINUTES).build(),
        )
    }
}

class HeartbeatWorker(ctx: Context, params: androidx.work.WorkerParameters) :
    androidx.work.CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val json = JSONObject()
            .put("device", Net.deviceName(applicationContext))
            .put("perms", Perms.asJson(applicationContext))
            .toString()
        Net.enqueue(applicationContext, "/api/mobile/heartbeat", json)
        return Result.success()
    }
}

/** گزارش روزانهٔ کارکرد اپ‌ها (پس از دادن Usage access). */
class UsageWorker(ctx: Context, params: androidx.work.WorkerParameters) :
    androidx.work.CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        try {
            val usm = applicationContext.getSystemService(Context.USAGE_STATS_SERVICE)
                as? UsageStatsManager ?: return Result.success()
            val end = System.currentTimeMillis()
            val start = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0)
            }.timeInMillis
            val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end)
                ?: return Result.success()
            val apps = JSONArray()
            stats.filter { it.totalTimeInForeground > 60_000 }
                .sortedByDescending { it.totalTimeInForeground }
                .take(20)
                .forEach {
                    apps.put(
                        JSONObject()
                            .put("app", it.packageName)
                            .put("minutes", it.totalTimeInForeground / 60_000)
                    )
                }
            // تعداد باز کردن قفل گوشی امروز (رویدادهای USER_INTERACTION/SCREEN).
            var unlocks = 0
            try {
                val events = usm.queryEvents(start, end)
                val e = android.app.usage.UsageEvents.Event()
                while (events.hasNextEvent()) {
                    events.getNextEvent(e)
                    if (e.eventType == android.app.usage.UsageEvents.Event.KEYGUARD_HIDDEN) unlocks++
                }
            } catch (_: Exception) {}

            val day = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(end)
            val json = JSONObject()
                .put("day", day)
                .put("apps", apps)
                .put("unlocks", unlocks)
                .put("device", Net.deviceName(applicationContext))
                .toString()
            Net.enqueue(applicationContext, "/api/mobile/usage", json)
        } catch (_: Exception) {
            // بدون Usage access فقط ساکت می‌مانیم
        }
        return Result.success()
    }
}
