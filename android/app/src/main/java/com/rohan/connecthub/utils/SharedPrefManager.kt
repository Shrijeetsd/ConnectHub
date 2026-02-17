package com.rohan.connecthub.utils

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

object SharedPrefManager {
    private const val PREF_NAME = "secret_shared_prefs"
    private const val KEY_TOKEN = "jwt_token"
    private const val KEY_REFRESH_TOKEN = "refresh_token"
    private const val KEY_DEVICE_ID = "device_id"

    private fun getPreferences(context: Context): SharedPreferences {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        return EncryptedSharedPreferences.create(
            context,
            PREF_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun saveToken(context: Context, token: String, refreshToken: String) {
        getPreferences(context).edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .apply()
    }

    fun getToken(context: Context): String? {
        return getPreferences(context).getString(KEY_TOKEN, null)
    }

    fun getRefreshToken(context: Context): String? {
        return getPreferences(context).getString(KEY_REFRESH_TOKEN, null)
    }

    fun saveDeviceId(context: Context, deviceId: String) {
        getPreferences(context).edit().putString(KEY_DEVICE_ID, deviceId).apply()
    }

    fun getDeviceId(context: Context): String? {
        return getPreferences(context).getString(KEY_DEVICE_ID, null)
    }

    fun clear(context: Context) {
        getPreferences(context).edit().clear().apply()
    }

    private const val KEY_CUSTOM_URL = "custom_url"

    fun saveCustomUrl(context: Context, url: String) {
        getPreferences(context).edit().putString(KEY_CUSTOM_URL, url).apply()
    }

    fun getCustomUrl(context: Context): String? {
        return getPreferences(context).getString(KEY_CUSTOM_URL, null)
    }
}