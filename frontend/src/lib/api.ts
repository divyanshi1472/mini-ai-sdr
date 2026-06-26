import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 -> redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};

// Leads
export const leadsApi = {
  getAll: (params?: { skip?: number; limit?: number; status?: string; search?: string }) =>
    api.get('/api/leads/', { params }),
  getOne: (id: number) => api.get(`/api/leads/${id}`),
  create: (data: any) => api.post('/api/leads/', data),
  update: (id: number, data: any) => api.put(`/api/leads/${id}`, data),
  delete: (id: number) => api.delete(`/api/leads/${id}`),
  stats: () => api.get('/api/leads/stats'),
};

// AI
export const aiApi = {
  qualify: (lead_id: number) => api.post('/api/ai/qualify', { lead_id }),
  generateEmail: (lead_id: number, tone?: string, focus?: string) =>
    api.post('/api/ai/generate-email', { lead_id, tone, focus }),
};

export default api;
