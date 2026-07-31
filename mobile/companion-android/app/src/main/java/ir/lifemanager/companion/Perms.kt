package ir.lifemanager.companion

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.provider.Settings
import org.json.JSONObject

/**
 * وضعیتِ زندهٔ دسترسی‌ها — یک جا، چون هم صفحهٔ اصلی نشانش می‌دهد و هم نبض
 * آن را برای سرور می‌فرستد.
 *
 * چرا برای سرور؟ (۲۰۲۶-۰۷-۳۱) بدون این، سرور فقط «داده‌ای نیامده» را می‌بیند
 * و نمی‌تواند بین «اتفاقی نیفتاده» و «دسترسی باطل شده» فرق بگذارد — همان
 * ابهامی که باعث شد اعلان‌ها ماه‌ها بی‌صدا از دست بروند. با این گزارش،
 * تشخیص دیگر حدس نیست: خودِ گوشی می‌گوید کدام مجرا خاموش است.
 *
 * نکته: «Notification access» و «Accessibility» مجوزِ عادی نیستند و با
 * checkSelfPermission خوانده نمی‌شوند — باید از Settings.Secure پرسید،
 * وگرنه اپ فکر می‌کند وصل است در حالی که سرویسش مرده.
 */
object Perms {

    fun sms(ctx: Context): Boolean =
        ctx.checkSelfPermission(Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED

    fun callLog(ctx: Context): Boolean =
        ctx.checkSelfPermission(Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED

    fun notifications(ctx: Context): Boolean = try {
        Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners")
            ?.contains(ctx.packageName) == true
    } catch (_: Exception) { false }

    fun usage(ctx: Context): Boolean = try {
        val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE)
            as? android.app.usage.UsageStatsManager
        val end = System.currentTimeMillis()
        !(usm?.queryUsageStats(
            android.app.usage.UsageStatsManager.INTERVAL_DAILY, end - 3600_000, end
        ).isNullOrEmpty())
    } catch (_: Exception) { false }

    fun accessibility(ctx: Context): Boolean = try {
        Settings.Secure.getString(ctx.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)
            ?.contains(ctx.packageName) == true
    } catch (_: Exception) { false }

    /** همان کلیدهایی که سرور در /api/mobile/diagnostics انتظار دارد. */
    fun asJson(ctx: Context): JSONObject = JSONObject()
        .put("sms", sms(ctx))
        .put("call_log", callLog(ctx))
        .put("notification", notifications(ctx))
        .put("usage", usage(ctx))
        .put("accessibility", accessibility(ctx))
}
