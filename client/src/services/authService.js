import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    const payload = response.data.data;
    if (payload && payload.token) {
      localStorage.setItem('user', JSON.stringify(payload));
    }
    return payload;
  },

  register: async (name, email, password) => {
    const response = await api.post('/users', { name, email, password });
    const payload = response.data.data;
    if (payload && payload.token) {
      localStorage.setItem('user', JSON.stringify(payload));
    }
    return payload;
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
};
