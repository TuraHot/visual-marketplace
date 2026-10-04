import { Server, Socket } from 'socket.io';

export interface VoiceSignalPayload {
  toSocketId: string;
  signal: any;
}

export interface VoiceMutePayload {
  roomId: string;
  isMuted: boolean;
}

export const registerVoiceHandler = (io: Server, socket: Socket) => {
  // เข้าร่วมห้องเสียงหน้าร้านในตลาดเสมือน
  socket.on('voice:join', (payload: { shopId: string; userId: string; userName: string }) => {
    const roomId = `voice:${payload.shopId}`;
    socket.join(roomId);
    socket.to(roomId).emit('voice:user_joined', {
      socketId: socket.id,
      userId: payload.userId,
      userName: payload.userName,
    });
  });

  // WebRTC Signaling: ส่ง Offer
  socket.on('voice:offer', (payload: VoiceSignalPayload) => {
    io.to(payload.toSocketId).emit('voice:offer', {
      fromSocketId: socket.id,
      signal: payload.signal,
    });
  });

  // WebRTC Signaling: ส่ง Answer
  socket.on('voice:answer', (payload: VoiceSignalPayload) => {
    io.to(payload.toSocketId).emit('voice:answer', {
      fromSocketId: socket.id,
      signal: payload.signal,
    });
  });

  // WebRTC Signaling: แลกเปลี่ยน ICE Candidate
  socket.on('voice:ice_candidate', (payload: VoiceSignalPayload) => {
    io.to(payload.toSocketId).emit('voice:ice_candidate', {
      fromSocketId: socket.id,
      signal: payload.signal,
    });
  });

  // อัปเดตสถานะเปิด/ปิดไมโครโฟน
  socket.on('voice:mute_change', (payload: VoiceMutePayload) => {
    const roomId = `voice:${payload.roomId}`;
    io.to(roomId).emit('voice:user_mute_updated', {
      socketId: socket.id,
      isMuted: payload.isMuted,
    });
  });

  // ออกจากห้องเสียง
  socket.on('voice:leave', (payload: { shopId: string }) => {
    const roomId = `voice:${payload.shopId}`;
    socket.leave(roomId);
    socket.to(roomId).emit('voice:user_left', { socketId: socket.id });
  });
};
