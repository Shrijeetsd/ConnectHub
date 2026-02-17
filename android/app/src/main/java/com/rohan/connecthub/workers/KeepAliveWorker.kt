package com.rohan.connecthub.workers

import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.work.ListenableWorker
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.rohan.connecthub.SyncService

class KeepAliveWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {

    // Result ऐवजी ListenableWorker.Result वापरल्यामुळे 'One type argument expected' एरर निघून जाईल
    override fun doWork(): ListenableWorker.Result {
        return try {
            val intent = Intent(applicationContext, SyncService::class.java)

            // सर्व्हिस बॅकग्राउंडमध्ये जिवंत ठेवण्यासाठी रीस्टार्ट लॉजिक
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                applicationContext.startForegroundService(intent)
            } else {
                applicationContext.startService(intent)
            }

            ListenableWorker.Result.success()
        } catch (e: Exception) {
            // काही अडचण आली तर पुन्हा प्रयत्न करण्यासाठी retry
            ListenableWorker.Result.retry()
        }
    }
}