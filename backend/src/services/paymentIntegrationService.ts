import {
  IPaymentIntegrationService,
  HoldBalanceParams,
  HoldBalanceResult,
  ReleaseHoldParams,
  DeductHeldBalanceParams,
  InquirePaymentParams,
  InquirePaymentResult,
} from '../types/payment.js';

export class MockPaymentIntegrationService implements IPaymentIntegrationService {
  private activeHolds: Map<string, { userId: string; amount: number; auctionId: string }> = new Map();
  private transactionHistory: Map<string, any> = new Map();

  public async holdBalance(params: HoldBalanceParams): Promise<HoldBalanceResult> {
    const { userId, auctionId, amount, idempotencyKey } = params;

    // ตรวจสอบ Idempotency
    if (this.transactionHistory.has(idempotencyKey)) {
      return this.transactionHistory.get(idempotencyKey);
    }

    const holdId = `hold_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.activeHolds.set(holdId, { userId, amount, auctionId });

    const result: HoldBalanceResult = {
      success: true,
      holdId,
    };

    this.transactionHistory.set(idempotencyKey, result);
    return result;
  }

  public async releaseHold(params: ReleaseHoldParams): Promise<{ success: boolean; error?: string }> {
    const { holdId, idempotencyKey } = params;

    if (this.transactionHistory.has(idempotencyKey)) {
      return this.transactionHistory.get(idempotencyKey);
    }

    this.activeHolds.delete(holdId);

    const result = { success: true };
    this.transactionHistory.set(idempotencyKey, result);
    return result;
  }

  public async deductHeldBalance(
    params: DeductHeldBalanceParams
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const { holdId, idempotencyKey } = params;

    if (this.transactionHistory.has(idempotencyKey)) {
      return this.transactionHistory.get(idempotencyKey);
    }

    this.activeHolds.delete(holdId);
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const result = { success: true, transactionId };
    this.transactionHistory.set(idempotencyKey, result);
    return result;
  }

  public async inquirePayment(params: InquirePaymentParams): Promise<InquirePaymentResult> {
    const { idempotencyKey } = params;

    if (this.transactionHistory.has(idempotencyKey)) {
      return { status: 'SUCCESS' };
    }

    return { status: 'NOT_FOUND' };
  }
}

export const defaultPaymentService = new MockPaymentIntegrationService();
