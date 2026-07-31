plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "ir.lifemanager.companion"
    compileSdk = 34
    defaultConfig {
        applicationId = "ir.lifemanager.companion"
        minSdk = 26
        targetSdk = 34
        // CI (github.run_number) شماره را بالا می‌برد تا هر build یک «به‌روزرسانی»
        // واقعی باشد؛ ساخت محلی 1 می‌ماند.
        versionCode = (System.getenv("APK_VERSION_CODE")?.toIntOrNull() ?: 1)
        versionName = System.getenv("APK_VERSION_NAME") ?: "1.0"
    }
    // امضای ثابت و همیشگی — بدون این، هر build کلید یک‌بارمصرف تازه می‌گرفت و
    // اندروید نصبِ به‌روزرسانی روی نسخهٔ قبلی را رد می‌کرد («App not installed»).
    // این keystore فقط برای sideload شخصی است، نه فروشگاه.
    signingConfigs {
        create("shared") {
            storeFile = rootProject.file("signing/companion.keystore")
            storePassword = "lifemanager"
            keyAlias = "companion"
            keyPassword = "lifemanager"
        }
    }
    buildTypes {
        debug { signingConfig = signingConfigs.getByName("shared") }
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("shared")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    // org.json عمداً وابستگی نیست — خودِ اندروید آن را دارد و افزودنش
    // کلاس تکراری می‌سازد.
}
