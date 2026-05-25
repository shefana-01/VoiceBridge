/**
 * VoiceBridge API Service
 * Centralized Axios instance for all Django REST Framework API calls.
 * Uses JWT tokens stored in localStorage for authentication.
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach JWT Token ───
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vb_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Auto-refresh expired tokens ───
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('vb_refresh_token');
        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('vb_access_token', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('vb_access_token');
        localStorage.removeItem('vb_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth Endpoints ───
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
};

// ─── Boards Endpoints ───
export const boardsAPI = {
  list: () => api.get('/boards/'),
  get: (id) => api.get(`/boards/${id}/`),
  create: (data) => api.post('/boards/', data),
  update: (id, data) => api.patch(`/boards/${id}/`, data),
  delete: (id) => api.delete(`/boards/${id}/`),
};

// ─── Icons Endpoints ───
export const iconsAPI = {
  list: (boardId) => api.get(`/icons/?board=${boardId}`),
  get: (id) => api.get(`/icons/${id}/`),
  create: (formData) =>
    api.post('/icons/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.patch(`/icons/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/icons/${id}/`),
};

// ─── Community Endpoints ───
export const communityAPI = {
  listTemplates: () => api.get('/community/'),
  getTemplate: (id) => api.get(`/community/${id}/`),
  shareBoard: (data) => api.post('/community/', data),
};

export default api;
