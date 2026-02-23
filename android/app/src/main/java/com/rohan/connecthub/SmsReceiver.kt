package com.rohan.connecthub

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.provider.Telephony
import android.os.PowerManager
import android.util.Log


class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ConnectHub::SmsReceiverLock")
        wakeLock.acquire(10000) // Acquire for 10 seconds to allow service start

        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {

            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)

            // ✅ १. डिव्हाइसचा युनिक आयडी मिळवा (Android ID)
            val androidId = try {
                Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
            } catch (e: Exception) {
                null
            }

            // ✅ २. डिव्हाइसचं नाव मिळवा (उदा. Samsung M31)
            val deviceModel = Build.MANUFACTURER + " " + Build.MODEL

            for (message in messages) {
                val sender = message.displayOriginatingAddress
                val body = message.displayMessageBody
                val timestamp = message.timestampMillis
                val subId = intent.getIntExtra("subscription", -1)
                
                // ✅ Generate Unique Hash (Task 1)
                val msgId = "${sender}_${timestamp}_${body.hashCode()}"

                Log.d("SmsReceiver", "Device: $deviceModel | ID: $androidId | SMS: $body")

                // ✅ ३. SyncService ला हा सर्व डेटा पाठवा
                val serviceIntent = Intent(context, SyncService::class.java).apply {
                    putExtra("sender", sender)
                    putExtra("sms_body", body)
                    putExtra("timestamp", timestamp)
                    putExtra("sub_id", subId)
                    putExtra("device_id", androidId)
                    putExtra("device_model", deviceModel)
                    putExtra("msg_id", msgId) // 👈 Unique ID पाठवा
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }
}