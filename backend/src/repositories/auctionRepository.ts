import {
  AuctionItem,
  BidRecord,
  PlaceBidResult,
} from '../types/auction.js';

export interface IAuctionRepository {
  getAuction(id: string): Promise<AuctionItem | null>;
  getBidHistory(auctionId: string): Promise<BidRecord[]>;
  placeBidAtomic(params: {
    auctionId: string;
    bidderId: string;
    bidderName: string;
    bidAmount: number;
    holdId: string;
  }): Promise<PlaceBidResult>;
  transitionToSettling(auctionId: string): Promise<{ success: boolean; auction?: AuctionItem }>;
  markAuctionEnded(auctionId: string): Promise<{ success: boolean }>;
  getRecoverableAuctions(): Promise<AuctionItem[]>;
  resetAuction?(auctionId: string): Promise<AuctionItem | null>;
  setTimeRemaining?(auctionId: string, seconds: number): Promise<AuctionItem | null>;
}

/**
 * MemoryAuctionRepository — สำหรับการพัฒนาและทดสอบแบบ Standalone
 * รับประกัน Atomic State ด้วย In-Memory Data Structure
 */
export class MemoryAuctionRepository implements IAuctionRepository {
  private auctions: Map<string, AuctionItem> = new Map();
  private bidHistory: Map<string, BidRecord[]> = new Map();

  constructor() {
    this.seedInitialAuctions();
  }

  private seedInitialAuctions() {
    // ห้องประมูลรายสัปดาห์จำลองสำหรับทดสอบ (เหลือเวลา 10 นาที)
    const now = Date.now();
    const sampleAuction: AuctionItem = {
      id: 'auction-weekly-01',
      sellerId: 'seller_001',
      productId: 'prod_rare_sword',
      title: 'ดาบมังกรไฟโบราณ (Legendary Fire Sword)',
      description: 'ไอเทมแรร์ค้างสต๊อกประจำสัปดาห์ สภาพไร้รอยขีดข่วน พร้อมพลังธาตุไฟขั้นสูงสุด',
      imageUrl: '/assets/legendary_sword.jpg',
      auctionType: 'weekly',
      startPrice: 1000,
      currentBid: 1000,
      minBidStep: 100,
      highestBidder: null,
      holdId: null,
      startsAt: new Date(now - 60000).toISOString(),
      endsAt: new Date(now + 10 * 60 * 1000).toISOString(),
      status: 'ongoing',
      antiSnipeSeconds: 120, // 2 นาทีสุดท้ายจะขยายเวลา
    };

    this.auctions.set(sampleAuction.id, sampleAuction);
    this.bidHistory.set(sampleAuction.id, []);
  }

  public async getAuction(id: string): Promise<AuctionItem | null> {
    const item = this.auctions.get(id);
    return item ? { ...item } : null;
  }

  public async getBidHistory(auctionId: string): Promise<BidRecord[]> {
    const records = this.bidHistory.get(auctionId) || [];
    return [...records];
  }

  /**
   * placeBidAtomic — ตรวจสอบและบันทึกราคาแบบ Atomic
   */
  public async placeBidAtomic(params: {
    auctionId: string;
    bidderId: string;
    bidderName: string;
    bidAmount: number;
    holdId: string;
  }): Promise<PlaceBidResult> {
    const { auctionId, bidderId, bidderName, bidAmount, holdId } = params;
    const auction = this.auctions.get(auctionId);

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

    // 1. ตรวจสอบสถานะและเวลาสิ้นสุด (Pre-bid Expiry Check ในระดับ Atomic)
    if (auction.status !== 'ongoing' || now >= endsAtTimestamp) {
      return {
        success: false,
        code: 'AUCTION_CLOSED',
        currentBid: auction.currentBid,
        minBidStep: auction.minBidStep,
        endsAt: auction.endsAt,
        message: 'การประมูลสิ้นสุดลงแล้ว ไม่สามารถเสนอราคาได้',
      };
    }

    // 2. ตรวจสอบกติกา: ห้ามผู้นำราคาเดิมเคาะแข่งกับตัวเอง (Self-bidding)
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

    // 3. ตรวจสอบราคาใหม่เทียบกับราคาล่าสุด ณ มิลลิวินาทีนี้
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
        message: `ราคาต้องไม่ต่ำกว่า ${minimumAcceptable.toLocaleString()} บาท (ขั้นต่ำ +${auction.minBidStep})`,
      };
    }

    // 4. กลไก Fixed Anti-Snipe (รีเซ็ตเวลาเป็น now + 120s เมื่อเหลือเวลาน้อยกว่า 120s)
    let isExtended = false;
    let finalEndsAt = auction.endsAt;
    const remainingSeconds = Math.floor((endsAtTimestamp - now) / 1000);

    if (remainingSeconds <= auction.antiSnipeSeconds) {
      finalEndsAt = new Date(now + auction.antiSnipeSeconds * 1000).toISOString();
      isExtended = true;
    }

    // เก็บ holdId ของผู้นำราคาเดิม เพื่อนำไปสั่งปลดเงิน (Outbid Release)
    const previousHoldId = auction.holdId;

    // 5. Atomic Update ในหน่วยความจำ
    auction.currentBid = bidAmount;
    auction.highestBidder = { userId: bidderId, userName: bidderName };
    auction.holdId = holdId;
    auction.endsAt = finalEndsAt;

    const bidRecord: BidRecord = {
      id: `bid_${now}_${Math.random().toString(36).substring(2, 7)}`,
      auctionId,
      bidderId,
      bidderName,
      bidAmount,
      holdId,
      createdAt: new Date(now).toISOString(),
    };

    const history = this.bidHistory.get(auctionId) || [];
    history.unshift(bidRecord);
    this.bidHistory.set(auctionId, history);

    return {
      success: true,
      auction: { ...auction },
      bidRecord,
      isExtended,
      previousHoldId,
    };
  }

  /**
   * transitionToSettling — เปลี่ยนสถานะจาก ongoing -> settling (ปิดรับ Bid)
   */
  public async transitionToSettling(auctionId: string): Promise<{ success: boolean; auction?: AuctionItem }> {
    const auction = this.auctions.get(auctionId);
    if (!auction || auction.status !== 'ongoing') {
      return { success: false };
    }

    auction.status = 'settling';
    return { success: true, auction: { ...auction } };
  }

  /**
   * markAuctionEnded — เปลี่ยนสถานะจาก settling -> ended (ตัดเงินเสร็จสมบูรณ์)
   */
  public async markAuctionEnded(auctionId: string): Promise<{ success: boolean }> {
    const auction = this.auctions.get(auctionId);
    if (!auction || auction.status !== 'settling') {
      return { success: false };
    }

    auction.status = 'ended';
    return { success: true };
  }

  /**
   * getRecoverableAuctions — ดึงห้องประมูลที่ต้องกู้คืน (ongoing และ settling)
   */
  public async getRecoverableAuctions(): Promise<AuctionItem[]> {
    const list: AuctionItem[] = [];
    this.auctions.forEach((auction) => {
      if (auction.status === 'ongoing' || auction.status === 'settling') {
        list.push({ ...auction });
      }
    });
    return list;
  }

  /**
   * resetAuction — รีเซ็ตสถานะห้องประมูลกลับสู่ค่าเริ่มต้น (สำหรับ Live Demo / Standalone Testing)
   */
  public async resetAuction(auctionId: string): Promise<AuctionItem | null> {
    const now = Date.now();
    const freshAuction: AuctionItem = {
      id: auctionId,
      sellerId: 'seller_001',
      productId: 'prod_rare_sword',
      title: 'ดาบมังกรไฟโบราณ (Legendary Fire Sword)',
      description: 'ไอเทมแรร์ค้างสต๊อกประจำสัปดาห์ สภาพไร้รอยขีดข่วน พร้อมพลังโจมตีธาตุไฟขั้นสูงสุด',
      imageUrl: '/assets/legendary_sword.jpg',
      auctionType: 'weekly',
      startPrice: 1000,
      currentBid: 1000,
      minBidStep: 100,
      highestBidder: null,
      holdId: null,
      startsAt: new Date(now - 60000).toISOString(),
      endsAt: new Date(now + 10 * 60 * 1000).toISOString(),
      status: 'ongoing',
      antiSnipeSeconds: 120,
    };
    this.auctions.set(auctionId, freshAuction);
    this.bidHistory.set(auctionId, []);
    return { ...freshAuction };
  }

  /**
   * setTimeRemaining — ตั้งเวลาคงเหลือใหม่แบบเจาะจง (เพื่อทดสอบ Anti-Snipe 30s หรือ Settlement 5s)
   */
  public async setTimeRemaining(auctionId: string, seconds: number): Promise<AuctionItem | null> {
    const auction = this.auctions.get(auctionId);
    if (!auction) return null;
    const now = Date.now();
    auction.endsAt = new Date(now + seconds * 1000).toISOString();
    auction.status = 'ongoing';
    return { ...auction };
  }
}

// Default Repository Instance (Singleton)
export const defaultAuctionRepository = new MemoryAuctionRepository();
