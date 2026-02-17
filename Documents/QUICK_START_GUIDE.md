# ConnectHub - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you run ConnectHub locally for development and testing.

---

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 16+ installed (`node --version`)
- ✅ MongoDB installed and running (`mongod --version`)
- ✅ Android Studio (optional, for mobile app)
- ✅ Git (for cloning repository)

---

## Step 1: Clone & Setup (2 minutes)

```bash
# Clone the repository (replace with your repo URL)
git clone https://github.com/yourusername/connecthub.git
cd connecthub

# Or if already downloaded, just navigate to the folder
cd "D:\Project\SMS Reciever"
```

---

## Step 2: Backend Setup (1 minute)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Create initial admin user
node seed.js
```

**Expected Output:**
```
MongoDB Connected: localhost:27017
✓ Admin user created successfully!
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

---

## Step 3: Start Backend (30 seconds)

```bash
# Start the server
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB Connected: localhost
```

✅ Backend is now running at: http://localhost:5000

---

## Step 4: Admin Panel Setup (1 minute)

Open a NEW terminal window:

```bash
# Navigate to admin panel
cd admin-panel

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE ready in 500ms
➜  Local:   http://localhost:5173/
```

✅ Admin Panel is now running at: http://localhost:5173

---

## Step 5: Login to Admin Panel (30 seconds)

1. Open browser: http://localhost:5173
2. You'll see the login page
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. Click "SIGN IN"

✅ You should now see the Dashboard!

---

## Step 6: Android App Setup (Optional - 5 minutes)

### For Emulator Testing:

1. Open Android Studio
2. Open project: `android/` folder
3. Wait for Gradle sync to complete
4. Click Run (▶️) button
5. Select emulator
6. Wait for app to install

### For Physical Device:

1. Enable Developer Options on your phone
2. Enable USB Debugging
3. Connect phone via USB
4. Select your device in Android Studio
5. Click Run

### First Launch:

1. Grant SMS permissions when prompted
2. Grant notification permission (Android 13+)
3. Allow battery optimization exemption
4. Enter login credentials:
   - Username: `admin`
   - Password: `admin123`
5. Click "AUTHORIZE"

✅ App should show "ENCRYPTED & ACTIVE"

---

## Testing SMS Sync

### Method 1: Emulator (Easier)

1. Open emulator Extended Controls (... button)
2. Go to "Phone" section
3. Send test SMS:
   - From: `+1234567890`
   - Message: `Test message from emulator`
4. Click "SEND MESSAGE"
5. Check admin panel → Overview page
6. You should see the SMS appear!

### Method 2: Physical Device

1. Have someone send you an SMS
2. Or use another phone to send SMS
3. Check admin panel → Overview
4. SMS should appear within seconds!

---

## 🎯 Verify Everything Works

### Backend Health Check:
```bash
curl http://localhost:5000/api/device
# Should return 401 (expected - requires authentication)
```

### Admin Panel Check:
- ✅ Dashboard loads
- ✅ Can navigate between pages (Overview, Devices, Settings)
- ✅ Theme toggle works (dark/light mode)

### Android App Check:
- ✅ Login successful
- ✅ Shows "ENCRYPTED & ACTIVE"
- ✅ SMS sync working
- ✅ Device appears in admin panel → Devices

---

## 🐛 Common Issues & Solutions

### "MongoDB connection failed"
**Solution:**
```bash
# Start MongoDB service
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data
```

### "Port 5000 already in use"
**Solution:**
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# macOS/Linux:
lsof -i :5000
kill -9 <process_id>
```

### "Admin panel shows blank page"
**Solution:**
1. Check browser console for errors (F12)
2. Verify backend is running (http://localhost:5000)
3. Clear browser cache and retry
4. Check `admin-panel/.env` has correct API URL

### "Android app: 'Connection Failed'"
**Solution:**
1. **For Emulator:** 
   - Server URL should be `http://10.0.2.2:5000/api/`
   - Check `android/app/build.gradle` debug buildConfigField
2. **For Physical Device:**
   - Both phone and computer must be on same WiFi
   - Use computer's local IP (not localhost)
   - Long-press login button to manually set IP
   - Example: `http://192.168.1.100:5000/api/`

### "SMS received but not showing in admin panel"
**Troubleshooting:**
1. Check Android app shows "ENCRYPTED & ACTIVE"
2. Check backend logs for incoming requests
3. Verify device appears in Devices page
4. Check MongoDB has `smslogs` collection
5. Try refreshing admin panel

---

## 🔧 Development Tips

### Auto-reload Backend on Changes
```bash
cd backend
npm install -g nodemon  # One-time install
npm run dev  # Uses nodemon for auto-reload
```

### View Backend Logs
```bash
# Terminal where backend is running shows live logs
# Or use:
npm run dev | tee backend.log  # Save to file
```

### Check MongoDB Data
```bash
# Open MongoDB shell
mongosh

# Switch to database
use sms_receiver

# View collections
show collections

# View SMS logs
db.smslogs.find().pretty()

# View devices
db.devices.find().pretty()

# View users
db.users.find().pretty()
```

### Admin Panel Hot Reload
- Vite automatically reloads on file changes
- Just save your file and see changes instantly!

---

## 📝 Next Steps

Once everything is working:

1. **Customize:**
   - Change admin password in Settings
   - Update app branding
   - Modify color schemes

2. **Explore Features:**
   - Device management (rename devices)
   - SMS log filtering
   - Clear logs per device
   - Theme switching

3. **Prepare for Production:**
   - Read [PRODUCTION_READINESS_REPORT.md](PRODUCTION_READINESS_REPORT.md)
   - Configure production environment variables
   - Setup production MongoDB
   - Build Android release APK

4. **Deploy:**
   - Follow [GITHUB_DEPLOYMENT_GUIDE.md](GITHUB_DEPLOYMENT_GUIDE.md)
   - Use deployment scripts for VPS
   - Configure domain and SSL

---

## 🎨 Customization Ideas

### Change App Name:
- Edit `android/app/src/main/res/values/strings.xml`
- Change `<string name="app_name">ConnectHub</string>`

### Change Admin Panel Title:
- Edit `admin-panel/index.html`
- Update `<title>` tag

### Change Theme Colors:
- Edit `admin-panel/src/index.css`
- Modify CSS variables

---

## 📞 Need Help?

- Check documentation in `Documents/` folder
- Review troubleshooting section above
- Check browser console for frontend errors (F12)
- Check terminal logs for backend errors
- Search GitHub issues (when available)

---

## ✅ Success Checklist

Mark these off as you complete them:

- [ ] Node.js and MongoDB installed
- [ ] Backend running successfully
- [ ] Admin user created
- [ ] Admin panel running
- [ ] Successfully logged into admin panel
- [ ] Android app installed (optional)
- [ ] SMS sync working (optional)
- [ ] Device showing in admin panel (optional)

---

**Congratulations!** 🎉 

You now have ConnectHub running locally. Explore the features and prepare for production deployment!

---

**Time to Complete:** ~5-10 minutes  
**Difficulty:** Beginner-Friendly  
**Last Updated:** February 16, 2026
