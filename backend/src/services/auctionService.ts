import {
  AuctionItem,
  BidRecord,
  PlaceBidPayload,
  PlaceBidResult,
} from '../types/auction.js';
import {
  IAuctionRepository,
  defaultAuctionRepository,
} from '../repositories/auctionRepository.js';
import {
  IPaymentIntegrationService,
  defaultPaymentService,
} from './paymentIntegrationService.js';
import { Server } from 'socket.io';

export class AuctionService {
  private repo: IAuctionRepository;
  private paymentService: IPaymentIntegrationService;
  // Per-Auction FIFO Queue สำหรับจัดการ Concurrency
  private queues: Map<string, Promise<any>> = new Map();
  private tickerInterval: NodeJS.Timeout | null = null;
  private io: Server | null = null;

  constructor(
    repo: IAuctionRepository = defaultAuctionRepository,
    paymentService: IPaymentIntegrationService = defaultPaymentService
  ) {
    this.repo = repo;
    this.paymentService = paymentService;
  }

  public setSocketServer(io: Server) {
    this.io = io;
  }

  /**
   * เข้าคิวประมวลผลคำสั่งเคาะราคาแบบ FIFO แยกตาม auctionId
   */
  public async placeBid(
    payload: PlaceBidPayload,
    bidderId: string,
    bidderName: string
  ): Promise<PlaceBidResult> {
    const { auctionId } = payload;

    const previousPromise = this.queues.get(auctionId) || Promise.resolve();

    const currentPromise = previousPromise
      .catch(() => {}) // ป้องกันไม่ให้ error ของคำขอก่อนหน้าหยุดคิว
      .then(() => this.processSingleBid(payload, bidderId, bidderName));

    this.queues.set(auctionId, currentPromise);
    return currentPromise;
  }

  /**
   * ประมวลผลคำสั่ง Bid แต่ละรายการภายในคิว
   */
  private async processSingleBid(
    payload: PlaceBidPayload,
    bidderId: string,
    bidderName: string
  ): Promise<PlaceBidResult> {
    const { auctionId, requestId, bidAmount } = payload;
    const auction = await this.repo.getAuction(auctionId);

    if (!auction) {
      return {
        success: false,
        code: 'INTERNAL_ERROR',
        currentBid: 0,
        minBidStep: 0,
        endsAt: new Date().toISOString(),
        message: 'ไม่พบห้องประมูลนี้',
      };
    }

    const now = Date.now();
    const endsAtTimestamp = new Date(auction.endsAt).getTime();

    // 1. Pre-bid Expiry Check: ตรวจว่าหมดเวลาหรือยังทันทีที่หยิบออกจากคิว
    if (auction.status !== 'ongoing' || now >= endsAtTimestamp) {
      // สั่งเริ่มกระบวนการ Settlement ทันที (หากยังไม่ได้ทำ)
      this.triggerSettlement(auctionId).catch((err) => console.error('Settlement trigger error:', err));

      return {
        success: false,
        code: 'AUCTION_CLOSED',
        currentBid: auction.currentBid,
        minBidStep: auction.minBidStep,
        endsAt: auction.endsAt,
        message: 'การประมูลสิ้นสุดลงแล้ว ไม่สามารถเสนอราคาได้',
      };
    }

    // 2. Pre-check เบื้องต้น: ตรวจสอบราคาขั้นต่ำ
    const minimumAcceptable = auction.highestBidder
      ? auction.currentBid + auction.minBidStep
      : auction.startPrice;

    if (bidAmount < minimumAcceptable) {
      return {
        success: false,
        code: 'BID_LOWER_THAN_CURRENT',
        currentBid: auction.currentBid,
        minBidStep: auction.minBidStep,
        endsAt: auction.endsAt,
        message: `ราคาต้องไม่ต่ำกว่า ${minimumAcceptable.toLocaleString()} บาท`,
      };
    }

    // 3. Pre-check: ห้ามเคาะแข่งกับตัวเอง
    if (auction.highestBidder?.userId === bidderId) {
      return {
        success: false,
        code: 'SELF_BIDDING',
        currentBid: auction.currentBid,
        minBidStep: auction.minBidStep,
        endsAt: auction.endsAt,
        message: 'คุณเป็นผู้ให้ราคาสูงสุดในปัจจุบันอยู่แล้ว',
      };
    }

    // 4. Payment Escrow Hold: สั่งกันเงินผู้เสนอราคาใหม่
    const holdIdempotencyKey = `hold_${auctionId}_${bidderId}_${requestId}`;
    const holdResult = await this.paymentService.holdBalance({
      userId: bidderId,
      auctionId,
      amount: bidAmount,
      idempotencyKey: holdIdempotencyKey,
    });

    if (!holdResult.success || !holdResult.holdId) {
      return {
        success: false,
        code: 'INSUFFICIENT_FUNDS',
        currentBid: auction.currentBid,
        minBidStep: auction.minBidStep,
        endsAt: auction.endsAt,
        message: holdResult.message || 'ยอดเงินไม่เพียงพอในการเคาะราคา',
      };
    }

    const newHoldId = holdResult.holdId;

    // 5. Final Authoritative Decision ใน Repository Transaction
    const placeResult = await this.repo.placeBidAtomic({
      auctionId,
      bidderId,
      bidderName,
      bidAmount,
      holdId: newHoldId,
    });

    // 6. ตรวจสอบผลลัพธ์จาก Transaction
    if (!placeResult.success) {
      // ⚠️ COMPENSATING ACTION: หากการบันทึกหรือการตัดสินใน Transaction ไม่ผ่าน
      // สั่งปลดวงเงินที่กันไว้คืนทันที ป้องกันเงินค้างใน Escrow
      await this.paymentService.releaseHold({
        holdId: newHoldId,
        userId: bidderId,
        auctionId,
        amount: bidAmount,
        idempotencyKey: `comp_${newHoldId}`,
      });

      return placeResult;
    }

    // 7. OUTBID RELEASE: หากการบันทึกสำเร็จ และมีผู้เสนอยอดเดิม ให้สั่งปลดวงเงินคนเดิม
    if (placeResult.previousHoldId && auction.highestBidder) {
      this.paymentService
        .releaseHold({
          holdId: placeResult.previousHoldId,
          userId: auction.highestBidder.userId,
          auctionId,
          amount: auction.currentBid,
          idempotencyKey: `rel_${placeResult.previousHoldId}`,
        })
        .catch((err) => {
          console.error(`Failed to release outbid hold ${placeResult.previousHoldId}:`, err);
        });
    }

    return placeResult;
  }

  /**
   * Settlement Lifecycle: ongoing ➔ settling ➔ ended
   */
  public async triggerSettlement(auctionId: string) {
    const transition = await this.repo.transitionToSettling(auctionId);
    if (!transition.success || !transition.auction) {
      return; // มี Instance อื่นเข้าครอบครองการทำ Settlement ไปแล้ว
    }

    const auction = transition.auction;

    // 1. Broadcast Event auction:closed (ปิดรับการเคาะราคา กำลังจัดการเงิน)
    if (this.io) {
      this.io.to(`auction:${auctionId}`).emit('auction:closed', {
        auctionId,
        message: 'การประมูลปิดรับคำสั่งแล้ว ระบบกำลังสรุปผล...',
      });
    }

    // 2. ถ้าไม่มีผู้เสนอราคาเลย (highestBidder === null) ➔ จบประมูลทันทีโดยไม่ตัดเงิน
    if (!auction.highestBidder || !auction.holdId) {
      await this.repo.markAuctionEnded(auctionId);
      if (this.io) {
        this.io.to(`auction:${auctionId}`).emit('auction:ended', {
          auctionId,
          winner: null,
          finalBid: auction.startPrice,
          endedAt: new Date().toISOString(),
        });
      }
      return;
    }

    // 3. ตัดเงินจริงจาก holdId ของผู้ชนะ
    const winnerId = auction.highestBidder.userId;
    const deductResult = await this.paymentService.deductHeldBalance({
      holdId: auction.holdId,
      winnerId,
      sellerId: auction.sellerId,
      auctionId,
      finalBid: auction.currentBid,
      idempotencyKey: `deduct_${auctionId}_${winnerId}`,
    });

    if (!deductResult.success) {
      console.error(`Settlement payment deduction failed for auction ${auctionId}`);
      // คงสถานะ settling ไว้เพื่อให้ Boot Recovery นำมา Retry ต่อ
      return;
    }

    // 4. บันทึกสถานะ ended
    await this.repo.markAuctionEnded(auctionId);

    // 5. Broadcast Event auction:ended ประกาศผู้ชนะอย่างเป็นทางการ
    if (this.io) {
      this.io.to(`auction:${auctionId}`).emit('auction:ended', {
        auctionId,
        winner: auction.highestBidder,
        finalBid: auction.currentBid,
        endedAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Ticker ประจำรอบ 1 วินาที เพื่อตรวจสอบการหมดเวลา
   */
  public startTimerTicker() {
    if (this.tickerInterval) return;

    this.tickerInterval = setInterval(async () => {
      try {
        const recoverable = await this.repo.getRecoverableAuctions();
        const now = Date.now();

        for (const auction of recoverable) {
          if (auction.status === 'ongoing' && now >= new Date(auction.endsAt).getTime()) {
            await this.triggerSettlement(auction.id);
          } else if (auction.status === 'settling') {
            // รายการที่ตกค้างในสถานะ settling ให้ retry ตัดเงินต่อ
            await this.triggerSettlement(auction.id);
          }
        }
      } catch (err) {
        console.error('Auction ticker error:', err);
      }
    }, 1000);
  }

  public stopTimerTicker() {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  public async getAuctionState(auctionId: string) {
    const auction = await this.repo.getAuction(auctionId);
    if (!auction) return null;
    const history = await this.repo.getBidHistory(auctionId);
    return {
      auction,
      history,
      serverTime: new Date().toISOString(),
    };
  }

  /**
   * resetAuction — รีเซ็ตสถานะห้องประมูลและ Broadcast ให้ทุกคนในห้องรับทราบ
   */
  public async resetAuction(auctionId: string) {
    if (this.repo.resetAuction) {
      const auction = await this.repo.resetAuction(auctionId);
      if (auction && this.io) {
        this.io.to(`auction:${auctionId}`).emit('auction:state', {
          auctionId: auction.id,
          title: auction.title,
          description: auction.description,
          imageUrl: auction.imageUrl,
          auctionType: auction.auctionType,
          startPrice: auction.startPrice,
          currentBid: auction.currentBid,
          minBidStep: auction.minBidStep,
          endsAt: auction.endsAt,
          serverTime: new Date().toISOString(),
          status: auction.status,
          highestBidder: auction.highestBidder,
          history: [],
        });
      }
      return auction;
    }
    return null;
  }

  /**
   * setTimeRemaining — ตั้งเวลาคงเหลือใหม่และ Broadcast แจ้งทุกคนในห้อง
   */
  public async setTimeRemaining(auctionId: string, seconds: number) {
    if (this.repo.setTimeRemaining) {
      const auction = await this.repo.setTimeRemaining(auctionId, seconds);
      if (auction && this.io) {
        this.io.to(`auction:${auctionId}`).emit('auction:extended', {
          auctionId,
          newEndsAt: auction.endsAt,
          message: `ตั้งเวลาคงเหลือเป็น ${seconds} วินาที (โหมดทดสอบ)`,
        });
      }
      return auction;
    }
    return null;
  }
}

export const defaultAuctionService = new AuctionService();
