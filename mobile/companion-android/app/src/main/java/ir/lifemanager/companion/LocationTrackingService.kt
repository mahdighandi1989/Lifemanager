package ir.lifemanager.companion

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import org.json.JSONObject

/**
 * ردیابیِ **دقیقِ** موقعیت — مسیرِ واقعی، نه فقط «هر ۱۵ دقیقه یک نقطه».
 *
 * چرا سرویسِ پیش‌زمینه: اندروید کارِ دوره‌ای را کمتر از ۱۵ دقیقه اجرا نمی‌کند،
 * پس با WorkManager مسیرِ خیابان‌به‌خیابان درنمی‌آید. تنها راهِ مجاز و پایدار،
 * یک Foreground Service با اعلانِ دائمی است. اعلان اجباریِ اندروید است و
 * صادقانه هم هست: مالک همیشه می‌بیند که ردیابی روشن است و با یک ضربه
 * می‌تواند خاموشش کند.
 *
 * قیدها:
 *  * اختیاری است و پیش‌فرض **خاموش** — چون باتری می‌برد. مالک خودش روشنش می‌کند.
 *  * نقطه‌ها در `LocationBuffer` می‌نشینند (همان بافرِ کارگرِ دوره‌ای)، پس
 *    آفلاین‌بودن چیزی را از بین نمی‌برد و ارسال از همان مسیرِ صفِ مطمئن است.
 *  * فیلترِ حرکت: نقطهٔ تکراری در جای ثابت ذخیره نمی‌شود، وگرنه یک شبِ خواب
 *    هزاران نقطهٔ بی‌فایده می‌سازد.
 */
class LocationTrackingService : Service(), LocationListener {

    companion object {
        const val CHANNEL_ID = "lifemanager_tracking"
        const val NOTIF_ID = 4712
        const val PREF_ENABLED = "precise_tracking"
        const val ACTION_STOP = "ir.lifemanager.companion.STOP_TRACKING"

        // هر چند ثانیه/متر یک نقطه — تعادلِ دقت و باتری.
        const val MIN_TIME_MS = 15_000L
        const val MIN_DISTANCE_M = 20f
        // زیرِ این فاصله «حرکت» حساب نمی‌شود (لرزشِ GPS در جای ثابت).
        const val NOISE_M = 12f
        // هر چند نقطه یک بار به صفِ ارسال بدهد
        const val FLUSH_EVERY = 12

        const val PREF_ALIVE_AT = "precise_tracking_alive_at"
        // اگر سرویس بیشتر از این مدت نبضی نزده باشد، «روشن» حسابش نمی‌کنیم.
        // سرویس هر بار که نقطه‌ای نگه می‌دارد (حداکثر هر ۱۵ ثانیه) مهر می‌زند،
        // پس ۶ دقیقه سخاوتمندانه است.
        const val ALIVE_WINDOW_MS = 6 * 60 * 1000L

        fun isEnabled(ctx: Context): Boolean =
            Net.prefs(ctx).getBoolean(PREF_ENABLED, false)

        /**
         * آیا سرویس **واقعاً** دارد کار می‌کند؟
         *
         * چرا جدا از [isEnabled]: آن یکی فقط یک ترجیح است. سرویس می‌تواند
         * خودش را متوقف کند (اجازهٔ «تقریبی» به‌جای «دقیق»، نبودِ اجازه،
         * کشته‌شدن توسط سازنده) در حالی که ترجیح روی true مانده. کارگرِ
         * دوره‌ای با دیدنِ همان ترجیح از نمونه‌برداری صرف‌نظر می‌کرد، پس
         * **هیچ‌کدام** از دو مجرا چیزی ثبت نمی‌کرد و رابط همچنان «روشن»
         * نشان می‌داد. (ممیزیِ ۲۰۲۶-۰۸-۰۱)
         */
        fun isAlive(ctx: Context): Boolean {
            if (!isEnabled(ctx)) return false
            val at = Net.prefs(ctx).getLong(PREF_ALIVE_AT, 0L)
            return at > 0L && (System.currentTimeMillis() - at) < ALIVE_WINDOW_MS
        }

        fun markAlive(ctx: Context) {
            Net.prefs(ctx).edit().putLong(PREF_ALIVE_AT, System.currentTimeMillis()).apply()
        }

        fun setEnabled(ctx: Context, on: Boolean) {
            Net.prefs(ctx).edit().putBoolean(PREF_ENABLED, on).apply()
            val intent = Intent(ctx, LocationTrackingService::class.java)
            if (on) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    ctx.startForegroundService(intent)
                } else {
                    ctx.startService(intent)
                }
            } else {
                ctx.stopService(intent)
            }
        }

        /** روشن‌کردنِ دوباره بعد از ریبوت/به‌روزرسانی، اگر مالک روشنش کرده بود. */
        fun startIfEnabled(ctx: Context) {
            if (isEnabled(ctx) && LocationWorker.hasPermission(ctx)) setEnabled(ctx, true)
        }
    }

    private var lastKept: Location? = null
    private var kept = 0

    override fun onBind(intent: Intent?): IBinder? = null

    private fun notification(): Notification {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(
                NotificationChannel(
                    CHANNEL_ID, "ردیابی مسیر",
                    // پایین، تا اعلانِ دائمی صدا و مزاحمت نداشته باشد
                    NotificationManager.IMPORTANCE_LOW,
                )
            )
        }
        val open = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val stop = PendingIntent.getService(
            this, 1,
            Intent(this, LocationTrackingService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentTitle("📍 ردیابی مسیر روشن است")
            .setContentText(
                if (kept == 0) "منتظر اولین موقعیت…"
                else "$kept نقطه ثبت شد · ${LocationBuffer.size(this)} در صف"
            )
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(open)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "خاموش کن", stop)
            .build()
    }

    private fun refreshNotification() {
        try {
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .notify(NOTIF_ID, notification())
        } catch (_: Exception) {
        }
    }

    @Suppress("MissingPermission")
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            Net.prefs(this).edit().putBoolean(PREF_ENABLED, false).apply()
            flush()
            stopSelf()
            return START_NOT_STICKY
        }

        try {
            startForeground(NOTIF_ID, notification())
        } catch (_: Exception) {
            stopSelf()
            return START_NOT_STICKY
        }

        val granted = checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) ==
            PackageManager.PERMISSION_GRANTED
        if (!granted) {
            // بدونِ اجازه، سرویسِ روشنِ بی‌فایده فقط باتری می‌سوزاند. ترجیح هم
            // پاک می‌شود تا کارگرِ دوره‌ای دوباره مسئولیت را بردارد؛ وگرنه هر
            // دو مجرا ساکت می‌ماندند.
            Net.prefs(this).edit().putBoolean(PREF_ENABLED, false).apply()
            stopSelf()
            return START_NOT_STICKY
        }
        try {
            val lm = getSystemService(Context.LOCATION_SERVICE) as LocationManager
            for (provider in listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)) {
                if (lm.isProviderEnabled(provider)) {
                    lm.requestLocationUpdates(provider, MIN_TIME_MS, MIN_DISTANCE_M, this)
                }
            }
        } catch (_: Exception) {
            Net.prefs(this).edit().putBoolean(PREF_ENABLED, false).apply()
            stopSelf()
            return START_NOT_STICKY
        }
        markAlive(this)
        // START_STICKY: اگر اندروید سرویس را کشت، خودش برش می‌گرداند.
        return START_STICKY
    }

    override fun onLocationChanged(location: Location) {
        val previous = lastKept
        if (previous != null && previous.distanceTo(location) < NOISE_M) {
            // در جای ثابت نشسته‌ایم — لرزشِ GPS نقطه نیست.
            return
        }
        lastKept = location
        kept += 1
        // نبضِ زنده‌بودن — پایهٔ isAlive().
        markAlive(this)
        try {
            LocationBuffer.add(
                this,
                JSONObject()
                    .put("lat", location.latitude)
                    .put("lon", location.longitude)
                    .put("accuracy_m", location.accuracy.toDouble())
                    .put("speed_kmh", (location.speed * 3.6).toDouble())
                    .put("at", java.time.Instant.ofEpochMilli(location.time).toString()),
            )
        } catch (_: Exception) {
        }
        if (kept % FLUSH_EVERY == 0) flush()
        refreshNotification()
    }

    /** بافر را به صفِ ارسال بده. صف خودش آفلاین را نگه می‌دارد. */
    private fun flush() {
        try {
            val arr = LocationBuffer.drain(this)
            if (arr.length() == 0) return
            val json = JSONObject()
                .put("points", arr)
                .put("device", Net.deviceName(this))
                .put("location_enabled", true)
                .put("precise", true)
                .toString()
            Net.enqueue(this, "/api/mobile/location", json)
        } catch (_: Exception) {
        }
    }

    override fun onDestroy() {
        try {
            (getSystemService(Context.LOCATION_SERVICE) as LocationManager)
                .removeUpdates(this)
        } catch (_: Exception) {
        }
        // آخرین نقطه‌ها نباید با بسته‌شدنِ سرویس گم شوند.
        flush()
        super.onDestroy()
    }

    // امضاهای قدیمیِ LocationListener (روی API پایین لازم‌اند)
    override fun onProviderEnabled(provider: String) {}
    override fun onProviderDisabled(provider: String) {}

    @Deprecated("Deprecated in Java")
    override fun onStatusChanged(provider: String?, status: Int, extras: android.os.Bundle?) {}
}
