package com.rohan.connecthub.models

import com.google.gson.annotations.SerializedName

data class SmsLogRequest(
    val device_id: String,
    val sender: String,
    @SerializedName("message_body")
    val messageBody: String,
    val iv: String,
    val timestamp: Long,
    val sim_info: String,
    val device_model: String,
    val android_version: String
)

data class ConfigResponse(
    val target_url: String
)

data class LoginRequest(
    val username: String,
    val password: String
)

data class LoginResponse(
    @SerializedName("token")
    val accessToken: String,
    val refreshToken: String,
    val _id: String,
    val username: String
)
