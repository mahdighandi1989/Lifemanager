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
        val json = JSONObject()
            .put("sender", sender)
            .put("body", body)
            .put("device", Net.deviceName(context))
            .toString()
        Net.enqueue(context, "/api/mobile/sms", json)
    }
}

/**
 * هر اعلان گوشی (پس از دادن Notification access در تنظیمات). اعلان‌های خودِ
 * همین اپ و اعلان‌های سیستمیِ بی‌متن فرستاده نمی‌شوند.
 */
class NotifListener : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        try {
            if (sbn.packageName == packageName) return
            val extras = sbn.notification.extras
            val title = extras.getCharSequence("android.title")?.toString() ?: ""
            val text = extras.getCharSequence("android.text")?.toString() ?: ""
            if (title.isBlank() && text.isBlank()) return
            val json = JSONObject()
                .put("app", sbn.packageName)
                .put("title", title)
                .put("text", text)
                .put("device", Net.deviceName(this))
                .toString()
            Net.enqueue(this, "/api/mobile/notification", json)
        } catch (_: Exception) {
            // رصدگر هرگز نباید خودش خطا بسازد
        }
    }
}
