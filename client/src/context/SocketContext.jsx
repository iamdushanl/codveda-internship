import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket, getAuthToken } from '../services/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = (err) => {
      setIsConnected(false);
      setConnectionError(err.message);
      console.warn('Socket connection error in context:', err.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Initial state check
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  const reconnect = () => {
    socket.auth = { token: getAuthToken() };
    socket.connect();
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectionError, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
