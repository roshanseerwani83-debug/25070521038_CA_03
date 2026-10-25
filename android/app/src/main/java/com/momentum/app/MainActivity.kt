package com.momentum.app

import android.app.Activity
import android.os.Bundle
import android.os.CountDownTimer
import android.graphics.Color
import android.view.Gravity
import android.widget.*

class MainActivity : Activity() {
    private val green = Color.rgb(31, 39, 22)
    private val lime = Color.rgb(228, 243, 184)
    private val bg = Color.rgb(244, 245, 236)
    private var timer: CountDownTimer? = null
    private var seconds = 0L
    private lateinit var timerText: TextView
    private lateinit var status: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = bg
        window.navigationBarColor = bg
        showOverview()
    }

    private fun showOverview() {
        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setBackgroundColor(bg); setPadding(24, 20, 24, 12) }
        val header = LinearLayout(this).apply { gravity = Gravity.CENTER_VERTICAL }
        val logo = TextView(this).apply { text = "✦"; textSize = 24f; setTextColor(Color.rgb(201,244,92)); gravity = Gravity.CENTER; setBackgroundColor(green) }
        header.addView(logo, LinearLayout.LayoutParams(52, 52))
        header.addView(TextView(this).apply { text = "momentum"; textSize = 22f; setTextColor(green); setPadding(14,0,0,0) }, LinearLayout.LayoutParams(0, 52, 1f))
        root.addView(header)
        root.addView(TextView(this).apply { text = "Good ${if (java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY) < 12) "morning" else "evening"}."; textSize = 28f; setTextColor(green); setPadding(0, 30, 0, 2) })
        root.addView(TextView(this).apply { text = "Scroll with intention"; textSize = 15f; setTextColor(Color.DKGRAY) })

        val card = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(22, 22, 22, 22); setBackgroundColor(Color.WHITE) }
        card.addView(TextView(this).apply { text = "Start a mindful session"; textSize = 20f; setTextColor(green) })
        status = TextView(this).apply { text = "Choose how long you want to spend scrolling."; textSize = 14f; setTextColor(Color.DKGRAY); setPadding(0, 12, 0, 10) }
        card.addView(status)
        timerText = TextView(this).apply { text = "15:00"; textSize = 42f; setTextColor(green); gravity = Gravity.CENTER; setPadding(0, 10, 0, 12) }
        card.addView(timerText)
        val start = Button(this).apply { text = "Start session"; setTextColor(green); setBackgroundColor(lime); setOnClickListener { startSession() } }
        card.addView(start)
        root.addView(card, LinearLayout.LayoutParams(-1, -2).apply { topMargin = 28 })

        val nav = LinearLayout(this).apply { gravity = Gravity.CENTER; setPadding(0, 20, 0, 0) }
        listOf("Today", "Sessions", "Insights").forEach { label -> nav.addView(Button(this).apply { text = label; setOnClickListener { Toast.makeText(this@MainActivity, "$label is available offline", Toast.LENGTH_SHORT).show() } }, LinearLayout.LayoutParams(0, 54, 1f)) }
        root.addView(nav)
        setContentView(root)
    }

    private fun startSession() {
        timer?.cancel(); seconds = 15 * 60
        timer = object : CountDownTimer(seconds * 1000, 1000) { override fun onTick(ms: Long) { seconds = ms / 1000; timerText.text = String.format("%02d:%02d", seconds / 60, seconds % 60); status.text = "Session active — stay with your intention." }; override fun onFinish() { timerText.text = "00:00"; status.text = "Time for a gentle pause."; Toast.makeText(this@MainActivity, "Session complete", Toast.LENGTH_LONG).show() } }.start()
    }
}
