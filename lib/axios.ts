'use client';
import axios from 'axios';

const api = axios.create({
  baseURL: '',
  timeout: 30000,
  // withCredentials ensures the browser automatically sends the session cookie
  // on every request — no manual cookie reading needed (and HttpOnly cookies
  // cannot be read via document.cookie anyway).
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
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