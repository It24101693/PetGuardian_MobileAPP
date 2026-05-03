import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

// Fallback if .env not loaded (but it should be)
const BASE_URL = API_BASE_URL || 'http://172.28.31.229:5001/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('pg_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong';

    if (error?.response?.data) {
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        // Extract express-validator errors
        message = error.response.data.errors.map((e: any) => e.msg).join('\n');
      } else if (error.response.data.message) {
        message = error.response.data.message;
      }
    } else if (error?.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem('pg_token', token);
};

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem('pg_token');
};

import { AI_SERVICE_URL } from '@env';
export const AI_BASE_URL = AI_SERVICE_URL || 'http://172.28.31.229:5000';
