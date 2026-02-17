import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

// Base URL for API
const BASE_URL = 'http://192.168.1.17:5000/api/'; // Update with your local IP

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Authentication Interceptor
apiClient.interceptors.request.use(
    async (config) => {
        const token = await EncryptedStorage.getItem('jwt_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor for Token Refresh (optional, simplified)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Basic retry logic or logout on 401 could be added here
        if (error.response && error.response.status === 401) {
            // Handle token expiration
        }
        return Promise.reject(error);
    }
);

export default apiClient;
