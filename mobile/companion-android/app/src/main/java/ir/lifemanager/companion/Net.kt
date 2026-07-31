package ir.lifemanager.companion

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

/**
 * ارسال مطمئن به سرور: هر رویداد یک WorkManager job می‌شود — آفلاین بمانَد،
 * صف می‌ماند و با برگشتن اینترنت با backoff دوباره تلاش می‌کند. توکن دستگاه
 * در هدر X-Device-Token می‌رود (همان که /api/mobile/token داد).
 */
object Net {
    private const val PREFS = "companion"

    fun prefs(ctx: Context) = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun baseUrl(ctx: Context): String? = prefs(ctx).getString("base_url", null)?.trimEnd('/')
    fun token(ctx: Context): String? = prefs(ctx).getString("token", null)
    fun deviceName(ctx: Context): String =
        prefs(ctx).getString("device", null) ?: (android.os.Build.MODEL ?: "phone")

    fun configured(ctx: Context) = !baseUrl(ctx).isNullOrBlank() && !token(ctx).isNullOrBlank()

    /** رویداد را در صف ارسال بگذار (path مثل "/api/mobile/sms"). */
    fun enqueue(ctx: Context, path: String, json: String) {
        if (!configured(ctx)) return
        val work = OneTimeWorkRequestBuilder<PostWorker>()
            .setInputData(
                Data.Builder().putString("path", path).putString("json", json).build()
            )
            .setConstraints(
                Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
            )
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build()
        WorkManager.getInstance(ctx).enqueue(work)
    }
}

class PostWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    companion object { const val MAX_ATTEMPTS = 12 }

    override suspend fun doWork(): Result {
        val path = inputData.getString("path") ?: return Result.failure()
        val json = inputData.getString("json") ?: return Result.failure()
        val base = Net.baseUrl(applicationContext) ?: return Result.failure()
        val token = Net.token(applicationContext) ?: return Result.failure()
        return try {
            val client = OkHttpClient.Builder()
                .callTimeout(30, TimeUnit.SECONDS)
                .build()
            val request = Request.Builder()
                .url(base + path)
                .header("X-Device-Token", token)
                .post(json.toRequestBody("application/json; charset=utf-8".toMediaType()))
                .build()
            client.newCall(request).execute().use { resp ->
                when {
                    resp.isSuccessful -> Result.success()
                    // ۴xx یعنی «این محتوا هیچ‌وقت پذیرفته نمی‌شود» — تلاشِ
                    // دوباره فقط باتری می‌سوزاند. WorkManager سقفِ تلاش ندارد،
                    // پس بدون این، یک پیلودِ نامعتبر تا ابد retry می‌شد.
                    resp.code in 400..499 -> Result.failure()
                    // خطای سرور/شبکه: تلاش دوباره، ولی نه بی‌نهایت.
                    runAttemptCount >= MAX_ATTEMPTS -> Result.failure()
                    else -> Result.retry()
                }
            }
        } catch (e: Exception) {
            if (runAttemptCount >= MAX_ATTEMPTS) Result.failure() else Result.retry()
        }
    }
}
