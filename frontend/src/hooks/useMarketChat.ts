'use client';

import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export function useMarketChat(socket: Socket | null, sellerId: string, buyerId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSellerOpen, setIsSellerOpen] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  const roomId = `chat:${sellerId}_${buyerId}`;

  useEffect(() => {
    if (!socket || !sellerId || !buyerId) return;

    // 1. ขอเข้าห้องแชท
    socket.emit('chat:join', { sellerId, buyerId });

    // 2. รับประวัติแชทเดิม
    socket.on('chat:history', (data: { roomId: string; history: ChatMessage[] }) => {
      setMessages(data.history);
      setIsSellerOpen(true);
      setChatError(null);
    });

    // 3. รับข้อความใหม่
    socket.on('chat:receive', (newMsg: ChatMessage) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    // 4. กรณีร้านค้าไม่ได้เปิดในตลาดเสมือน
    socket.on('chat:error', (data: { reason?: string; message?: string }) => {
      const errorMsg = data.reason || data.message || 'ไม่สามารถใช้งานแชทได้';
      setChatError(errorMsg);
      setIsSellerOpen(false);
    });

    // 5. Typing indicator
    socket.on('chat:user_typing', (data: { isTyping: boolean }) => {
      setIsPeerTyping(data.isTyping);
    });

    return () => {
      socket.emit('chat:leave', roomId);
      socket.off('chat:history');
      socket.off('chat:receive');
      socket.off('chat:error');
      socket.off('chat:user_typing');
    };
  }, [socket, sellerId, buyerId, roomId]);

  const sendMessage = useCallback((message: string) => {
    if (!socket || !message.trim()) return;
    socket.emit('chat:send', { sellerId, buyerId, message: message.trim() });
  }, [socket, sellerId, buyerId]);

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!socket) return;
    socket.emit('chat:typing', { roomId, isTyping });
  }, [socket, roomId]);

  return {
    messages,
    isSellerOpen,
    chatError,
    isPeerTyping,
    sendMessage,
    sendTypingStatus,
  };
}
