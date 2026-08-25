import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Points to our Express backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject token into requests
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      // Ignore parse error
    }
  }
  return config;
});

// Interceptor to format errors nicely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage = error.response?.data?.message;
    if (customMessage) {
      error.message = customMessage;
    }
    return Promise.reject(error);
  }
);

export default api;
