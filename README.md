# ConnectHub

ConnectHub is a comprehensive device management and communication platform. It consists of a mobile application (React Native), a web-based admin panel (React/Vite), and a robust backend (Node.js/Express/MongoDB).

## Project Structure

*   **`admin-panel/`**: The web-based dashboard for administrators. Built with React, Vite, and Tailwind CSS.
*   **`backend/`**: The RESTful API server. Built with Node.js, Express, and MongoDB. Handles authentication, device management, and SMS processing.
*   **`connecthub/`**: The Android mobile application. Built with React Native. Handles SMS reception, status updates, and web view integration.

## Features

*   **Real-time Device Monitoring**: Track device status (online/offline) and details.
*   **SMS Management**: Receive and sync SMS messages from mobile devices to the central dashboard.
*   **User Management**: Create and manage users with role-based access control (Admin vs. User).
*   **Secure Authentication**: JWT-based authentication with refresh tokens and encrypted storage on mobile.
*   **Remote Updates**: Auto-deployment scripts for seamless updates to the VPS.

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   MongoDB
*   Android Studio (for mobile app development)
*   Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Shrijeetsd/ConnectHub.git
    cd ConnectHub
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    cp .env.example .env # Configure your environment variables
    npm start
    ```

3.  **Admin Panel Setup:**
    ```bash
    cd admin-panel
    npm install
    npm run dev
    ```

4.  **Mobile App Setup:**
    ```bash
    cd connecthub
    npm install
    npm run android
    ```

## Deployment

The project includes automated deployment scripts (`auto_deploy_v4.ps1`) for deploying the web and backend components to a VPS using SSH.

## License

[MIT License](LICENSE)
