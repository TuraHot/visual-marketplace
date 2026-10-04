import { Server, Socket } from 'socket.io';

export interface PlaceBidPayload {
  auctionId: string;
  bidAmount: number;
}

export const registerAuctionHandler = (io: Server, socket: Socket) => {
  // เข้าร่วมห้องประมูล
  socket.on('auction:join', async (auctionId: string) => {
    socket.join(`auction:${auctionId}`);
  });

  // เคาะราคาประมูล
  socket.on('auction:place_bid', async (payload: PlaceBidPayload) => {
    // TODO: เชื่อมต่อ Service ตรวจสอบ Transaction, Row Lock, Anti-snipe
  });

  // ออกจากห้องประมูล
  socket.on('auction:leave', (auctionId: string) => {
    socket.leave(`auction:${auctionId}`);
  });
};
