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

        listOf(title, urlInput, tokenInput, deviceInput, saveBtn, notifBtn, usageBtn, a11yBtn, status)
            .forEach { root.addView(it) }
        setContentView(root)
    }

    private fun requestSmsPermission() {
        val need = mutableListOf<String>()
        if (checkSelfPermission(Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED)
            need.add(Manifest.permission.RECEIVE_SMS)
        if (checkSelfPermission(Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED)
            need.add(Manifest.permission.READ_CALL_LOG)
        if (need.isNotEmpty()) ActivityCompat.requestPermissions(this, need.toTypedArray(), 1)
    }

    private fun sendHeartbeat() {
        val json = JSONObject()
            .put("device", Net.deviceName(this))
            .put("app_version", "1.0")
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
    }
}

class HeartbeatWorker(ctx: Context, params: androidx.work.WorkerParameters) :
    androidx.work.CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val json = JSONObject().put("device", Net.deviceName(applicationContext)).toString()
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
