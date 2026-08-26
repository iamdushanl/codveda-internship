import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Fallback: socket.io typically connects to the root domain, not the /api path.
const fallbackSocketURL = API_URL.replace(/\/api$/, '');
const socketURL = import.meta.env.VITE_SOCKET_URL || fallbackSocketURL;

export const socket = io(socketURL, {
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('🔌 Connected to socket server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from socket server');
});
