import { Server, Socket } from 'socket.io';
import {
  ChatMessage,
  ChatSendPayload,
  ChatJoinPayload,
  ChatTypingPayload,
  ChatError,
} from '../types/chat.js';

const MAX_MESSAGE_LENGTH = 1000;

export const registerChatHandler = (io: Server, socket: Socket) => {
  /**
   * เข้าร่วมห้องแชทในตลาดเสมือน (1-on-1 ระหว่างผู้ซื้อและเจ้าของร้าน)
   */
  socket.on('chat:join', (payload: ChatJoinPayload, callback?: (res: { success: boolean; roomId?: string; error?: ChatError }) => void) => {
    if (!payload?.sellerId || !payload?.buyerId) {
      const error: ChatError = {
        code: 'INVALID_PAYLOAD',
        message: 'กรุณาระบุ sellerId และ buyerId ให้ครบถ้วน',
      };
      socket.emit('chat:error', error);
      if (callback) callback({ success: false, error });
      return;
    }

    const roomId = `chat:${payload.sellerId}_${payload.buyerId}`;
    socket.join(roomId);

    socket.emit('chat:joined', { roomId });
    if (callback) callback({ success: true, roomId });
  });

  /**
   * ส่งข้อความแชท พร้อมตรวจสอบ Payload
   */
  socket.on('chat:send', (payload: ChatSendPayload, callback?: (res: { success: boolean; message?: ChatMessage; error?: ChatError }) => void) => {
    // 1. ตรวจสอบความถูกต้องของคู่สนทนา
    if (!payload?.sellerId || !payload?.buyerId) {
      const error: ChatError = {
        code: 'INVALID_PAYLOAD',
        message: 'กรุณาระบุคู่สนทนาให้ถูกต้อง',
      };
      socket.emit('chat:error', error);
      if (callback) callback({ success: false, error });
      return;
    }

    // 2. ตรวจสอบว่าข้อความไม่ว่างเปล่า
    const trimmedMessage = payload.message?.trim();
    if (!trimmedMessage) {
      const error: ChatError = {
        code: 'EMPTY_MESSAGE',
        message: 'ข้อความต้องไม่ว่างเปล่า',
      };
      socket.emit('chat:error', error);
      if (callback) callback({ success: false, error });
      return;
    }

    // 3. ตรวจสอบว่าข้อความไม่ยาวเกินกำหนด
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      const error: ChatError = {
        code: 'MESSAGE_TOO_LONG',
        message: `ข้อความมีความยาวเกินกำหนด (สูงสุด ${MAX_MESSAGE_LENGTH} ตัวอักษร)`,
      };
      socket.emit('chat:error', error);
      if (callback) callback({ success: false, error });
      return;
    }

    const roomId = `chat:${payload.sellerId}_${payload.buyerId}`;

    // 4. สร้าง ChatMessage Model
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      roomId,
      senderId: payload.senderId || socket.id,
      senderName: payload.senderName || 'ผู้ใช้',
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    // 5. ส่งข้อความไปยังทุกคนในห้องแชท (รวมถึงผู้ส่งและผู้รับ)
    io.to(roomId).emit('chat:receive', chatMessage);

    if (callback) callback({ success: true, message: chatMessage });
  });

  /**
   * ส่งสถานะกำลังพิมพ์ข้อความ (Typing Indicator)
   */
  socket.on('chat:typing', (payload: ChatTypingPayload) => {
    if (!payload?.roomId) return;
    socket.to(payload.roomId).emit('chat:user_typing', payload);
  });

  /**
   * ออกจากห้องแชท
   */
  socket.on('chat:leave', (payload: { roomId: string }) => {
    if (payload?.roomId) {
      socket.leave(payload.roomId);
    }
  });
};
