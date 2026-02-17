package com.rohan.connecthub

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.provider.Telephony
import android.util.Log

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)

            // ✅ १. डिव्हाइसचा युनिक आयडी मिळवा (Android ID)
            val androidId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
            // ✅ २. डिव्हाइसचं नाव मिळवा (उदा. Samsung M31)
            val deviceModel = Build.MANUFACTURER + " " + Build.MODEL

            for (message in messages) {
                val sender = message.displayOriginatingAddress
                val body = message.displayMessageBody
                val timestamp = message.timestampMillis
                val subId = intent.getIntExtra("subscription", -1)

                Log.d("SmsReceiver", "Device: $deviceModel | ID: $androidId | SMS: $body")

                // ✅ ३. SyncService ला हा सर्व डेटा पाठवा
                val serviceIntent = Intent(context, SyncService::class.java).apply {
                    putExtra("sender", sender)
                    putExtra("sms_body", body)
                    putExtra("timestamp", timestamp)
                    putExtra("sub_id", subId)
                    putExtra("device_id", androidId)    // 👈 महत्त्वाचे
                    putExtra("device_model", deviceModel) // 👈 ओळखीसाठी
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