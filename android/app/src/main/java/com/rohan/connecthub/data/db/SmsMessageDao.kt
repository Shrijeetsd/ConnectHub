package com.rohan.connecthub.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface SmsMessageDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSms(smsMessage: SmsMessage)

    @Query("SELECT * FROM sms_messages WHERE isSynced = 0 ORDER BY timestamp ASC")
    suspend fun getUnsyncedSms(): List<SmsMessage>

    @Query("UPDATE sms_messages SET isSynced = 1 WHERE id = :smsId")
    suspend fun markAsSynced(smsId: Long)
}
