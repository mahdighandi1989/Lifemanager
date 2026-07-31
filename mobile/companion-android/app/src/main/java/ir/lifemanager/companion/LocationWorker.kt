package ir.lifemanager.companion

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import org.json.JSONArray
import org.json.JSONObject

/**
 * ردیابیِ موقعیت — «کجا بودم، کِی، و با کدام گوشی».
 *
 * چرا Worker و نه سرویسِ همیشه‌روشن: اندروید مدرن سرویسِ پس‌زمینهٔ دائمی را
 * می‌کُشد. WorkManager دوره‌ای، به‌علاوهٔ بافرِ محلی، همان نتیجه را می‌دهد و
 * باتری را هم نمی‌سوزاند. هر اجرا:
 *   ۱) اگر موقعیت خاموش/بی‌اجازه است → **هشدارِ محلیِ روی خودِ گوشی** (چون
 *      ممکن است اینترنت هم نباشد و هشدارِ سرور اصلاً نرسد — خواستهٔ صریحِ مالک).
 *   ۲) آخرین موقعیتِ شناخته‌شده را می‌گیرد و در بافرِ محلی می‌نویسد.
 *   ۳) بافر را در یک بسته به سرور می‌فرستد؛ صفِ WorkManager خودش آفلاین را
 *      نگه می‌دارد و با برگشتنِ اینترنت سینک می‌کند — مثل بقیهٔ مجراها.
 *
 * نکته: نقطه‌ها **قبل از** ارسال در بافر می‌نشینند، پس قطعیِ طولانیِ اینترنت
 * هم داده را از بین نمی‌برد.
 */
class LocationWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {

    companion object {
        const val BUFFER_KEY = "location_buffer"
        const val LAST_WARN_KEY = "location_off_warned_at"
        const val CHANNEL_ID = "lifemanager_location"
        const val MAX_BUFFER = 2000
        // فاصلهٔ هشدارِ محلی، تا تبدیل به آزار نشود
        const val WARN_COOLDOWN_MS = 6L * 60 * 60 * 1000

        fun hasPermission(ctx: Context): Boolean =
            ctx.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) ==
                PackageManager.PERMISSION_GRANTED ||
                ctx.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) ==
                PackageManager.PERMISSION_GRANTED

        fun providerEnabled(ctx: Context): Boolean = try {
            val lm = ctx.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            lm.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
                lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
        } catch (_: Exception) { false }
    }

    /** هشدارِ محلی — روی خودِ گوشی، بدونِ نیاز به اینترنت. */
    private fun warnLocationOff(reason: String) {
        val prefs = Net.prefs(applicationContext)
        val now = System.currentTimeMillis()
        if (now - prefs.getLong(LAST_WARN_KEY, 0L) < WARN_COOLDOWN_MS) return
        try {
            val nm = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE)
                as NotificationManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                nm.createNotificationChannel(
                    NotificationChannel(CHANNEL_ID, "موقعیت مکانی",
                        NotificationManager.IMPORTANCE_HIGH)
                )
            }
            val open = Intent(applicationContext, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            val pending = android.app.PendingIntent.getActivity(
                applicationContext, 0, open,
                android.app.PendingIntent.FLAG_IMMUTABLE or
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT,
            )
            val note = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_map)
                .setContentTitle("🛑 موقعیت مکانی ثبت نمی‌شود")
                .setContentText(reason)
                .setStyle(NotificationCompat.BigTextStyle().bigText(
                    "$reason\n\nتا وقتی درست نشود، مسیرها و مکان‌هایت ثبت نمی‌شوند."
                ))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pending)
                .build()
            nm.notify(4711, note)
            prefs.edit().putLong(LAST_WARN_KEY, now).apply()
        } catch (_: Exception) {
            // هشدار هرگز نباید خودش اپ را بشکند
        }
    }

    private fun buffer(): JSONArray = try {
        JSONArray(Net.prefs(applicationContext).getString(BUFFER_KEY, "[]"))
    } catch (_: Exception) { JSONArray() }

    private fun saveBuffer(arr: JSONArray) {
        // سقف: قطعیِ خیلی طولانی نباید حافظه را بی‌نهایت بزرگ کند؛ قدیمی‌ترها
        // کنار می‌روند، نه تازه‌ها.
        val trimmed = if (arr.length() <= MAX_BUFFER) arr else JSONArray().also { out ->
            for (i in (arr.length() - MAX_BUFFER) until arr.length()) out.put(arr.get(i))
        }
        Net.prefs(applicationContext).edit()
            .putString(BUFFER_KEY, trimmed.toString()).apply()
    }

    @Suppress("MissingPermission")
    private fun readPoint(): JSONObject? {
        if (!hasPermission(applicationContext)) return null
        return try {
            val lm = applicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val best = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)
                .mapNotNull { p -> try { lm.getLastKnownLocation(p) } catch (_: Exception) { null } }
                .maxByOrNull { it.time }
                ?: return null
            JSONObject()
                .put("lat", best.latitude)
                .put("lon", best.longitude)
                .put("accuracy_m", best.accuracy.toDouble())
                .put("speed_kmh", (best.speed * 3.6).toDouble())
                .put("at", java.time.Instant.ofEpochMilli(best.time).toString())
        } catch (_: Exception) { null }
    }

    override suspend fun doWork(): Result {
        val enabled = providerEnabled(applicationContext)
        val granted = hasPermission(applicationContext)
        if (!granted) {
            warnLocationOff("اجازهٔ «موقعیت مکانی» به اپ همراه داده نشده.")
        } else if (!enabled) {
            warnLocationOff("سرویسِ موقعیتِ گوشی (GPS) خاموش است.")
        }

        val arr = buffer()
        readPoint()?.let { arr.put(it) }
        saveBuffer(arr)

        if (arr.length() == 0) {
            // حتی وقتی نقطه‌ای نیست، وضعیتِ خاموشی را به سرور خبر بده — همان
            // چیزی که تشخیصِ «مجرای خاموش» را از حدس به واقعیت تبدیل می‌کند.
            val json = JSONObject()
                .put("points", JSONArray())
                .put("device", Net.deviceName(applicationContext))
                .put("location_enabled", granted && enabled)
                .toString()
            Net.enqueue(applicationContext, "/api/mobile/location", json)
            return Result.success()
        }

        val json = JSONObject()
            .put("points", arr)
            .put("device", Net.deviceName(applicationContext))
            .put("location_enabled", granted && enabled)
            .toString()
        Net.enqueue(applicationContext, "/api/mobile/location", json)
        // بافر بعد از **صف‌شدن** پاک می‌شود؛ خودِ صف تحویل را تضمین می‌کند و
        // در قطعیِ اینترنت با backoff دوباره تلاش می‌کند.
        saveBuffer(JSONArray())
        return Result.success()
    }
}
