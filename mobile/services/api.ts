import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL as ENV_API_URL, AI_SERVICE_URL, HF_TOKEN, PUBLIC_WEB_URL as ENV_WEB_URL } from '@env';

// Exported constants from env
export const API_BASE_URL = ENV_API_URL || 'https://petguardianmobileapp-production.up.railway.app/api';
export const AI_BASE_URL = AI_SERVICE_URL || 'https://dulanajaya-pet-guardian-ai.hf.space';
export const HUGGINGFACE_TOKEN = HF_TOKEN || '';
export const PUBLIC_WEB_URL = ENV_WEB_URL || 'https://petguardianmobileapp-production.up.railway.app';

/**
 * Shared utility to get the full image URL.
 * Handles local uploads (relative paths) and external URLs (Cloudinary).
 */
export const getImageUrl = (url: string | null | undefined) => {
  const defaultImage = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';
  if (!url) return defaultImage;
  if (url.startsWith('http') || url.startsWith('file:')) return url;
  
  // Construct URL from API_BASE_URL (removing /api at the end)
  const SERVER_URL = API_BASE_URL.replace('/api', '');
  // Ensure we don't have double slashes
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return `${SERVER_URL}/${cleanPath}`;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
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
