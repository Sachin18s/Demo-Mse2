import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
};

export const expenseService = {
  getAll: (category) => {
    let url = '/expenses';
    if (category && category !== 'All') {
      url += `?category=${category}`;
    }
    return api.get(url);
  },
  create: (expenseData) => api.post('/expenses', expenseData),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export default api;
