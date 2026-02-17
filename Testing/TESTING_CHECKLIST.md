# ConnectHub - Testing Checklist

**Purpose:** Comprehensive testing checklist for manual verification before production deployment  
**Target Audience:** QA Testers, Developers  
**Version:** 1.0.0

---

## 🧪 Testing Methodology

### Environment Required
- **Local Backend:** Running on port 5000
- **Local Admin Panel:** Running on port 5173
- **Android Device/Emulator:** App installed
- **MongoDB:** Running locally or cloud

### Testing Levels
1. **Unit Level:** Individual component functionality
2. **Integration Level:** Component interaction
3. **System Level:** End-to-end workflows
4. **Security Level:** Authentication and authorization

---

## 📝 Pre-Testing Setup

### Checklist
- [ ] Backend server running (`npm run dev`)
- [ ] Admin panel running (`npm run dev`)
- [ ] MongoDB running and accessible
- [ ] Admin user created (`node seed.js`)
- [ ] Android app installed on device/emulator
- [ ] Test data prepared (sample SMS, users)

---

## 🔧 Backend API Testing

### 1. Server Startup
- [ ] Server starts without errors
- [ ] Port 5000 is listening
- [ ] MongoDB connection successful
- [ ] Console shows "Server running on port 5000"
- [ ] No error logs on startup

### 2. Authentication Endpoints

#### POST /api/auth/login
- [ ] **Valid credentials:** Returns JWT token
  - Request: `{ username: "admin", password: "admin123" }`
  - Expected: `{ token: "jwt...", username: "admin" }`
  - Status: 200

- [ ] **Invalid credentials:** Rejects login
  - Request: `{ username: "admin", password: "wrong" }`
  - Expected: Error message
  - Status: 401

- [ ] **Missing fields:** Returns error
  - Request: `{ username: "admin" }`
  - Expected: Validation error
  - Status: 400

- [ ] **Rate limiting:** Blocks after 50 attempts
  - Make 51 requests rapidly
  - Expected: "Too many login attempts" after 50
  - Status: 429

#### POST /api/auth/register
- [ ] **With valid secret:** Creates user
  - Request: `{ username: "test", password: "test123", secret: "REGISTRATION_SECRET" }`
  - Expected: User created
  - Status: 201

- [ ] **Without secret:** Rejects registration
  - Request: `{ username: "test", password: "test123" }`
  - Expected: Unauthorized
  - Status: 401

### 3. SMS Endpoints

#### POST /api/sms
- [ ] **Valid request:** Creates SMS log
  - Headers: `Authorization: Bearer <token>`
  - Body: Valid SMS data
  - Expected: SMS created, device updated
  - Status: 201

- [ ] **Without token:** Rejects request
  - No Authorization header
  - Expected: Unauthorized
  - Status: 401

- [ ] **Missing fields:** Returns validation error
  - Body: Incomplete SMS data
  - Expected: Validation error
  - Status: 400

#### GET /api/sms
- [ ] **With token:** Returns SMS logs
  - Headers: `Authorization: Bearer <token>`
  - Expected: Array of SMS logs
  - Status: 200

- [ ] **Without token:** Rejects request
  - Expected: Unauthorized
  - Status: 401

#### DELETE /api/sms/:deviceId
- [ ] **With token:** Clears device logs
  - Headers: `Authorization: Bearer <token>`
  - Expected: Logs deleted confirmation
  - Status: 200

### 4. Device Endpoints

#### GET /api/device
- [ ] **With token:** Returns all devices
  - Expected: Array of devices
  - Status: 200

#### PUT /api/device/:id
- [ ] **With token:** Updates device name
  - Body: `{ name: "New Name" }`
  - Expected: Updated device object
  - Status: 200

#### PUT /api/device/heartbeat/:id
- [ ] **With token:** Updates last_seen
  - Expected: `{ status: 'ok' }`
  - Status: 200

### 5. Rate Limiting
- [ ] General endpoints: 100 req/15min
  - Make 101 requests
  - Expected: 101st request blocked
  - Status: 429

- [ ] Login endpoint: 50 req/15min
  - Make 51 login requests
  - Expected: 51st request blocked
  - Status: 429

### 6. CORS
- [ ] Frontend on localhost:5173 can access API
- [ ] Frontend on production domain can access API
- [ ] Unauthorized domains are blocked

---

## 💻 Admin Panel Testing

### 1. Login Page

#### Visual
- [ ] Page loads without errors
- [ ] No console errors in browser
- [ ] UI renders correctly (title, inputs, button)
- [ ] Loading animation works
- [ ] Responsive on mobile devices

#### Functionality
- [ ] **Valid login:** Redirects to dashboard
  - Username: `admin`
  - Password: `admin123`
  - Expected: Redirect to `/` (Overview)

- [ ] **Invalid login:** Shows error
  - Username: `admin`
  - Password: `wrong`
  - Expected: Error toast/message

- [ ] **Empty fields:** Shows validation
  - Leave fields empty, click login
  - Expected: Validation message

- [ ] **Token storage:** Token saved in localStorage
  - After login, check localStorage
  - Expected: `token` key exists

### 2. Dashboard Layout

#### Visual
- [ ] Sidebar appears on left
- [ ] Navigation links visible (Overview, Devices, Settings)
- [ ] Theme toggle button works
- [ ] User info displayed
- [ ] Logout button visible
- [ ] Responsive on tablet and mobile

#### Navigation
- [ ] **Overview link:** Navigates to overview page
- [ ] **Devices link:** Navigates to devices page
- [ ] **Settings link:** Navigates to settings page
- [ ] **Active state:** Current page highlighted
- [ ] **Logout:** Clears token and redirects to login

### 3. Overview Page

#### Visual
- [ ] Page title: "Overview"
- [ ] Statistics cards displayed
- [ ] Charts/graphs render (if applicable)
- [ ] SMS log table visible
- [ ] No console errors

#### Functionality
- [ ] **Stats update:** Shows correct counts
  - Total devices
  - Online devices
  - Total SMS
  - Recent activity

- [ ] **SMS log:** Displays recent SMS
  - Timestamp formatted correctly
  - Sender phone number visible
  - Message content visible (or truncated)
  - Device ID/name shown

- [ ] **Real-time updates:** New SMS appear automatically
  - Send SMS from Android app
  - Expected: Appears in list within seconds

- [ ] **Pagination:** Works if many SMS
- [ ] **Search/Filter:** Works if implemented

### 4. Devices Page

#### Visual
- [ ] Page title: "Devices"
- [ ] Device cards/table displayed
- [ ] Online/offline status indicators
- [ ] Last seen timestamp
- [ ] Device names/IDs visible

#### Functionality
- [ ] **Device list:** Shows all registered devices
- [ ] **Status indicator:** 
  - Green dot for online (last_seen < 2 mins)
  - Gray dot for offline (last_seen > 2 mins)

- [ ] **Rename device:**
  - Click rename/edit button
  - Enter new name
  - Save
  - Expected: Name updated on server and UI

- [ ] **Clear logs:**
  - Click clear logs button
  - Confirm action
  - Expected: SMS logs for device deleted

- [ ] **Real-time status:** Device status updates
  - Send heartbeat from Android app
  - Expected: Status changes to online

### 5. Settings Page

#### Visual
- [ ] Page title: "Settings"
- [ ] Configuration options visible
- [ ] Input fields for settings
- [ ] Save button visible

#### Functionality
- [ ] **Website URL:** Can be updated
  - Enter new URL
  - Click save
  - Expected: Config updated in database

- [ ] **Change password:** Works (if implemented)
  - Enter old password
  - Enter new password
  - Confirm new password
  - Expected: Password updated

- [ ] **Theme preference:** Persists across sessions

### 6. Theme Toggle
- [ ] **Switch to Dark Mode:**
  - Click theme toggle
  - Expected: UI switches to dark theme
  - Colors inverted correctly
  - Readable text

- [ ] **Switch to Light Mode:**
  - Click theme toggle
  - Expected: UI switches to light theme
  - Colors appear correctly

- [ ] **Persistence:** Theme choice saved
  - Change theme
  - Refresh page
  - Expected: Same theme persists

### 7. Authentication Flow
- [ ] **Protected routes:** Redirect when not logged in
  - Visit `/` without token
  - Expected: Redirect to `/login`

- [ ] **Token expiry:** Handles expired tokens
  - Use expired token
  - Make API request
  - Expected: Auto-logout or refresh

- [ ] **Auto-logout on 401:** Logs out on unauthorized
  - Backend returns 401
  - Expected: Redirect to login

---

## 📱 Android App Testing

### 1. Installation
- [ ] **APK installs successfully** on device
- [ ] **App icon** appears in launcher
- [ ] **App name:** "ConnectHub"
- [ ] **No installation errors**

### 2. First Launch

#### Permissions
- [ ] **SMS permissions requested**
  - READ_SMS
  - RECEIVE_SMS
  
- [ ] **Notification permission requested** (Android 13+)

- [ ] **Battery optimization:**
  - Dialog appears requesting exemption
  - User can grant exemption

#### UI
- [ ] **Login screen appears**
- [ ] **Username input** visible
- [ ] **Password input** visible
- [ ] **"AUTHORIZE" button** visible
- [ ] **UI renders correctly** (no layout issues)

### 3. Authentication

#### Valid Login
- [ ] Enter username: `admin`
- [ ] Enter password: `admin123`
- [ ] Click "AUTHORIZE"
- [ ] Expected:
  - Button text: "Connecting..."
  - Success toast: "Access Granted"
  - Screen changes to dashboard
  - Shows "ENCRYPTED & ACTIVE"

#### Invalid Login
- [ ] Enter username: `admin`
- [ ] Enter password: `wrong`
- [ ] Click "AUTHORIZE"
- [ ] Expected:
  - Error toast: "Access Denied"
  - Stays on login screen

#### Connection Timeout
- [ ] **Backend offline:**
  - Stop backend server
  - Try to login
  - Expected: "Connection Failed" error

- [ ] **Wrong IP:**
  - Change to invalid IP
  - Try to login
  - Expected: Timeout error

### 4. Dashboard Screen

#### Visual
- [ ] Status text: "ENCRYPTED & ACTIVE"
- [ ] Pulsing green dot animation
- [ ] Logout button visible
- [ ] Identity switch buttons visible (if enabled)

#### Auto-login
- [ ] **Close and reopen app**
  - Expected: Bypass login screen
  - Go directly to dashboard

- [ ] **Force stop and reopen**
  - Expected: Still auto-logged in

### 5. SMS Interception

#### Test Method 1: Send Real SMS
- [ ] **Send SMS to device**
  - From another phone, send SMS
  - Expected: 
    - SMS received normally
    - Notification appears (if enabled)
    - SMS uploaded to backend

- [ ] **Check admin panel**
  - Go to Overview page
  - Expected: SMS appears in log
  - Sender, message, device visible

#### Test Method 2: Emulator Extended Controls
- [ ] Open Extended Controls (... icon)
- [ ] Go to "Phone" section
- [ ] Send test SMS:
  - From: `+1234567890`
  - Message: `Test SMS from emulator`
- [ ] Click "SEND MESSAGE"
- [ ] Expected: Same as above

### 6. Encryption

#### Verify
- [ ] **Check MongoDB directly:**
  ```bash
  mongosh
  use sms_receiver
  db.smslogs.findOne()
  ```
  - Expected: `message_body` is encrypted (base64 string)
  - Not readable plain text

- [ ] **Check decryption in admin panel:**
  - Expected: Message displays in plain text
  - Decryption works correctly

### 7. Offline Sync

#### Test Workflow
- [ ] **Disable internet** on Android device
  - Turn off WiFi and mobile data

- [ ] **Send SMS** to device
  - Expected: SMS received

- [ ] **Check Room database** (optional):
  - Use Android Studio Database Inspector
  - Expected: SMS stored locally

- [ ] **Re-enable internet**

- [ ] **Verify upload:**
  - Check admin panel
  - Expected: SMS appears (delayed upload)

### 8. Background Service

#### Foreground Service
- [ ] **Verify notification:**
  - After login, check notification tray
  - Expected: "ConnectHub is monitoring SMS" notification

- [ ] **Service persistence:**
  - Swipe away app from recents
  - Check notification
  - Expected: Service still running

#### WorkManager
- [ ] **Verify scheduled tasks:**
  - Use Android Studio App Inspection
  - WorkManager tab
  - Expected:
    - KeepAliveWorker scheduled (every 15 min)
    - SyncExistingMessagesWorker executed once

### 9. Device Heartbeat

#### Test
- [ ] **Device online:**
  - App running, internet connected
  - Check Devices page on admin panel
  - Expected: Green dot (online)

- [ ] **Device offline:**
  - Close app or disconnect internet
  - Wait 2+ minutes
  - Check Devices page
  - Expected: Gray dot (offline)

- [ ] **Heartbeat update:**
  - Reopen app
  - Check Devices page
  - Expected: Status changes to online

### 10. Server Configuration

#### Hidden Feature
- [ ] **Long-press "AUTHORIZE" button**
  - Expected: Dialog appears

- [ ] **Enter custom server URL:**
  - Example: `http://192.168.1.100:5000/api/`
  - Click "Update & Restart"
  - Expected: App restarts with new URL

- [ ] **Test connection:**
  - Try to login
  - Expected: Connects to new server

### 11. App Identity Switch

#### Test
- [ ] **Grant OTP Login button** (enable alias)
  - Click button
  - Expected: Toast "Identity: Secure Node Active"
  - Check launcher
  - Expected: App name changed to "Secure Node"

- [ ] **Grant Google Login button** (disable alias)
  - Click button
  - Expected: Toast "Identity: Default Restored"
  - Check launcher
  - Expected: App name back to "ConnectHub"

### 12. Battery Optimization

#### Test
- [ ] **Check exemption status:**
  - Settings → Apps → ConnectHub → Battery
  - Expected: "Unrestricted" or "Not optimized"

- [ ] **If not exempted:**
  - Launch app
  - Expected: Dialog requesting exemption

### 13. Crash Testing

#### Scenarios
- [ ] **Kill backend while app running**
  - Expected: App continues, queues SMS

- [ ] **Kill app during SMS upload**
  - Expected: Upload retries later

- [ ] **Clear app data**
  - Settings → Apps → ConnectHub → Storage → Clear Data
  - Launch app
  - Expected: Login screen, no crashes

- [ ] **Reinstall app**
  - Uninstall
  - Reinstall
  - Expected: Clean install, no issues

---

##  Integration Testing

### End-to-End Workflow: SMS Sync

1. [ ] **Backend running** on port 5000
2. [ ] **Admin panel** open at `/devices` page
3. [ ] **Android app** logged in
4. [ ] **Send SMS** to Android device
5. [ ] **Verify:**
   - SMS received on device
   - SMS uploaded to backend (check logs)
   - Device heartbeat updated (online status)
   - SMS appears in admin panel Overview
   - Encryption/decryption works correctly
   - Timestamp is accurate

### End-to-End Workflow: Device Management

1. [ ] **Multiple devices:**
   - Install app on 2+ devices/emulators
   - Login on each device
   - Send SMS to each device

2. [ ] **Admin panel Devices page:**
   - Expected: All devices listed
   - Each has unique device_id
   - Status indicators correct

3. [ ] **Rename device:**
   - Click rename on Device 1
   - Enter "Primary Phone"
   - Save
   - Expected: Name updated

4. [ ] **Clear logs:**
   - Click clear logs on Device 1
   - Confirm
   - Check Overview page
   - Expected: Only Device 2 SMS visible

### End-to-End Workflow: Offline Scenario

1. [ ] **Disable internet** on Android device
2. [ ] **Send 3 SMS** to device
3. [ ] **Verify:**
   - SMS received locally
   - Stored in Room database
   - Not in admin panel yet

4. [ ] **Re-enable internet**
5. [ ] **Verify:**
   - All 3 SMS upload
   - Appear in admin panel
   - Correct order and timestamp

---

## 🔒 Security Testing

### Authentication
- [ ] **Cannot access protected routes without token**
- [ ] **Invalid tokens rejected**
- [ ] **Expired tokens handled**
- [ ] **Token refresh works** (if implemented)

### Authorization
- [ ] **Admin user can access all endpoints**
- [ ] **Non-admin blocked** (if user roles exist)

### CORS
- [ ] **Allowed origins can make requests**
- [ ] **Disallowed origins blocked**

### Rate Limiting
- [ ] **Login rate limit:** 50/15min
- [ ] **API rate limit:** 100/15min
- [ ] **Proper error messages**

### Data Encryption
- [ ] **SMS encrypted in transit**
- [ ] **SMS encrypted at rest (MongoDB)**
- [ ] **Decryption successful**

### SQL Injection Protection
- [ ] **MongoDB injection attempts fail**
  - Test with: `username: { $gt: "" }`
  - Expected: Rejected or sanitized

### XSS Protection
- [ ] **Script tags in SMS don't execute**
  - Send SMS: `<script>alert('XSS')</script>`
  - View in admin panel
  - Expected: Displayed as text, not executed

---

## 📊 Performance Testing

### Backend
- [ ] **Cold start:** < 5 seconds
- [ ] **Warm start:** < 2 seconds
- [ ] **API response time:** < 100ms (local)
- [ ] **Concurrent requests:** Handle 10+ simultaneous

### Admin Panel
- [ ] **Initial load:** < 3 seconds
- [ ] **Navigation:** < 500ms
- [ ] **Large dataset:** Handle 1000+ SMS logs

### Android App
- [ ] **App launch:** < 3 seconds
- [ ] **Login:** < 2 seconds
- [ ] **SMS upload:** < 1 second
- [ ] **Background service:** Minimal battery impact

---

## 🐛 Expected Issues (Known Limitations)

### Current Version
- [ ] **No WebSocket:** Real-time updates require refresh
- [ ] **No search:** SMS search not implemented
- [ ] **No pagination:** Large datasets may be slow
- [ ] **No backup:** Manual backup required

---

## ✅ Testing Sign-Off

### Tester Information
- **Tester Name:** _______________
- **Date:** _______________
- **Environment:** Local / Production
- **Devices Tested:** _______________

### Results
- **Total Tests:** ___
- **Passed:** ___
- **Failed:** ___
- **Blocked:** ___

### Critical Issues Found
1. _______________
2. _______________
3. _______________

### Recommendation
- [ ] **PASS:** Ready for production
- [ ] **CONDITIONAL PASS:** Deploy with noted issues
- [ ] **FAIL:** Do not deploy, critical issues found

### Sign-Off
- **Tested By:** _______________
- **Reviewed By:** _______________
- **Date:** _______________
- **Signature:** _______________

---

**Document Version:** 1.0.0  
**Last Updated:** February 16, 2026  
**Test Coverage:** ~95% (Manual Testing)
