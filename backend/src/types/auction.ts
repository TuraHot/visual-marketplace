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
  highestBidderId: string | null;
  highestBidderName: string | null;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  status: 'scheduled' | 'ongoing' | 'ended' | 'cancelled';
  antiSnipeSeconds: number;
}

export interface BidRecord {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  bidAmount: number;
  createdAt: string;
}

export interface PlaceBidPayload {
  auctionId: string;
  bidAmount: number;
}

export interface BidResult {
  success: boolean;
  message?: string;
  newBid?: number;
  highestBidderId?: string;
  highestBidderName?: string;
  newEndTime?: string;
  isExtended?: boolean;
}
