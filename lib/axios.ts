'use client';
import axios from 'axios';

const api = axios.create({
  baseURL: '',
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';').reduce(
      (acc, c) => {
        const [k, v] = c.trim().split('=');
        acc[k] = v;
        return acc;
      },
      {} as Record<string, string>
    );
    const token =
      cookies['better-auth.session_token'] ||
      cookies['better-auth.session-token'] ||
      cookies['__session'];
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.error ||
      (error.response?.status >= 500 ? 'Server error. Please try again.' : error.message);
    return Promise.reject(new Error(message));
  }
);

export default api;
