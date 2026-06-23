import type { BankName } from '../types';
import { BANKS, VALID_VPA, INVALID_VPA, VALID_OTP, INVALID_OTP, VALID_COUPON, INVALID_COUPON } from '../constants/testData';

export class TestDataFactory {
  static validUpiVpa(): string {
    return VALID_VPA;
  }

  static invalidUpiVpa(): string {
    return INVALID_VPA;
  }

  static validOtp(): string {
    return VALID_OTP;
  }

  static invalidOtp(): string {
    return INVALID_OTP;
  }

  static validCoupon(): string {
    return VALID_COUPON;
  }

  static invalidCoupon(): string {
    return INVALID_COUPON;
  }

  static bankName(): BankName {
    const idx = Math.floor(Math.random() * BANKS.length);
    return BANKS[idx];
  }

  static transactionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const suffix = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `TXN${suffix}`;
  }

  static upiVpaForUser(username: string): string {
    return `${username}@upi`;
  }
}
