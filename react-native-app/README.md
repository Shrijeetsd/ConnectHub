# ConnectHub React Native Migration

This project is a high-fidelity migration of the ConnectHub Android Lite app to React Native.

## Setup Instructions

1.  **Initialize Project**:
    Since this structure was generated, ensure you have a standard React Native environment.
    If you haven't initialized the base project yet, run:
    ```bash
    npx react-native init connecthub
    ```
    Then copy the `src` folder and `android` configuration files provided here into that project.

2.  **Install Dependencies**:
    ```bash
    npm install axios react-native-background-actions react-native-encrypted-storage react-native-get-sms-android react-native-vector-icons crypto-js
    ```

3.  **Link Native Dependencies**:
    Most are auto-linked, but valid `android/app/build.gradle` configuration is required.

4.  **Run on Android**:
    ```bash
    npx react-native run-android
    ```

## Key Features
- **Zero Backend Changes**: Uses `CryptoJS` to match the native AES-256 logic.
- **Background Sync**: Uses `react-native-background-actions` to run a foreground service that polls for SMS.
- **Security**: AES Encryption + SSL Pinning (Configurable).

## Troubleshooting
- **Network Error**: Ensure `src/api/apiClient.js` has the correct `BASE_URL` for your local network (e.g., `http://192.168.1.X:5000`).
- **Permissions**: The app requests SMS permissions on launch. If denied, sync will fail.
