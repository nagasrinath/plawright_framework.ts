export type PaymentMethod = 'UPI' | 'NETBANKING' | 'CARD';

export type PaymentStatus = 'SUCCESS' | 'FAILURE' | 'PENDING';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED';

export type BankName = 'HDFC' | 'SBI' | 'ICICI' | 'AXIS' | 'KOTAK';

export interface TestConfig {
  baseUrl: string;
  timeout: number;
}

export interface PaymentResult {
  transactionId: string;
  amountPaid: string;
  paymentMethod: PaymentMethod;
}

export interface FailureResult {
  reason: string;
}

export interface CouponResult {
  applied: boolean;
  discountedTotal?: string;
  errorMessage?: string;
}

export interface SubscriptionPlan {
  name: string;
  price: string;
  status: SubscriptionStatus;
}
