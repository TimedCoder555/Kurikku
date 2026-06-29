// KurikkuAccessibilityService.kt
// Core Android Accessibility Service for Kurikku.
// Performs simulated screen tap gestures at a given coordinate.
// This is the only way to click on screen without root access.

package com.kurikku.accessibility

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent

class KurikkuAccessibilityService : AccessibilityService() {

    companion object {
        // Static reference so AutoClickModule can call into this service
        // Set when service connects, cleared when it disconnects
        var instance: KurikkuAccessibilityService? = null
            private set
    }

    // Handler runs on the main thread — required for dispatchGesture
    private val mainHandler = Handler(Looper.getMainLooper())

    // Tracks whether the auto clicker loop is currently active
    private var isClicking = false

    // Current click target coordinates
    private var clickX = 0f
    private var clickY = 0f

    // Interval between clicks in milliseconds
    private var intervalMs = 200L

    // ── Lifecycle ─────────────────────────────────────────────

    override fun onServiceConnected() {
        super.onServiceConnected()
        // Register this instance so AutoClickModule can reach it
        instance = this
    }

    override fun onUnbind(intent: android.content.Intent?): Boolean {
        // Clear instance when service is disabled by the user
        instance = null
        stopClicking()
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        stopClicking()
    }

    // Required override — we do not process accessibility events
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}

    // Required override — we do not handle interruptions
    override fun onInterrupt() {
        stopClicking()
    }

    // ── Public API (called from AutoClickModule) ───────────────

    /**
     * Begin the auto click loop.
     * Clicks at (x, y) every [intervalMs] milliseconds.
     */
    fun startClicking(x: Float, y: Float, intervalMs: Long) {
        // Prevent starting a second loop if already running
        if (isClicking) return

        this.clickX = x
        this.clickY = y
        this.intervalMs = intervalMs
        this.isClicking = true

        // Kick off the first click — subsequent clicks are scheduled
        // recursively inside performClick()
        mainHandler.post(clickRunnable)
    }

    /**
     * Stop the auto click loop immediately.
     */
    fun stopClicking() {
        isClicking = false
        mainHandler.removeCallbacks(clickRunnable)
    }

    // ── Click Loop ────────────────────────────────────────────

    // Runnable that performs one tap then schedules the next
    private val clickRunnable = object : Runnable {
        override fun run() {
            if (!isClicking) return

            // Perform a single tap gesture at the target position
            performTap(clickX, clickY)

            // Schedule the next click after the interval
            mainHandler.postDelayed(this, intervalMs)
        }
    }

    // ── Gesture Dispatch ──────────────────────────────────────

    /**
     * Dispatches a single tap gesture at (x, y).
     * Uses GestureDescription — available from Android API 24+.
     * Duration 1ms simulates an instant tap.
     */
    private fun performTap(x: Float, y: Float) {
        // Build a single-point path at the target coordinate
        val tapPath = Path().apply {
            moveTo(x, y)
        }

        // A stroke of 1ms duration = an instant tap
        val stroke = GestureDescription.StrokeDescription(
            tapPath,
            /* startTime= */ 0L,
            /* duration= */ 1L,
        )

        val gesture = GestureDescription.Builder()
            .addStroke(stroke)
            .build()

        // Dispatch the gesture — result is ignored since we loop
        dispatchGesture(
            gesture,
            object : GestureResultCallback() {
                override fun onCompleted(gestureDescription: GestureDescription?) {
                    // Gesture completed successfully — no action needed
                }
                override fun onCancelled(gestureDescription: GestureDescription?) {
                    // Gesture was cancelled — stop to avoid runaway loop
                    stopClicking()
                }
            },
            null,
        )
    }
}