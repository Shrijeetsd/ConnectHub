package com.rohan.connecthub.api

import com.rohan.connecthub.models.ConfigResponse
import com.rohan.connecthub.models.LoginRequest
import com.rohan.connecthub.models.LoginResponse
import com.rohan.connecthub.models.SmsLogRequest
import retrofit2.Call
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface ApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/refresh")
    fun refreshToken(@Header("Authorization") refreshToken: String?): Call<LoginResponse>

    @POST("auth/refresh")
    suspend fun refreshTokenAsync(@Header("Authorization") refreshToken: String?): Response<LoginResponse>

    @POST("sms/upload")
    suspend fun syncSms(@Body request: SmsLogRequest): Response<Unit>

    @GET("device/config")
    suspend fun getConfig(): Response<ConfigResponse>

    @retrofit2.http.PUT("device/heartbeat/{id}")
    suspend fun sendHeartbeat(@retrofit2.http.Path("id") deviceId: String): Response<Unit>
}