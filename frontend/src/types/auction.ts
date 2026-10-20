export interface HighestBidder {
  userId: string;
  userName: string;
}

export interface BidRecord {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  bidAmount: number;
  holdId?: string;
  createdAt: string;
}

export interface AuctionData {
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
  highestBidder: HighestBidder | null;
  endsAt: string;
  serverTime?: string;
  status: 'ongoing' | 'settling' | 'ended';
  antiSnipeSeconds: number;
}

export interface PlaceBidPayload {
  auctionId: string;
  requestId: string;
  bidAmount: number;
}

export interface BidRejectedPayload {
  auctionId: string;
  requestId?: string;
  code: string;
  message: string;
  currentBid: number;
  minBidStep: number;
  endsAt: string;
}

export interface BidAcceptedPayload {
  auctionId: string;
  requestId: string;
  newBid: number;
  endsAt: string;
  isExtended: boolean;
}

export interface AuctionExtendedPayload {
  auctionId: string;
  newEndsAt: string;
  message: string;
}

export interface AuctionEndedPayload {
  auctionId: string;
  winner: HighestBidder | null;
  finalBid: number;
  endedAt: string;
}
