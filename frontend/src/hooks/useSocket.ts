'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function useSocket(token?: string, userQuery?: { userId: string; userName: string }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      auth: { token },
      query: userQuery,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🟢 Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('🔴 Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('⚠️ Socket connect error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, userQuery?.userId]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}
