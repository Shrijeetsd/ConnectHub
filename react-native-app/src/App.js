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
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import BackgroundService from './services/backgroundTask';
import SmsService from './services/smsService';
import apiClient from './api/apiClient';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [deviceId, setDeviceId] = useState('');

    useEffect(() => {
        checkLoginStatus();
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            const granted = await SmsService.requestPermissions();
            if (!granted) {
                Alert.alert('Permission Denied', 'SMS permissions are required for this app to function.');
            }
        }
    };

    const checkLoginStatus = async () => {
        const token = await EncryptedStorage.getItem('jwt_token');
        if (token) {
            setIsLoggedIn(true);
            startServices();
        }
    };

    const startServices = async () => {
        try {
            await BackgroundService.start();
            console.log('Background Service Started');
        } catch (e) {
            console.error('Failed to start service', e);
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

            if (response.data && response.data.accessToken) {
                await EncryptedStorage.setItem('jwt_token', response.data.accessToken);
                await EncryptedStorage.setItem('refresh_token', response.data.refreshToken);

                // Fetch/Store Device ID
                // Simplified: use a random ID or fetch real one
                const id = 'ANDROID_' + Math.floor(Math.random() * 1000000);
                await EncryptedStorage.setItem('device_id', id);
                setDeviceId(id);

                setIsLoggedIn(true);
                startServices();
            } else {
                Alert.alert('Login Failed', 'Invalid credentials');
            }
        } catch (error) {
            Alert.alert('Login Error', error.message || 'Network request failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await EncryptedStorage.clear();
        await BackgroundService.stop();
        setIsLoggedIn(false);
    };

    if (isLoggedIn) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#050505" />
                <View style={styles.dashboard}>
                    <Text style={styles.title}>CONNECTHUB MONITOR</Text>

                    <View style={styles.card}>
                        <Text style={styles.label}>CONNECTION STATUS</Text>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusText}>ENCRYPTED & ACTIVE</Text>
                            <View style={styles.pulseDot} />
                        </View>
                        <View style={styles.divider} />
                        <Text style={styles.infoText}>
                            Live streams are being redirected to your Web Console. Do not close this application.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.buttonText}>TERMINATE CONNECTION</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />
            <View style={styles.loginContainer}>
                <View style={styles.loginBox}>
                    <Text style={styles.loginTitle}>CONNECTHUB ACCESS</Text>
                    <Text style={styles.loginSubtitle}>ConnectHub Mobile v2.0</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Terminal ID"
                        placeholderTextColor="#334155"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Access Key"
                        placeholderTextColor="#334155"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'CONNECTING...' : 'AUTHORIZE'}
                        </Text>
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
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 28,
    },
    loginBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glass effect simulation
        borderRadius: 16,
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    loginTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
        letterSpacing: 1,
    },
    loginSubtitle: {
        color: '#475569',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 36,
    },
    input: {
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        height: 58,
        borderRadius: 8,
        paddingHorizontal: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    loginButton: {
        backgroundColor: '#6366F1',
        height: 58,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    dashboard: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginTop: 20,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    label: {
        color: '#475569',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusText: {
        color: '#10B981',
        fontSize: 20,
        fontWeight: 'bold',
    },
    pulseDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10B981',
    },
    divider: {
        height: 1,
        backgroundColor: '#1E293B',
        marginVertical: 20,
    },
    infoText: {
        color: '#64748B',
        fontSize: 13,
        lineHeight: 20,
    },
    logoutButton: {
        backgroundColor: '#EF4444',
        height: 58,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
});

export default App;
