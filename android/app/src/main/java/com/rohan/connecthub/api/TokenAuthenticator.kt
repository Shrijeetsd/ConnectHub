package com.rohan.connecthub.api

import android.content.Context
import com.rohan.connecthub.models.LoginResponse
import com.rohan.connecthub.utils.SharedPrefManager
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route

class TokenAuthenticator(private val context: Context, private val api: ApiService) : Authenticator {

    override fun authenticate(route: Route?, response: Response): Request? {
        val currentToken = SharedPrefManager.getToken(context)
        if (currentToken.isNullOrEmpty() || response.code != 401) {
            return null
        }

        synchronized(this) {
            val newTokenResponse = refreshToken()
            if (newTokenResponse == null || !newTokenResponse.isSuccessful) {
                return null
            }

            val loginResponse = newTokenResponse.body()
            val newAccessToken = loginResponse?.accessToken
            val newRefreshToken = loginResponse?.refreshToken
            
            if (newAccessToken != null && newRefreshToken != null) {
                SharedPrefManager.saveToken(context, newAccessToken, newRefreshToken)
                return response.request.newBuilder()
                    .header("Authorization", "Bearer $newAccessToken")
                    .build()
            }
        }
        return null
    }

    private fun refreshToken(): retrofit2.Response<LoginResponse>? {
        val refreshToken = SharedPrefManager.getRefreshToken(context)
        return try {
            api.refreshToken(refreshToken).execute()
        } catch (e: Exception) {
            null
        }
    }
}