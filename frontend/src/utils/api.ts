import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
});

const isLikelyJwt = (token: string): boolean => {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
};

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && isLikelyJwt(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
