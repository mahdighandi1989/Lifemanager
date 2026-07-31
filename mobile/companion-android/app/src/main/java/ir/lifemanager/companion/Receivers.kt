package ir.lifemanager.companion

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import org.json.JSONObject

/** بعد از خاموش/روشن شدن گوشی: تنظیمات (آدرس/توکن) در SharedPreferences
 * مانده‌اند و WorkManager هم کارهای دوره‌ای را خودش برمی‌گرداند — این گیرنده
 * فقط یک نبضِ فوری می‌فرستد تا سرور بداند گوشی برگشته است. */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        val json = JSONObject()
            .put("device", Net.deviceName(context))
            .put("app_version", "boot")
            .toString()
        Net.enqueue(context, "/api/mobile/heartbeat", json)
    }
}

/** هر SMS ورودی — پیامک بانک همان لحظه به موتور مالی برنامه می‌رسد. */
class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
        // یک SMS بلند چندبخشی است — بدنه‌ها را به هم بچسبان.
        val sender = messages.firstOrNull()?.displayOriginatingAddress ?: "unknown"
        val body = messages.joinToString("") { it.messageBody ?: "" }
        if (body.isBlank()) return
        // زمانِ واقعیِ رسیدنِ پیامک (نه لحظهٔ ثبت در سرور) — تا لاگ درست مرتب شود.
        val ts = messages.firstOrNull()?.timestampMillis ?: System.currentTimeMillis()
        val json = JSONObject()
            .put("sender", sender)
            .put("body", body)
            .put("received_at", java.time.Instant.ofEpochMilli(ts).toString())
            .put("device", Net.deviceName(context))
            .toString()
        Net.enqueue(context, "/api/mobile/sms", json)
    }
}

/**
 * هر اعلان گوشی (پس از دادن Notification access در تنظیمات). اعلان‌های خودِ
 * همین اپ و اعلان‌های سیستمیِ بی‌متن فرستاده نمی‌شوند.
 *
 * چرا این‌قدر فیلد؟ (اصلاحِ ۲۰۲۶-۰۷-۳۱) نسخهٔ اول فقط `android.title` و
 * `android.text` را می‌خواند و نتیجه‌اش این بود که خیلی از اعلان‌ها «بی‌فرستنده»
 * ثبت می‌شدند: پیام‌رسان‌ها نامِ مخاطب را در `android.messages` (سبکِ
 * MessagingStyle) یا `android.conversationTitle` می‌گذارند، برندها در
 * `android.subText`، و متنِ کامل در `android.bigText`/`android.textLines`
 * است نه در `android.text` (که اغلب «۳ پیام جدید» است). حالا همهٔ این‌ها
 * فرستاده می‌شود و سرور با ترتیبِ اولویت، فرستندهٔ واقعی را انتخاب می‌کند.
 */
class NotifListener : NotificationListenerService() {

    /** آخرین (بستهٔ نرم‌افزاری|عنوان|متن) → زمان. اعلان‌های «جاری» (پخش‌کنندهٔ
     * موسیقی، مسیریاب، دانلود) هر ثانیه دوباره پست می‌شوند؛ بدون این، لاگ از
     * تکرارِ یک اعلان پر می‌شود. چیزی حذف نمی‌شود — فقط تکرارِ عینی در ۶۰ ثانیه
     * یک‌بار شمرده می‌شود. */
    private val recent = LinkedHashMap<String, Long>()

    private fun isEcho(key: String): Boolean {
        val now = System.currentTimeMillis()
        val seen = recent[key]
        recent.entries.removeAll { now - it.value > 120_000 }
        if (recent.size > 200) recent.keys.firstOrNull()?.let { recent.remove(it) }
        if (seen != null && now - seen < 60_000) return true
        recent[key] = now
        return false
    }

    private fun cs(extras: android.os.Bundle, key: String): String =
        try { extras.getCharSequence(key)?.toString()?.trim() ?: "" } catch (_: Exception) { "" }

    private fun lines(extras: android.os.Bundle): List<String> = try {
        (extras.getCharSequenceArray("android.textLines") ?: emptyArray())
            .mapNotNull { it?.toString()?.trim() }.filter { it.isNotBlank() }
    } catch (_: Exception) { emptyList() }

    /** نامِ خواندنیِ اپ («تلگرام» را خودِ اندروید می‌داند؛ ما فقط می‌پرسیم). */
    private fun appLabel(pkg: String): String = try {
        val pm = packageManager
        pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
    } catch (_: Exception) { "" }

    /**
     * فرستنده و متنِ پیام‌رسان‌ها از `android.messages` (MessagingStyle):
     * هر عنصر یک Bundle با کلیدهای «sender»/«sender_person» و «text» است —
     * جایی که واتس‌اپ/تلگرام نامِ واقعیِ مخاطب را می‌گذارند.
     */
    private fun messagingStyle(extras: android.os.Bundle): Pair<String, String> {
        return try {
            val arr = extras.getParcelableArray("android.messages") ?: return "" to ""
            var sender = ""
            val texts = ArrayList<String>()
            for (p in arr) {
                val b = p as? android.os.Bundle ?: continue
                val s = b.getCharSequence("sender")?.toString()?.trim().orEmpty()
                    .ifBlank { personName(b) }
                if (s.isNotBlank()) sender = s
                val t = b.getCharSequence("text")?.toString()?.trim()
                if (!t.isNullOrBlank()) texts.add(if (s.isNotBlank()) "$s: $t" else t)
            }
            sender to texts.takeLast(6).joinToString("\n")
        } catch (_: Exception) { "" to "" }
    }

    /** «sender_person» فقط از اندروید ۹ (API 28) هست — روی گوشیِ قدیمی‌تر
     * نباید حتی نامِ کلاس بارگذاری شود، پس پشتِ گاردِ نسخه است. */
    private fun personName(b: android.os.Bundle): String =
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.P) ""
        else try {
            b.getParcelable<android.app.Person>("sender_person")?.name?.toString()?.trim().orEmpty()
        } catch (_: Throwable) { "" }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        try {
            if (sbn.packageName == packageName) return
            val n = sbn.notification
            val extras = n.extras
            val title = cs(extras, "android.title")
            val text = cs(extras, "android.text")
            val bigText = cs(extras, "android.bigText")
            val subText = cs(extras, "android.subText")
            val infoText = cs(extras, "android.infoText")
            val summary = cs(extras, "android.summaryText")
            val conversation = cs(extras, "android.conversationTitle")
            val ticker = try { n.tickerText?.toString()?.trim() ?: "" } catch (_: Exception) { "" }
            val (msgSender, msgText) = messagingStyle(extras)
            val textLines = lines(extras)

            // بدنه: کامل‌ترین چیزی که هست (نه «۳ پیام جدید»).
            val body = listOf(msgText, bigText, textLines.joinToString("\n"), text, ticker)
                .firstOrNull { it.isNotBlank() } ?: ""
            if (title.isBlank() && body.isBlank() && msgSender.isBlank() && subText.isBlank()) return
            if (isEcho("${sbn.packageName}|$title|$body")) return

            val json = JSONObject()
                .put("app", sbn.packageName)
                .put("app_label", appLabel(sbn.packageName))
                .put("title", title)
                .put("text", body)
                .put("sender_name", msgSender)
                .put("conversation", conversation)
                .put("sub_text", listOf(subText, summary, infoText).firstOrNull { it.isNotBlank() } ?: "")
                .put("lines", org.json.JSONArray(textLines.take(10)))
                .put("android_category", n.category ?: "")
                .put("channel", try { n.channelId ?: "" } catch (_: Exception) { "" })
                .put("ongoing", sbn.isOngoing)
                .put("posted_at", java.time.Instant.ofEpochMilli(sbn.postTime).toString())
                .put("device", Net.deviceName(this))
                .toString()
            Net.enqueue(this, "/api/mobile/notification", json)
        } catch (_: Exception) {
            // رصدگر هرگز نباید خودش خطا بسازد
        }
    }
}
