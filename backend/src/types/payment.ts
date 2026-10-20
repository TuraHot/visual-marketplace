export interface HoldBalanceParams {
  userId: string;
  auctionId: string;
  amount: number;
  idempotencyKey: string;
}

export interface HoldBalanceResult {
  success: boolean;
  holdId?: string;
  code?: 'INSUFFICIENT_FUNDS' | 'WALLET_LOCKED' | 'PAYMENT_ERROR';
  message?: string;
}

export interface ReleaseHoldParams {
  holdId: string;
  userId: string;
  auctionId: string;
  amount: number;
  idempotencyKey: string;
}

export interface DeductHeldBalanceParams {
  holdId: string;
  winnerId: string;
  sellerId: string;
  auctionId: string;
  finalBid: number;
  idempotencyKey: string;
}

export interface InquirePaymentParams {
  idempotencyKey: string;
}

export interface InquirePaymentResult {
  status: 'SUCCESS' | 'FAILED' | 'NOT_FOUND';
  transactionId?: string;
}

export interface IPaymentIntegrationService {
  holdBalance(params: HoldBalanceParams): Promise<HoldBalanceResult>;
  releaseHold(params: ReleaseHoldParams): Promise<{ success: boolean; error?: string }>;
  deductHeldBalance(params: DeductHeldBalanceParams): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  inquirePayment(params: InquirePaymentParams): Promise<InquirePaymentResult>;
}
