// FloatingBubbleService.kt
// Foreground service that draws a draggable floating bubble
// over all other apps using SYSTEM_ALERT_WINDOW permission.
// The bubble opens a small control panel when tapped.

package com.kurikku.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.SeekBar
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.kurikku.MainActivity
import com.kurikku.R
import com.kurikku.accessibility.KurikkuAccessibilityService

class FloatingBubbleService : Service() {

    companion object {
        // Intent actions sent from AutoClickModule
        const val ACTION_SHOW   = "com.kurikku.SHOW_BUBBLE"
        const val ACTION_HIDE   = "com.kurikku.HIDE_BUBBLE"
        const val ACTION_RESIZE = "com.kurikku.RESIZE_BUBBLE"

        // Intent extras
        const val EXTRA_SIZE_PX = "size_px"
        const val EXTRA_CPS     = "cps"

        // Notification channel ID
        private const val CHANNEL_ID = "kurikku_channel"
        private const val NOTIFICATION_ID = 1
    }

    // ── Window Manager ────────────────────────────────────────
    private lateinit var windowManager: WindowManager

    // ── Bubble views ──────────────────────────────────────────
    private var bubbleView: View? = null
    private var panelView: View? = null

    // Bubble layout params — controls position and size
    private lateinit var bubbleParams: WindowManager.LayoutParams

    // Current bubble size in pixels
    private var bubbleSizePx = 64

    // Current CPS value shown in the control panel
    private var currentCps = 5

    // Whether the auto clicker is currently running
    private var isRunning = false

    // ── Touch tracking for drag ────────────────────────────────
    private var initialTouchX = 0f
    private var initialTouchY = 0f
    private var initialX = 0
    private var initialY = 0

    // If finger moves less than this, treat as a tap not a drag
    private val TAP_THRESHOLD = 10f

    // ── Lifecycle ─────────────────────────────────────────────

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SHOW -> {
                bubbleSizePx = intent.getIntExtra(EXTRA_SIZE_PX, 64)
                currentCps   = intent.getIntExtra(EXTRA_CPS, 5)
                showBubble()
            }
            ACTION_HIDE -> {
                hideBubble()
                stopSelf()
            }
            ACTION_RESIZE -> {
                bubbleSizePx = intent.getIntExtra(EXTRA_SIZE_PX, 64)
                resizeBubble()
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        removeBubble()
        removePanel()
    }

    // Not a bound service
    override fun onBind(intent: Intent?): IBinder? = null

    // ── Bubble ────────────────────────────────────────────────

    /**
     * Inflates and adds the floating bubble to the window.
     */
    private fun showBubble() {
        if (bubbleView != null) return

        // Overlay type — works on all Android versions
        val overlayType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE

        bubbleParams = WindowManager.LayoutParams(
            bubbleSizePx,
            bubbleSizePx,
            overlayType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT,
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100
            y = 300
        }

        // Build bubble view programmatically — a simple colored circle
        bubbleView = buildBubbleView()

        windowManager.addView(bubbleView, bubbleParams)
        attachDragAndTap()
    }

    /**
     * Builds a simple circular bubble view.
     */
    private fun buildBubbleView(): View {
        val frame = FrameLayout(this)

        // Circular background drawable
        val circle = View(this).apply {
            background = createCircleDrawable()
            contentDescription = getString(R.string.bubble_content_description)
        }

        frame.addView(
            circle,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
            ),
        )

        return frame
    }

    /**
     * Creates a simple filled circle drawable in blue.
     */
    private fun createCircleDrawable(): android.graphics.drawable.GradientDrawable {
        return android.graphics.drawable.GradientDrawable().apply {
            shape = android.graphics.drawable.GradientDrawable.OVAL
            setColor(Color.parseColor("#2196F3"))
            setStroke(3, Color.parseColor("#90CAF9"))
        }
    }

    /**
     * Attaches touch listener to the bubble for drag + tap detection.
     */
    private fun attachDragAndTap() {
        bubbleView?.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    // Record starting finger and bubble positions
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    initialX = bubbleParams.x
                    initialY = bubbleParams.y
                    true
                }

                MotionEvent.ACTION_MOVE -> {
                    // Move bubble with finger
                    bubbleParams.x = initialX + (event.rawX - initialTouchX).toInt()
                    bubbleParams.y = initialY + (event.rawY - initialTouchY).toInt()
                    windowManager.updateViewLayout(bubbleView, bubbleParams)
                    true
                }

                MotionEvent.ACTION_UP -> {
                    val movedX = Math.abs(event.rawX - initialTouchX)
                    val movedY = Math.abs(event.rawY - initialTouchY)

                    // If finger barely moved, treat as tap — open control panel
                    if (movedX < TAP_THRESHOLD && movedY < TAP_THRESHOLD) {
                        togglePanel()
                    }
                    true
                }

                else -> false
            }
        }
    }

    /**
     * Updates bubble size without removing and re-adding the view.
     */
    private fun resizeBubble() {
        val view = bubbleView ?: return
        bubbleParams.width  = bubbleSizePx
        bubbleParams.height = bubbleSizePx
        windowManager.updateViewLayout(view, bubbleParams)
    }

    /**
     * Removes the bubble from the window.
     */
    private fun removeBubble() {
        bubbleView?.let {
            windowManager.removeView(it)
            bubbleView = null
        }
    }

    private fun hideBubble() {
        removePanel()
        removeBubble()
    }

    // ── Control Panel ─────────────────────────────────────────

    /**
     * Shows the panel if hidden, hides it if visible.
     */
    private fun togglePanel() {
        if (panelView != null) {
            removePanel()
        } else {
            showPanel()
        }
    }

    /**
     * Builds and displays the floating control panel above the bubble.
     */
    private fun showPanel() {
        if (panelView != null) return

        val overlayType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE

        val panelParams = WindowManager.LayoutParams(
            // Fixed panel width
            600,
            WindowManager.LayoutParams.WRAP_CONTENT,
            overlayType,
            // FOCUSABLE so SeekBar can receive touch events
            WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT,
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            // Position panel just above the bubble
            x = bubbleParams.x
            y = (bubbleParams.y - 280).coerceAtLeast(0)
        }

        panelView = buildPanelView()
        windowManager.addView(panelView, panelParams)
    }

    /**
     * Builds the control panel view programmatically.
     * Contains: Start, Stop, CPS SeekBar, current CPS label.
     */
    private fun buildPanelView(): View {
        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(24, 24, 24, 24)
            setBackgroundColor(Color.parseColor("#DD1E1E1E"))
            // Rounded corners via outline
            elevation = 8f
        }

        // ── CPS label ─────────────────────────────────────────
        val cpsLabel = TextView(this).apply {
            text = "CPS: $currentCps"
            setTextColor(Color.WHITE)
            textSize = 14f
        }
        panel.addView(cpsLabel)

        // ── CPS SeekBar ───────────────────────────────────────
        val seekBar = SeekBar(this).apply {
            max = 99           // 0–99 maps to CPS 1–100
            progress = currentCps - 1
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(sb: SeekBar?, progress: Int, fromUser: Boolean) {
                    currentCps = progress + 1
                    cpsLabel.text = "CPS: $currentCps"
                }
                override fun onStartTrackingTouch(sb: SeekBar?) {}
                override fun onStopTrackingTouch(sb: SeekBar?) {}
            })
        }
        panel.addView(seekBar, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
        ).apply { topMargin = 8 })

        // ── Button row ────────────────────────────────────────
        val buttonRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            weightSum = 2f
        }

        // Start button
        val startBtn = android.widget.Button(this).apply {
            text = "▶ Start"
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#2E7D32"))
            setOnClickListener {
                val service = KurikkuAccessibilityService.instance
                if (service != null) {
                    val intervalMs = (1000f / currentCps).toLong()
                    // Click at bubble center as default — user can reposition
                    service.startClicking(
                        bubbleParams.x.toFloat() + bubbleSizePx / 2,
                        bubbleParams.y.toFloat() + bubbleSizePx / 2,
                        intervalMs,
                    )
                    isRunning = true
                    removePanel()
                }
            }
        }

        // Stop button
        val stopBtn = android.widget.Button(this).apply {
            text = "⏹ Stop"
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#C62828"))
            setOnClickListener {
                KurikkuAccessibilityService.instance?.stopClicking()
                isRunning = false
                removePanel()
            }
        }

        val btnParams = LinearLayout.LayoutParams(
            0,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            1f,
        ).apply { setMargins(4, 12, 4, 0) }

        buttonRow.addView(startBtn, btnParams)
        buttonRow.addView(stopBtn, LinearLayout.LayoutParams(btnParams))
        panel.addView(buttonRow)

        // ── Close panel button ────────────────────────────────
        val closeBtn = TextView(this).apply {
            text = "✕ Close"
            setTextColor(Color.parseColor("#AAAAAA"))
            textSize = 12f
            gravity = Gravity.CENTER
            setPadding(0, 16, 0, 0)
            setOnClickListener { removePanel() }
        }
        panel.addView(closeBtn, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
        ))

        return panel
    }

    /**
     * Removes the control panel from the window.
     */
    private fun removePanel() {
        panelView?.let {
            windowManager.removeView(it)
            panelView = null
        }
    }

    // ── Notification ──────────────────────────────────────────

    /**
     * Creates the notification channel required on Android 8.0+.
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = getString(R.string.notification_channel_description)
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    /**
     * Builds the persistent foreground service notification.
     * Tapping it opens the main app.
     */
    private fun buildNotification(): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_IMMUTABLE,
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(getString(R.string.notification_text))
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setSilent(true)
            .build()
    }
}