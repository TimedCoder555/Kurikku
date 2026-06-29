// AutoClickModule.kt
// React Native Native Module bridge.
// Exposes Android functionality to the TypeScript/React Native layer.
// All methods called from src/modules/AutoClickModule.ts land here.

package com.kurikku.bridge

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.kurikku.accessibility.KurikkuAccessibilityService
import com.kurikku.overlay.FloatingBubbleService

class AutoClickModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

    // Must match NATIVE_MODULE_NAME in src/constants/config.ts
    override fun getName(): String = "AutoClickModule"

    // ── Auto Clicker ──────────────────────────────────────────

    /**
     * Start clicking at (x, y) with the given interval in milliseconds.
     * Called from TypeScript startClicking() after converting CPS to ms.
     */
    @ReactMethod
    fun startClicking(x: Double, y: Double, intervalMs: Double) {
        val service = KurikkuAccessibilityService.instance
        if (service != null) {
            service.startClicking(
                x.toFloat(),
                y.toFloat(),
                intervalMs.toLong(),
            )
        }
    }

    /**
     * Stop clicking immediately.
     */
    @ReactMethod
    fun stopClicking() {
        KurikkuAccessibilityService.instance?.stopClicking()
    }

    // ── Accessibility Permission ───────────────────────────────

    /**
     * Returns true if the KurikkuAccessibilityService is enabled.
     * Checks Android's enabled accessibility services setting string.
     */
    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        try {
            val enabledServices = Settings.Secure.getString(
                reactContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
            ) ?: ""

            // Check if our service package/class appears in the enabled list
            val isEnabled = enabledServices.contains(
                "com.kurikku/.accessibility.KurikkuAccessibilityService",
            )

            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Opens the Android Accessibility Settings screen.
     * User must manually enable Kurikku in the list.
     */
    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
    }

    // ── Overlay Permission ────────────────────────────────────

    /**
     * Returns true if the SYSTEM_ALERT_WINDOW (overlay) permission
     * has been granted for this app.
     */
    @ReactMethod
    fun isOverlayPermissionGranted(promise: Promise) {
        val granted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(reactContext)
        } else {
            // Below Android 6.0 overlay is granted by default
            true
        }
        promise.resolve(granted)
    }

    /**
     * Opens the overlay permission settings screen for this app.
     * Deep links directly to Kurikku's permission page.
     */
    @ReactMethod
    fun openOverlaySettings() {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${reactContext.packageName}"),
        ).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
    }

    // ── Floating Bubble ───────────────────────────────────────

    /**
     * Start the FloatingBubbleService and show the bubble
     * at the given size in pixels.
     */
    @ReactMethod
    fun showFloatingBubble(sizePx: Double) {
        val intent = Intent(reactContext, FloatingBubbleService::class.java).apply {
            action = FloatingBubbleService.ACTION_SHOW
            putExtra(FloatingBubbleService.EXTRA_SIZE_PX, sizePx.toInt())
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    /**
     * Hide the floating bubble and stop the service.
     */
    @ReactMethod
    fun hideFloatingBubble() {
        val intent = Intent(reactContext, FloatingBubbleService::class.java).apply {
            action = FloatingBubbleService.ACTION_HIDE
        }
        reactContext.startService(intent)
    }

    /**
     * Update the bubble size while the service is already running.
     */
    @ReactMethod
    fun updateBubbleSize(sizePx: Double) {
        val intent = Intent(reactContext, FloatingBubbleService::class.java).apply {
            action = FloatingBubbleService.ACTION_RESIZE
            putExtra(FloatingBubbleService.EXTRA_SIZE_PX, sizePx.toInt())
        }
        reactContext.startService(intent)
    }
}