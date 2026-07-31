package ir.lifemanager.companion

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONObject

/**
 * خوانندهٔ صفحه — با اجازهٔ صریح Accessibility (از تنظیمات گوشی) متنِ روی صفحهٔ
 * هر اپ را می‌گیرد و به /api/mobile/screen می‌فرستد. مالک این را با آگاهی از
 * محدودیت‌هایش انتخاب کرد.
 *
 * مسئولانه ساخته شده:
 *  • فقط روی تغییرِ پنجره/محتوا، و با throttle (حداقل ۴ ثانیه فاصله + رد متنِ
 *    تکراری) تا نه باتری بسوزد نه سرور غرق شود.
 *  • فیلدهای رمز (isPassword) هرگز خوانده نمی‌شوند؛ خودِ این اپ هم رد می‌شود.
 *  • سرور هم لایهٔ دوم پاک‌سازیِ OTP/رمز دارد.
 *  • فقط متن — نه ویدیو، نه صدا، نه عکس (اندروید اجازه نمی‌دهد).
 */
class ScreenReader : AccessibilityService() {

    private var lastSentAt = 0L
    private var lastText = ""

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        try {
            if (event == null) return
            val pkg = event.packageName?.toString() ?: return
            if (pkg == packageName) return
            val type = event.eventType
            if (type != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED &&
                type != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            ) return

            val now = System.currentTimeMillis()
            if (now - lastSentAt < 4000) return  // throttle

            val root = rootInActiveWindow ?: return
            val sb = StringBuilder()
            collect(root, sb, 0)
            val text = sb.toString().trim().take(1200)
            if (text.length < 3 || text == lastText) return

            lastText = text
            lastSentAt = now
            val json = JSONObject()
                .put("app", pkg)
                .put("text", text)
                .put("device", Net.deviceName(this))
                .toString()
            Net.enqueue(this, "/api/mobile/screen", json)
        } catch (_: Exception) {
            // یک رویدادِ عجیب نباید سرویس را بکشد
        }
    }

    private fun collect(node: AccessibilityNodeInfo?, sb: StringBuilder, depth: Int) {
        if (node == null || depth > 40 || sb.length > 1400) return
        // فیلد رمز را هرگز نخوان
        if (!node.isPassword) {
            val t = node.text?.toString()?.trim()
            if (!t.isNullOrEmpty() && t.length <= 200) {
                sb.append(t).append(" ")
            }
        }
        for (i in 0 until node.childCount) {
            collect(node.getChild(i), sb, depth + 1)
        }
    }

    override fun onInterrupt() {}
}
