# ConnectHub - GitHub Deployment Guide

## 📦 Pre-Push Checklist

Before pushing to GitHub, ensure the following files are properly configured:

### ✅ Files to Include

- [x] Source code (backend, admin-panel, android)
- [x] package.json files
- [x] Configuration templates
- [x] Deployment scripts
- [x] Documentation
- [x] README files
- [x] .gitignore files

### ⚠️ Files to EXCLUDE (Security)

Never commit these files to GitHub:

- [x] `.env` (contains credentials)
- [x] `.env.production` (contains production secrets)
- [x] `node_modules/` (dependencies)
- [x] `dist/` (build artifacts)
- [x] `.gradle/` (build cache)
- [x] Android keystore files
- [x] Private keys
- [x] API secrets

---

## 🔒 Sensitive Data Checklist

### Files to Review Before Push

1. **backend/.env** - Contains MongoDB credentials and JWT secret
   - ✅ Already in .gitignore
   - Action: Create .env.example instead

2. **backend/.env.production** - Contains production secrets
   - ✅ Already in .gitignore
   - ✅ Created .env.production.template as safe alternative

3. **final_deploy.ps1** - Contains VPS password on line 2
   - ⚠️ **CRITICAL:** Remove password before pushing!

4. **MongoDB URI** - Currently visible in backend/.env
   - ✅ Will be excluded via .gitignore

---

## 🛠️ Preparation Steps

### Step 1: Clean Sensitive Data

Run these commands to remove sensitive information:

```powershell
# Navigate to project root
cd "D:\Project\SMS Reciever"

# Remove sensitive deployment script data
# Edit final_deploy.ps1 and replace password with placeholder
```

### Step 2: Create .gitignore (if not exists)

Create a `.gitignore` file in the root directory:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment Variables
.env
.env.local
.env.development
.env.test
.env.production
backend/.env
backend/.env.production
admin-panel/.env
admin-panel/.env.local

# Build Outputs
dist/
build/
*.log

# Android
android/.gradle/
android/.idea/
android/local.properties
android/*/build/
android/*.iml
android/.DS_Store
*.apk
*.aab
*.keystore
*.jks

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
*.zip
admin_panel_deploy.zip
backend_deploy.zip
```

### Step 3: Sanitize Deployment Scripts

**Edit `final_deploy.ps1`:**

Replace line 2:
```powershell
# BEFORE (contains password):
$ip = "116.203.28.131"; $user = "root"; $password = 'P8FVg5KfNtF2deLpkwvAz8!&Z'

# AFTER (safe for GitHub):
$ip = "YOUR_SERVER_IP"; $user = "root"; $password = 'YOUR_SERVER_PASSWORD'
```

**Edit `deploy_to_vps.ps1`** (if it contains credentials):
- Remove or replace any hardcoded passwords
- Use environment variables or prompt for input instead

### Step 4: Create README.md

Create a comprehensive README for your repository:

```markdown
# ConnectHub - SMS Synchronization & Device Management System

Enterprise-grade SMS synchronization platform with real-time device monitoring and encrypted data transmission.

## 🚀 Features

- **Real-time SMS Sync**: Automatic SMS synchronization from Android devices
- **Device Management**: Track and manage multiple devices with live status
- **AES-256 Encryption**: End-to-end encrypted SMS transmission
- **Admin Dashboard**: Modern React-based admin panel
- **Offline Support**: Room database with WorkManager for offline sync
- **Token Authentication**: Secure JWT-based authentication with refresh tokens

## 📁 Project Structure

```
connecthub/
├── backend/          # Node.js/Express API server
├── admin-panel/      # React admin dashboard
├── android/          # Native Android app
├── Documents/        # Project documentation
└── Testing/          # Test files and scripts
```

## 🛠️ Tech Stack

**Backend:**
- Node.js, Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Helmet (Security)
- Rate Limiting

**Admin Panel:**
- React 19
- Vite
- TailwindCSS 4
- Axios
- Framer Motion

**Android App:**
- Kotlin
- Retrofit (API Client)
- Room Database
- WorkManager
- AES Encryption

## 📋 Prerequisites

- Node.js >= 16
- MongoDB
- Android Studio (for mobile app)
- Java 17 (for Android)

## ⚙️ Installation

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
node seed.js  # Create initial admin user
npm start
```

### Admin Panel Setup

```bash
cd admin-panel
npm install
npm run dev  # Development
npm run build  # Production
```

### Android App Setup

1. Open `android/` folder in Android Studio
2. Sync Gradle dependencies
3. Update `BASE_URL` in `app/build.gradle` with your server IP
4. Build and run

## 🔒 Security

- AES-256 encryption for SMS data
- JWT token authentication with refresh mechanism
- Rate limiting on API endpoints
- Helmet security headers
- CORS configuration
- Encrypted local storage (Android)

## 📱 Android Features

- Background SMS monitoring
- Offline data storage with Room
- Automatic retry mechanism
- Battery optimization handling
- Stealth mode (app identity switching)
- Custom server configuration

## 🌐 Deployment

See [PRODUCTION_READINESS_REPORT.md](Documents/PRODUCTION_READINESS_REPORT.md) for detailed deployment guide.

Quick deployment script:
```bash
# Edit credentials first!
.\final_deploy.ps1
```

## 📄 License

Private Project - All Rights Reserved

## 👥 Contributors

Your Team Name

---

**Version:** 1.0.0  
**Last Updated:** February 2026
```

### Step 5: Create .env.example Files

**backend/.env.example:**
```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/sms_receiver
JWT_SECRET=your_super_secret_key_here_minimum_32_characters
FRONTEND_URL=http://localhost:5173
REGISTRATION_SECRET=your_registration_secret_key
```

**admin-panel/.env.example:**
```bash
VITE_API_URL=/api
```

---

## 🚀 Git Commands to Push

Once all sensitive data is removed:

```powershell
# Initialize git repository (if not already done)
cd "D:\Project\SMS Reciever"
git init

# Add all files
git add .

# Review what will be committed
git status

# Commit
git commit -m "Initial commit - ConnectHub v1.0.0"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/connecthub.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## ⚠️ Critical Security Reminders

### Before Pushing to GitHub:

1. ✅ Verify `.gitignore` is in place
2. ✅ Check no `.env` files are staged
3. ✅ Remove passwords from deployment scripts
4. ✅ Review commit for sensitive data: `git diff --cached`
5. ✅ Test clone in different folder to verify what's public

### After Pushing:

1. Go to GitHub repository settings
2. Add repository secrets for CI/CD (if using)
3. Configure branch protection rules
4. Add collaborators if team project

---

## 🔍 Verification Checklist

Run these commands to verify nothing sensitive is committed:

```powershell
# Show all files that will be committed
git status

# Show content of staged files
git diff --cached

# Search for potential secrets
git grep -i "password"
git grep -i "secret"
git grep -i "mongodb+srv"
```

If any secrets are found:
```powershell
git reset HEAD <file>  # Unstage the file
# Edit the file to remove secrets
git add <file>
```

---

## 📝 Post-Push Actions

1. **Create GitHub Releases:**
   - Tag version: `v1.0.0`
   - Upload signed Android APK
   - Include release notes

2. **Setup GitHub Actions (Optional):**
   - Automated testing
   - Build verification
   - Deployment workflows

3. **Documentation:**
   - Keep README updated
   - Document API endpoints
   - Maintain CHANGELOG

---

## 🎯 Next Steps After GitHub Push

1. Share repository link with team
2. Setup GitHub Issues for bug tracking
3. Create project board for task management
4. Enable GitHub Pages for documentation (optional)
5. Configure webhooks for deployment automation

---

**REMEMBER:** Never commit real credentials to GitHub. Always use environment variables and .env files that are gitignored.

**Generated:** February 16, 2026  
**Version:** 1.0.0
