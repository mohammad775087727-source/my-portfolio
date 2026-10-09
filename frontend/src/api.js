import axios from 'axios';

export const BACKEND_URL = 'https://portfolio-backend-rust-kappa.vercel.app';

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
