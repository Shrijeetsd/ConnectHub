package com.rohan.connecthub.models

import com.google.gson.annotations.SerializedName

data class SmsLogRequest(
    val device_id: String? = null,
    val sender: String? = null,
    @SerializedName("message_body")
    val messageBody: String? = null,
    val iv: String? = null,
    val timestamp: Long? = null,
    val sim_info: String? = null,
    val device_model: String? = null,
    val android_version: String? = null,
    val msg_id: String? = null
)

data class ConfigResponse(
    val target_url: String? = null
)

data class LoginRequest(
    val username: String? = null,
    val password: String? = null
)


data class LoginResponse(
    @SerializedName("token")
    val accessToken: String? = null,
    @SerializedName("refreshToken")
    val refreshToken: String? = null,
    val mfaRequired: Boolean? = null,
    val userId: String? = null,
    val _id: String? = null,
    val username: String? = null
)


