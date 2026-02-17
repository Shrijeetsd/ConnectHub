package com.rohan.connecthub.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sms_messages")
data class SmsMessage(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val sender: String,
    val messageBody: ByteArray,
    val iv: ByteArray,
    val timestamp: Long,
    val simInfo: String,
    val deviceModel: String,
    val androidVersion: String,
    val isSynced: Boolean = false
)
