'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function useSocket(token?: string, userQuery?: { userId: string; userName: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io(BACKEND_URL, {
      auth: { token },
      query: userQuery,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      console.log('🟢 Socket connected:', s.id);
    });

    s.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('🔴 Socket disconnected:', reason);
    });

    s.on('connect_error', (err) => {
      console.error('⚠️ Socket connect error:', err.message);
    });

    return () => {
      s.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, userQuery?.userId, userQuery?.userName]);

  return {
    socket,
    isConnected,
  };
}
