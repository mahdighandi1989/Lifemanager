package ir.lifemanager.companion

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * بافرِ مشترکِ نقاطِ موقعیت.
 *
 * چرا جدا و چرا قفل‌دار: از این به بعد **دو** نویسنده دارد — سرویسِ دقیق
 * (لحظه‌به‌لحظه) و کارگرِ دوره‌ای (پشتیبان). هر دو روی یک کلیدِ
 * SharedPreferences می‌نویسند و الگوی «بخوان-عوض‌کن-بنویس» بدونِ قفل یعنی
 * نقطه‌ها بی‌سروصدا گم می‌شوند. اینجا همه‌چیز پشتِ یک قفل است.
 *
 * بافر **قبل از** ارسال پر می‌شود، پس قطعیِ طولانیِ اینترنت هیچ نقطه‌ای را
 * از بین نمی‌برد؛ صفِ WorkManager بعداً تحویلش می‌دهد.
 */
object LocationBuffer {
    const val KEY = "location_buffer"
    const val MAX = 5000

    private val lock = Any()

    fun add(ctx: Context, point: JSONObject) {
        synchronized(lock) {
            val arr = read(ctx)
            arr.put(point)
            write(ctx, arr)
        }
    }

    /** بافر را برمی‌دارد و خالی می‌کند — یک عملِ اتمی، تا بینِ خواندن و
     * پاک‌کردن نقطه‌ای که تازه رسیده قربانی نشود. */
    fun drain(ctx: Context): JSONArray = synchronized(lock) {
        val arr = read(ctx)
        if (arr.length() > 0) write(ctx, JSONArray())
        arr
    }

    fun size(ctx: Context): Int = synchronized(lock) { read(ctx).length() }

    private fun read(ctx: Context): JSONArray = try {
        JSONArray(Net.prefs(ctx).getString(KEY, "[]"))
    } catch (_: Exception) { JSONArray() }

    private fun write(ctx: Context, arr: JSONArray) {
        // سقف: قطعیِ خیلی طولانی نباید حافظه را بی‌نهایت بزرگ کند. قدیمی‌ترها
        // کنار می‌روند، نه تازه‌ها — تازه‌ها همانی‌اند که هنوز فرستاده نشده‌اند.
        val trimmed = if (arr.length() <= MAX) arr else JSONArray().also { out ->
            for (i in (arr.length() - MAX) until arr.length()) out.put(arr.get(i))
        }
        Net.prefs(ctx).edit().putString(KEY, trimmed.toString()).apply()
    }
}
