export interface AuctionItem {
  id: string;
  sellerId: string;
  productId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  auctionType: 'weekly' | 'rare_monthly';
  startPrice: number;
  currentBid: number;
  minBidStep: number;
  highestBidder: { userId: string; userName: string } | null;
  holdId: string | null; // ID อ้างอิงเงินที่ถูกกันไว้ใน Escrow
  startsAt: string;      // ISO String
  endsAt: string;        // ISO String
  status: 'ongoing' | 'settling' | 'ended';
  antiSnipeSeconds: number;
}

export interface BidRecord {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  bidAmount: number;
  holdId: string;
  createdAt: string;
}

export interface PlaceBidPayload {
  auctionId: string;
  requestId: string;
  bidAmount: number;
}

export type PlaceBidResult =
  | {
      success: true;
      auction: AuctionItem;
      bidRecord: BidRecord;
      isExtended: boolean;
      previousHoldId?: string | null;
    }
  | {
      success: false;
      code: 'BID_LOWER_THAN_CURRENT' | 'AUCTION_CLOSED' | 'SELF_BIDDING' | 'INTERNAL_ERROR' | 'INSUFFICIENT_FUNDS';
      currentBid: number;
      minBidStep: number;
      endsAt: string;
      message: string;
    };

// Socket Events Payload Contracts
export interface AuctionStatePayload {
  auctionId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  auctionType: 'weekly' | 'rare_monthly';
  startPrice: number;
  currentBid: number;
  minBidStep: number;
  endsAt: string;
  serverTime: string;
  status: 'ongoing' | 'settling' | 'ended';
  highestBidder: { userId: string; userName: string } | null;
  history: BidRecord[];
}

export interface AuctionBidAcceptedPayload {
  auctionId: string;
  requestId: string;
  newBid: number;
  endsAt: string;
  isExtended: boolean;
}

export interface AuctionBidRejectedPayload {
  auctionId: string;
  requestId: string;
  code: string;
  message: string;
  currentBid: number;
  minBidStep: number;
  endsAt: string;
}

export interface AuctionBidUpdatedPayload {
  auctionId: string;
  currentBid: number;
  highestBidder: { userId: string; userName: string };
  bidTime: string;
}

export interface AuctionExtendedPayload {
  auctionId: string;
  newEndsAt: string;
  message: string;
}

export interface AuctionClosedPayload {
  auctionId: string;
  message: string;
}

export interface AuctionEndedPayload {
  auctionId: string;
  winner: { userId: string; userName: string } | null;
  finalBid: number;
  endedAt: string;
}
