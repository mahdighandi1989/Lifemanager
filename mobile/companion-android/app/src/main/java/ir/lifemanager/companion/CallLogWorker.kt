package ir.lifemanager.companion

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.provider.CallLog
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import org.json.JSONObject

/**
 * دفترچهٔ تماس — تماس‌های تازه از زمانِ آخرین اجرا را می‌خواند و به
 * /api/mobile/call می‌فرستد (شماره/نوع/مدت/زمان — نه صدا؛ اندروید ضبط صدا را
 * بسته). سرور با هشِ (شماره+زمان) ضدتکرار است، پس همپوشانی مشکلی ندارد.
 */
class CallLogWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        if (ContextCompat.checkSelfPermission(applicationContext, Manifest.permission.READ_CALL_LOG)
            != PackageManager.PERMISSION_GRANTED
        ) return Result.success()

        val prefs = Net.prefs(applicationContext)
        val since = prefs.getLong("call_log_since", 0L)
        var newest = since
        var queued = 0
        try {
            val cursor = applicationContext.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                arrayOf(
                    CallLog.Calls.NUMBER, CallLog.Calls.CACHED_NAME,
                    CallLog.Calls.TYPE, CallLog.Calls.DURATION, CallLog.Calls.DATE,
                ),
                "${CallLog.Calls.DATE} > ?", arrayOf(since.toString()),
                "${CallLog.Calls.DATE} ASC",
            ) ?: return Result.success()
            cursor.use {
                val ni = it.getColumnIndex(CallLog.Calls.NUMBER)
                val nmi = it.getColumnIndex(CallLog.Calls.CACHED_NAME)
                val ti = it.getColumnIndex(CallLog.Calls.TYPE)
                val di = it.getColumnIndex(CallLog.Calls.DURATION)
                val dt = it.getColumnIndex(CallLog.Calls.DATE)
                while (it.moveToNext()) {
                    val date = it.getLong(dt)
                    if (date > newest) newest = date
                    val type = when (it.getInt(ti)) {
                        CallLog.Calls.INCOMING_TYPE -> "incoming"
                        CallLog.Calls.OUTGOING_TYPE -> "outgoing"
                        CallLog.Calls.MISSED_TYPE -> "missed"
                        CallLog.Calls.REJECTED_TYPE -> "rejected"
                        else -> "unknown"
                    }
                    val json = JSONObject()
                        .put("number", it.getString(ni) ?: "")
                        .put("name", it.getString(nmi) ?: JSONObject.NULL)
                        .put("call_type", type)
                        .put("duration_sec", it.getInt(di))
                        .put("at", java.time.Instant.ofEpochMilli(date).toString())
                        .put("device", Net.deviceName(applicationContext))
                        .toString()
                    Net.enqueue(applicationContext, "/api/mobile/call", json)
                    queued++
                }
            }
            // نشانهٔ پیشرفت فقط وقتی جلو می‌رود که دستِ‌کم چیزی در صف رفته
            // باشد. نسخهٔ اول بی‌قید جلو می‌برد، پس تماس‌هایی که هنگام
            // نامعتبربودنِ توکن رد شده بودند برای همیشه از دست می‌رفتند
            // (ممیزی ۲۰۲۶-۰۷-۳۱).
            if (queued > 0 || newest <= since) {
                prefs.edit().putLong("call_log_since", newest).apply()
            }
        } catch (_: Exception) {
            // بدون دسترسی یا خطای خواندن — ساکت می‌مانیم
        }
        return Result.success()
    }
}
