# Connectivity & Authentication Test Plan

## Test Cases

### 1. Mobile App Login
- **Endpoint**: `https://connecthubapp.bond/api/login`
- **Verification**: 
  - Enter valid credentials.
  - App should receive a JWT token and transition to the WebView/Dashboard.
  - Check for 404 errors (should be resolved).
  - Ensure `Content-Type: application/json` is sent.

### 2. Device Heartbeat
- **Endpoint**: `https://connecthubapp.bond/api/device/update-status`
- **Verification**:
  - Login to the app.
  - Check "Devices" page on Admin Panel.
  - Device should show "Online" status within 1-2 minutes.
  - Verification of background service persistent connection.

### 3. SMS Synchronization
- **Endpoints**: `/api/sms/upload`, `/api/sms/sync-old`
- **Verification**:
  - Receive a test SMS on the device (or use "Sync All" from Admin Panel).
  - Messages should appear in the Admin Panel "Messages" or "Dashboard".
  - Verify HTTPS transport security.

### 4. Admin Panel Session
- **Endpoint**: `https://connecthubapp.bond/api/me`
- **Verification**:
  - Login to Admin Panel.
  - Refresh the page.
  - Session should persist (successful `/me` call).
  - Test 2FA setup/disable if applicable.

### 5. CORS & SSL Fallback
- **Verification**:
  - Ensure Android app can connect without SSL errors.
  - Verify that `usesCleartextTraffic` doesn't interfere with secure connections.
  - Check Nginx logs for any certificate errors.
