import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Platform } from 'react-native';

// Base URL for API
const BASE_URL = 'http://116.203.28.131/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication Interceptor
apiClient.interceptors.request.use(
  async config => {
    const token = await EncryptedStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response Interceptor for Token Refresh (optional, simplified)
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Basic retry logic or logout on 401 could be added here
    if (error.response && error.response.status === 401) {
      // Handle token expiration
    }
    return Promise.reject(error);
  },
);

export default apiClient;
