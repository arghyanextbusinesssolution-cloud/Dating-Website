



import axios from 'axios';
import Cookies from 'js-cookie';

// API client configuration
// This is like a helper that talks to our backend server
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spiritualunitymatch-backend.onrender.com/api';

console.log('🌐 [API] Initializing with URL:', API_URL);
console.log('🌐 [API] Environment:', process.env.NODE_ENV);
console.log('🌐 [API] Public API URL env:', process.env.NEXT_PUBLIC_API_URL);

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
  
  // Log all requests to Render backend for debugging
  console.log('📤 [API Request]', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    hasToken: !!token
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('📥 [API Response]', {
      url: response.config.url,
      status: response.status,
      success: response.data.success
    });
    return response;
  },
  (error) => {
    console.error('❌ [API Error]', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 [API] 401 Unauthorized - clearing tokens');
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

