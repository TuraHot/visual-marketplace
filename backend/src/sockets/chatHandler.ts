import { Server, Socket } from 'socket.io';

export interface SendMessagePayload {
  sellerId: string;
  buyerId: string;
  message: string;
}

export const registerChatHandler = (io: Server, socket: Socket) => {
  // เข้าร่วมห้องแชทในตลาดเสมือน (1-on-1 ระหว่างผู้ซื้อและเจ้าของร้าน)
  socket.on('chat:join', async (payload: { sellerId: string; buyerId: string }) => {
    const roomId = `chat:${payload.sellerId}_${payload.buyerId}`;
    socket.join(roomId);
  });

  // ส่งข้อความแชท
  socket.on('chat:send', async (payload: SendMessagePayload) => {
    const roomId = `chat:${payload.sellerId}_${payload.buyerId}`;
    // TODO: ตรวจสอบสถานะว่าผู้ขายเปิดร้านในตลาดเสมือนอยู่หรือไม่ก่อนส่งข้อความ
    io.to(roomId).emit('chat:receive', payload);
  });

  // ผู้ใช้กำลังพิมพ์ข้อความ
  socket.on('chat:typing', (payload: { roomId: string; isTyping: boolean }) => {
    socket.to(payload.roomId).emit('chat:user_typing', payload);
  });

  // ออกจากห้องแชท
  socket.on('chat:leave', (roomId: string) => {
    socket.leave(roomId);
  });
};
