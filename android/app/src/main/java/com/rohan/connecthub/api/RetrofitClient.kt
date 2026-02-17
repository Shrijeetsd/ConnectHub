package com.rohan.connecthub.api

import android.content.Context
import android.util.Log
import com.rohan.connecthub.utils.SharedPrefManager
import com.rohan.connecthub.BuildConfig
import okhttp3.CertificatePinner
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private fun getBaseUrl(context: Context): String {
        return SharedPrefManager.getCustomUrl(context) ?: BuildConfig.BASE_URL
    }
    // private const val HOSTNAME = "your-api-domain.com"

    private fun getOkHttpClient(context: Context): OkHttpClient {
        val logging = HttpLoggingInterceptor {
            message -> Log.d("RetrofitClient", message)
        }.apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val authInterceptor = Interceptor { chain ->
            val token = SharedPrefManager.getToken(context)
            val requestBuilder = chain.request().newBuilder()

            if (!token.isNullOrEmpty()) {
                requestBuilder.addHeader("Authorization", "Bearer $token")
            }
            requestBuilder.addHeader("Content-Type", "application/json")
            requestBuilder.addHeader("Accept", "application/json")
            chain.proceed(requestBuilder.build())
        }

        /*
        val certificatePinner = CertificatePinner.Builder()
            // Replace with your actual certificate SHA-256 hash
            .add(HOSTNAME, "sha256/your_certificate_hash_here")
            .build()
        */

        val api = Retrofit.Builder()
            .baseUrl(getBaseUrl(context))
            .addConverterFactory(GsonConverterFactory.create())
            .client(OkHttpClient.Builder().build()) // Dummy client for authenticator
            .build()
            .create(ApiService::class.java)

        return OkHttpClient.Builder()
            .addInterceptor(logging)
            .addInterceptor(authInterceptor)
            .authenticator(TokenAuthenticator(context, api))
            // .certificatePinner(certificatePinner)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    fun getInstance(context: Context): ApiService {
        return Retrofit.Builder()
            .baseUrl(getBaseUrl(context))
            .addConverterFactory(GsonConverterFactory.create())
            .client(getOkHttpClient(context.applicationContext))
            .build()
            .create(ApiService::class.java)
    }
}