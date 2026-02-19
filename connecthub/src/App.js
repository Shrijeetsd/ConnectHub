import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import EncryptedStorage from 'react-native-encrypted-storage';
import BackgroundService from './services/backgroundTask';
import SmsService from './services/smsService';
import apiClient from './api/apiClient';
import DeviceInfo from 'react-native-device-info';

import { WebView } from 'react-native-webview';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [userRole, setUserRole] = useState(''); // 'user' or 'admin'
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isBatteryOptIgnored, setIsBatteryOptIgnored] = useState(false);

  // No longer needed in app as admins use web portal


  useEffect(() => {
    // For debugging: Force check on reload
    console.log('[App] App Loaded. Checking Permissions...');
    checkPermissionsOnLaunch();
    checkLoginStatus();
  }, []);

  const checkPermissionsOnLaunch = async () => {
    if (Platform.OS === 'android') {
      // 1. Check SMS Permissions
      const smsGranted = await SmsService.checkPermissions();
      setPermissionsGranted(smsGranted);

      // 2. Check Battery Optimization (using flag for now as native check is complex)
      const battOptStatus = await EncryptedStorage.getItem('battery_opt_status');
      if (battOptStatus === 'ignored') {
        setIsBatteryOptIgnored(true);
      } else {
        setIsBatteryOptIgnored(false);
      }
    } else {
      setPermissionsGranted(true);
      setIsBatteryOptIgnored(true);
    }
  };

  const markBatteryOptAsIgnored = async () => {
    // User claims they fixed it. We trust them or check logic here.
    await EncryptedStorage.setItem('battery_opt_status', 'ignored');
    setIsBatteryOptIgnored(true);
  };

  const requestBatteryOpt = async () => {
    await Linking.openSettings();
    // We don't auto-set to true here, we wait for user to click "Done" or "Continue"
  };

  useEffect(() => {
    // Re-check permissions when permission info screen is dismissed or on focus
    if (!showPermissionInfo) {
      checkPermissionsOnLaunch();
    }
  }, [showPermissionInfo]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await SmsService.requestPermissions();
      setPermissionsGranted(granted);
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'SMS permissions are required for this app to function.',
        );
      }
      return granted;
    }
    return true;
  };

  const checkLoginStatus = async () => {
    try {
      const token = await EncryptedStorage.getItem('jwt_token');
      const storedId = await EncryptedStorage.getItem('device_id');
      const role = await EncryptedStorage.getItem('user_role');
      const storedUser = await EncryptedStorage.getItem('user_info');

      if (token) {
        setJwtToken(token);
        setDeviceId(storedId);
        setUserRole(role || 'user');
        if (storedUser) {
          setUserInfo(JSON.parse(storedUser));
        }
        setIsLoggedIn(true);

        if (role === 'user') {
          startServices();
          updateServerStatus(storedId, token);
        }
      }
    } catch (error) {
      console.error('Check login status error', error);
    }
  };

  const startServices = async () => {
    try {
      if (Platform.OS === 'android') {
        // Battery check moved to launch flow
        await BackgroundService.start();
        console.log('Background Service Started');
      }
    } catch (e) {
      console.log('Failed to start service:', e.message);
    }
  };

  const updateServerStatus = async (id, token) => {
    try {
      await apiClient.post(
        '/device/update-status',
        {
          device_id: id,
          model: DeviceInfo.getModel() || 'Android Device',
          status: 'online',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log('Heartbeat sent to server');
    } catch (err) {
      console.error('Failed to update status on server', err);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        username: username,
        password: password,
      });

      if (response.data && response.data.token) {
        const token = response.data.token;
        const role = response.data.role || 'user';

        await EncryptedStorage.setItem('jwt_token', token);
        await EncryptedStorage.setItem('user_role', role);

        if (response.data.refreshToken) {
          await EncryptedStorage.setItem(
            'refresh_token',
            response.data.refreshToken,
          );
        }

        // Fetch/Store Device ID
        let id = await EncryptedStorage.getItem('device_id');
        if (!id) {
          id = 'ID_' + Math.random().toString(36).substring(2, 8).toUpperCase();
          await EncryptedStorage.setItem('device_id', id);
        }

        if (role !== 'user') {
          // Alert.alert('Access Denied', 'Administrators must use the web dashboard.');
          // handleLogout();
          // return;
          console.log('Mobile App: Admin Login allowed for testing');
        }

        const userData = {
          name: response.data.name,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          username: response.data.username
        };

        setUserInfo(userData);
        await EncryptedStorage.setItem('user_info', JSON.stringify(userData));

        setJwtToken(token);
        setDeviceId(id);
        setUserRole(role);
        setIsLoggedIn(true);
        // Do NOT set showPermissionInfo(true) here anymore, handled by main render logic

        startServices();
        updateServerStatus(id, token);
      } else {
        console.log('Login Response Debug:', response);
        const dataStr = JSON.stringify(response.data || {}).substring(0, 200);
        Alert.alert(
          'Login Failed',
          `Server returned success but no token.\nStatus: ${response.status}\nData: ${dataStr}`
        );
      }
    } catch (error) {
      console.error('Login Error Object:', error);
      const message = error.response?.data?.message || error.message;
      const status = error.response ? error.response.status : 'Unknown';
      const debugData = error.response ? JSON.stringify(error.response.data || {}).substring(0, 100) : '';
      Alert.alert('Login Error', `${message}\n(Status: ${status})\n${debugData}`);
    } finally {
      setLoading(false);
    }
  };

  // Admin functions removed as requested


  const handleLogout = async () => {
    await EncryptedStorage.clear();
    try {
      if (Platform.OS === 'android') {
        await BackgroundService.stop();
      }
    } catch (e) {
      console.error('Stop background service error', e);
    }
    setIsLoggedIn(false);
    setUserRole('');
    setUsername('');
    setPassword('');
    setUserInfo(null);
    setShowMenu(false);
    setShowProfile(false);
  };

  // Inject JWT into WebView's localStorage
  const injectedData = `
        localStorage.setItem('token', '${jwtToken}');
        localStorage.setItem('app-theme', 'dark');
        true;
    `;

  if (!permissionsGranted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#050505" />
        <View style={styles.permissionContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('./assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>SMS Permission Required</Text>
            <Text style={styles.permissionText}>
              ConnectHub needs access to read SMS messages to function correctly.
              This permission is mandatory for the app to operate.
            </Text>
            <Text style={styles.permissionNotice}>
              * Please grant SMS permissions to proceed.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={requestPermissions}>
              <Text style={styles.buttonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!isBatteryOptIgnored) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#050505" />
        <View style={styles.permissionContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('./assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Background Service Setup</Text>
            <Text style={styles.permissionText}>
              To ensure ConnectHub stays online and syncs messages, you must disable Battery Optimizations for this app.
            </Text>
            <Text style={styles.permissionNotice}>
              1. Click "Open Settings" below.
              {'\n'}2. Find "ConnectHub".
              {'\n'}3. Select "Don't Optimize" or "Unrestricted".
              {'\n'}4. Come back and click "I Have Done It".
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#475569', marginBottom: 12 }]}
              onPress={requestBatteryOpt}>
              <Text style={styles.buttonText}>Open Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={markBatteryOptAsIgnored}>
              <Text style={styles.buttonText}>I Have Done It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoggedIn) {
    // Default User View (WebView)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
        <StatusBar barStyle="light-content" backgroundColor="#050505" />

        <WebView
          source={{ uri: 'https://connecthub.bond/' }}
          injectedJavaScript={injectedData}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingTitle}>CONNECTHUB</Text>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          )}
          style={{ flex: 1 }}
          onLoadEnd={() => {
            console.log('WebView Loaded');
            if (userRole === 'user') {
              startServices();
            }
          }}
        />

        {/* Floating Menu Button */}
        <TouchableOpacity
          style={styles.floatingMenuBtn}
          onPress={() => setShowMenu(true)}
        >
          <Icon name="menu" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Menu Modal */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  setShowProfile(true);
                }}
              >
                <Icon name="user" size={20} color="#CBD5E1" />
                <Text style={styles.menuText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Profile Modal */}
        <Modal
          visible={showProfile}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowProfile(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <Text style={styles.profileTitle}>User Profile</Text>
                <TouchableOpacity onPress={() => setShowProfile(false)}>
                  <Icon name="x" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{userInfo?.name || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Username</Text>
                  <Text style={styles.infoValue}>{userInfo?.username || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userInfo?.email || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{userInfo?.phoneNumber || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <View style={styles.loginContainer}>
        <View style={styles.loginBox}>
          <View style={styles.logoContainer}>
            <Image
              source={require('./assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.loginTitle}>CONNECTHUB</Text>
          <Text style={styles.loginSubtitle}>Secure Access Gateway</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#64748B"
            value={username}
            onChangeText={(text) => setUsername(text.trim())}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>LOGIN</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonSmall: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonTextSmall: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  loginBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loginTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  loginSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  loginButton: {
    backgroundColor: '#6366F1',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050505',
  },
  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#050505',
  },
  permissionText: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionNotice: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  floatingMenuBtn: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 200,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  menuText: {
    color: '#CBD5E1',
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 4,
  },
  profileCard: {
    width: '85%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    gap: 16,
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 8,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '500',
  }
});

export default App;
