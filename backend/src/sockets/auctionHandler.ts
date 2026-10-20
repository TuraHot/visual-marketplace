import { Server, Socket } from 'socket.io';
import { PlaceBidPayload } from '../types/auction.js';
import { AuctionService, defaultAuctionService } from '../services/auctionService.js';

export const registerAuctionHandler = (
  io: Server,
  socket: Socket,
  auctionService: AuctionService = defaultAuctionService
) => {
  // ผูก instance ของ Socket Server เข้ากับ Service เพื่อใช้ Broadcast ตอน Settlement
  auctionService.setSocketServer(io);

  /**
   * ผู้ใช้ขอเข้าร่วมห้องประมูล
   */
  socket.on('auction:join', async (payload: { auctionId: string } | string) => {
    try {
      const auctionId = typeof payload === 'string' ? payload : payload?.auctionId;
      if (!auctionId) {
        socket.emit('auction:error', { message: 'กรุณาระบุ auctionId' });
        return;
      }

      socket.join(`auction:${auctionId}`);

      const state = await auctionService.getAuctionState(auctionId);
      if (!state) {
        socket.emit('auction:error', { message: 'ไม่พบห้องประมูลนี้' });
        return;
      }

      // ส่งสถานะปัจจุบันกลับไปให้ Client ที่เพิ่งเข้ามา
      socket.emit('auction:state', {
        auctionId: state.auction.id,
        title: state.auction.title,
        description: state.auction.description,
        imageUrl: state.auction.imageUrl,
        auctionType: state.auction.auctionType,
        startPrice: state.auction.startPrice,
        currentBid: state.auction.currentBid,
        minBidStep: state.auction.minBidStep,
        endsAt: state.auction.endsAt,
        serverTime: state.serverTime,
        status: state.auction.status,
        highestBidder: state.auction.highestBidder,
        history: state.history,
      });

      console.log(`[Auction] Socket ${socket.id} joined auction:${auctionId}`);
    } catch (err: any) {
      socket.emit('auction:error', { message: err.message || 'เกิดข้อผิดพลาดในการเข้าห้องประมูล' });
    }
  });

  /**
   * ผู้ใช้ส่งคำขอเคาะราคา (Place Bid)
   */
  socket.on('auction:place_bid', async (payload: PlaceBidPayload) => {
    try {
      const auctionId = payload?.auctionId;
      const bidAmount = payload?.bidAmount;
      const requestId = payload?.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      if (!auctionId || typeof bidAmount !== 'number') {
        socket.emit('auction:bid_rejected', {
          auctionId: auctionId || '',
          requestId,
          code: 'INVALID_PAYLOAD',
          message: 'ข้อมูลคำขอเคาะราคาไม่ถูกต้อง (ต้องระบุ auctionId และ bidAmount ที่เป็นตัวเลข)',
          currentBid: 0,
          minBidStep: 0,
          endsAt: new Date().toISOString(),
        });
        return;
      }

      // ดึงข้อมูลตัวตนผู้ใช้จาก Socket (ที่ผ่าน Auth หรือ Client ส่งมาในโหมดทดสอบ)
      const bidderId = (socket.data?.user?.id as string) || (socket.handshake.query?.userId as string) || socket.id;
      const bidderName = (socket.data?.user?.username as string) || (socket.handshake.query?.userName as string) || `ผู้ใช้_${socket.id.substring(0, 4)}`;

      // ส่งเข้าคิวประมวลผลคำสั่งเคาะราคา
      const result = await auctionService.placeBid({ auctionId, bidAmount, requestId }, bidderId, bidderName);

      // กรณีที่ 1: เคาะราคาไม่สำเร็จ
      if (!result.success) {
        socket.emit('auction:bid_rejected', {
          auctionId,
          requestId,
          code: result.code,
          message: result.message,
          currentBid: result.currentBid,
          minBidStep: result.minBidStep,
          endsAt: result.endsAt,
        });
        return;
      }

      // กรณีที่ 2: เคาะราคาสำเร็จ
      // 1. ตอบกลับยืนยันเฉพาะผู้เคาะราคา
      socket.emit('auction:bid_accepted', {
        auctionId,
        requestId,
        newBid: result.auction.currentBid,
        endsAt: result.auction.endsAt,
        isExtended: result.isExtended,
      });

      // 2. Broadcast ราคาใหม่และผู้นำราคาให้ทุกคนในห้องประมูล
      io.to(`auction:${auctionId}`).emit('auction:bid_updated', {
        auctionId,
        currentBid: result.auction.currentBid,
        highestBidder: result.auction.highestBidder!,
        bidTime: result.bidRecord.createdAt,
      });

      // 3. หากเกิด Fixed Anti-Snipe ให้ Broadcast แจ้งเตือนเวลาใหม่
      if (result.isExtended) {
        io.to(`auction:${auctionId}`).emit('auction:extended', {
          auctionId,
          newEndsAt: result.auction.endsAt,
          message: 'มีการเคาะราคาในช่วง 2 นาทีสุดท้าย! ระบบรีเซ็ตเวลาสิ้นสุดเป็น 2 นาที',
        });
      }
    } catch (err: any) {
      socket.emit('auction:error', { message: err.message || 'เกิดข้อผิดพลาดในการประมวลผลการเคาะราคา' });
    }
  });

  /**
   * ผู้ใช้ออกจากห้องประมูล
   */
  socket.on('auction:leave', (payload: { auctionId: string } | string) => {
    const auctionId = typeof payload === 'string' ? payload : payload?.auctionId;
    if (auctionId) {
      socket.leave(`auction:${auctionId}`);
      console.log(`[Auction] Socket ${socket.id} left auction:${auctionId}`);
    }
  });

  /**
   * สำหรับการทดสอบ (Dev / Demo Simulation Events)
   */
  socket.on('auction:dev_reset', async (payload: { auctionId: string } | string) => {
    const auctionId = typeof payload === 'string' ? payload : payload?.auctionId;
    if (auctionId) {
      await auctionService.resetAuction(auctionId);
    }
  });

  socket.on('auction:dev_set_timer', async (payload: { auctionId: string; seconds: number }) => {
    if (payload?.auctionId && typeof payload?.seconds === 'number') {
      await auctionService.setTimeRemaining(payload.auctionId, payload.seconds);
    }
  });
};
