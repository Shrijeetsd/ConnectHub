# 📡 ConnectHub | Secure SMS & Device Gateway

**ConnectHub** is a production-grade, end-to-end communication platform designed for secure SMS synchronization and centralized device management. It features a high-performance **Native Android Application**, a modern **React Admin Dashboard**, and a scalable **Node.js Backend**.

---

## 🚀 Key Modules

### 📱 [Android Application](android/)
Built with **Kotlin**, this is the core gateway for SMS synchronization.
- **Background Sync**: Reliable SMS capture even when the app is closed.
- **Glassmorphism UI**: Premium dark-themed interface for secure access.
- **Battery Optimization Bypass**: Custom setup flow ensuring continuous operation.
- **Invisible Service**: Suppressed foreground notifications for a seamless background experience.

### 💻 [Admin Panel](admin-panel/)
A sleek, high-speed dashboard built with **React**, **Vite**, and **Tailwind CSS**.
- **Real-time Monitoring**: Instant visibility into device statuses and SMS logs.
- **Device Management**: Remote control and deletion of terminal devices.
- **Advanced User Access**: Role-based permissions (Admin/User).
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
├── Documents/        # Professional Setup & Deployment Guides
└── Testing/          # Comprehensive QA Checklists
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18+) & **npm**
- **MongoDB** (Local or Atlas)
- **Android Studio** (For building the APK)

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
   # Configure .env based on .env.example
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
   - Build using `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

---

## 📖 Documentation
Detailed guides are located in the `Documents/` directory for full production setup:
- **[Quick Start Guide](Documents/QUICK_START_GUIDE.md)**
- **[Production Readiness Report](Documents/PRODUCTION_READINESS_REPORT.md)**
- **[Deployment Manual](Documents/GITHUB_DEPLOYMENT_GUIDE.md)**

---

## 🛡️ Security Features
- **End-to-end Encryption** for sensitive JWT tokens.
- **Role-based Authentication** for all administrative operations.
- **Secure Device Identification** using hardware-bound ANDROID_ID.

---

**ConnectHub © 2026** | *Secure Access Gateway*
