import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Points to our Express backend
  headers: {
    'Content-Type': 'application/json',
  },
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
