import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Fallback: socket.io typically connects to the root domain, not the /api path.
const fallbackSocketURL = API_URL.replace(/\/api$/, '');
const socketURL = import.meta.env.VITE_SOCKET_URL || fallbackSocketURL;

export const getAuthToken = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.token || null;
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const socket = io(socketURL, {
  autoConnect: true,
  auth: (cb) => {
    cb({
      token: getAuthToken(),
    });
  },
});

socket.on('connect', () => {
  console.log('🔌 Connected to socket server:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('🔌 Socket connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected from socket server:', reason);
});
