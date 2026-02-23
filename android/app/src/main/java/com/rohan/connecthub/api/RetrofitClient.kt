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
    private var retrofit: Retrofit? = null
    private var okHttpClient: OkHttpClient? = null
    private var currentBaseUrl: String? = null

    private fun getBaseUrl(context: Context): String {
        return SharedPrefManager.getCustomUrl(context) ?: BuildConfig.BASE_URL
    }

    @Synchronized
    private fun getOkHttpClient(context: Context): OkHttpClient {
        if (okHttpClient != null) return okHttpClient!!

        val logging = HttpLoggingInterceptor {
            message -> Log.d("RetrofitClient", message)
        }.apply {
            level = HttpLoggingInterceptor.Level.NONE // Disabled for peak performance
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

        // Pre-create the authenticator's internal API client with a simple OkHttp instance
        val tempClient = OkHttpClient.Builder()
            .connectTimeout(5, TimeUnit.SECONDS)
            .build()
            
        val tempRetrofit = Retrofit.Builder()
            .baseUrl(getBaseUrl(context))
            .addConverterFactory(GsonConverterFactory.create())
            .client(tempClient)
            .build()
        val tempApi = tempRetrofit.create(ApiService::class.java)

        okHttpClient = OkHttpClient.Builder()
            .addInterceptor(logging)
            .addInterceptor(authInterceptor)
            .authenticator(TokenAuthenticator(context, tempApi))
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .connectionPool(okhttp3.ConnectionPool(5, 5, TimeUnit.MINUTES)) // Keep connections alive
            .build()
            
        return okHttpClient!!
    }

    @Synchronized
    fun getInstance(context: Context): ApiService {
        val baseUrl = getBaseUrl(context)
        
        // If URL changed or instances not created, reset everything
        if (retrofit == null || okHttpClient == null || baseUrl != currentBaseUrl) {
            retrofit = null
            okHttpClient = null
            currentBaseUrl = baseUrl
            
            val client = getOkHttpClient(context.applicationContext)
            retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .addConverterFactory(GsonConverterFactory.create())
                .client(client)
                .build()
        }
        
        return retrofit!!.create(ApiService::class.java)
    }
}
