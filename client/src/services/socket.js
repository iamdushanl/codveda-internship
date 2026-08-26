import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// socket.io typically connects to the root domain, not the /api path.
// So we remove '/api' if it's present at the end of the URL.
const socketURL = URL.replace(/\/api$/, '');

export const socket = io(socketURL, {
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('🔌 Connected to socket server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from socket server');
});
