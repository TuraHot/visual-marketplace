import http from 'http';
import { Server } from 'socket.io';
import { registerChatHandler } from './chatHandler.js';
import { registerVoiceHandler } from './voiceHandler.js';
import { registerAuctionHandler } from './auctionHandler.js';
import { defaultAuctionService } from '../services/auctionService.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'realtime-socket-server' }));
});

const io = new Server(server, {
  cors: {
    origin: '*', // รองรับทุก Client สำหรับการพัฒนาและทดสอบ
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`⚡ [Socket Connected] ID: ${socket.id}`);

  // ลงทะเบียน Handlers ประจำส่วนงานคนที่ 4 (แฮม)
  registerChatHandler(io, socket);
  registerVoiceHandler(io, socket);
  registerAuctionHandler(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`🔌 [Socket Disconnected] ID: ${socket.id} (${reason})`);
  });
});

// เริ่มต้น Background Ticker สำหรับตรวจสอบเวลาและการตัดยอดประมูล
defaultAuctionService.startTimerTicker();

server.listen(PORT, () => {
  console.log(`
  🚀 Real-time Socket Server is running!
  📡 Port: http://localhost:${PORT}
  💬 Ready: [Real-time Chat, Voice WebRTC, Live Auction Engine]
  `);
});

export { io, server };
