import axios from 'axios';
import Cookies from 'js-cookie';

// API client configuration
// This is like a helper that talks to our backend server
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spiritualunitymatch-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  // Try to get token from localStorage first (backup), then cookie
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const cookieToken = Cookies.get('token');
  const token = storedToken || cookieToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Only log for auth/me requests to reduce spam
    if (config.url?.includes('/auth/me')) {
      console.log('📤 [FRONTEND] Auth check request with token:', {
        tokenSource: storedToken ? 'localStorage' : 'cookie',
        tokenLength: token.length
      });
    }
  } else {
    // Only log for auth/me requests to reduce spam
    if (config.url?.includes('/auth/me')) {
      console.log('⚠️ [FRONTEND] Auth check request without token');
    }
  }
  
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Only log auth/me responses to reduce spam
    if (response.config.url?.includes('/auth/me')) {
      console.log('📥 [FRONTEND] Auth check response:', {
        status: response.status,
        success: response.data.success
      });
    }
    return response;
  },
  (error) => {
    console.error('❌ [FRONTEND] API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 [FRONTEND] 401 Unauthorized - clearing tokens');
      // Unauthorized - clear all tokens and redirect to login
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

