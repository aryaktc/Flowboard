import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach Bearer token ──────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flowboard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 Unauthorized ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('flowboard_token');
      localStorage.removeItem('flowboard_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
