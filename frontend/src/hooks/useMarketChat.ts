'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface ChatError {
  code: string;
  message: string;
}

interface UseMarketChatOptions {
  sellerId: string;
  buyerId: string;
  currentUserId: string;
  currentUserName: string;
}

export function useMarketChat(socket: Socket | null, options: UseMarketChatOptions) {
  const { sellerId, buyerId, currentUserId, currentUserName } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const roomId = sellerId && buyerId ? `chat:${sellerId}_${buyerId}` : '';

  // จัดการการเข้าห้องและการรับข้อความ
  useEffect(() => {
    if (!socket || !sellerId || !buyerId) return;

    // 1. ส่งคำขอเข้าห้อง
    socket.emit('chat:join', { sellerId, buyerId, userId: currentUserId });

    // 2. ตอบรับการเข้าห้องสำเร็จ
    const handleJoined = (res: { roomId: string }) => {
      if (res.roomId === roomId) {
        setIsJoined(true);
        setError(null);
      }
    };

    // 3. รับข้อความใหม่
    const handleReceive = (msg: ChatMessage) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    // 4. รับ Error จาก Server
    const handleError = (err: ChatError) => {
      setError(err);
    };

    // 5. รับสถานะพิมพ์ข้อความของคู่สนทนา
    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== currentUserId) {
        setIsPeerTyping(data.isTyping);

        // Auto-clear typing หลังผ่านไป 3 วินาที (ป้องกันกรณีคู่สนทนาไม่ได้ส่ง false)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsPeerTyping(false);
          }, 3000);
        }
      }
    };

    socket.on('chat:joined', handleJoined);
    socket.on('chat:receive', handleReceive);
    socket.on('chat:error', handleError);
    socket.on('chat:user_typing', handleUserTyping);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit('chat:leave', { roomId });
      socket.off('chat:joined', handleJoined);
      socket.off('chat:receive', handleReceive);
      socket.off('chat:error', handleError);
      socket.off('chat:user_typing', handleUserTyping);
      setIsJoined(false);
    };
  }, [socket, sellerId, buyerId, currentUserId, roomId]);

  // ส่งข้อความ
  const sendMessage = useCallback((text: string) => {
    if (!socket || !sellerId || !buyerId) return;

    const trimmed = text.trim();
    if (!trimmed) {
      setError({ code: 'EMPTY_MESSAGE', message: 'ข้อความต้องไม่ว่างเปล่า' });
      return;
    }

    setError(null);
    socket.emit('chat:send', {
      sellerId,
      buyerId,
      senderId: currentUserId,
      senderName: currentUserName,
      message: trimmed,
    });
  }, [socket, sellerId, buyerId, currentUserId, currentUserName]);

  // ส่งสถานะกำลังพิมพ์
  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socket || !roomId) return;
    socket.emit('chat:typing', {
      roomId,
      userId: currentUserId,
      userName: currentUserName,
      isTyping,
    });
  }, [socket, roomId, currentUserId, currentUserName]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isJoined,
    error,
    isPeerTyping,
    sendMessage,
    sendTyping,
    clearError,
  };
}
