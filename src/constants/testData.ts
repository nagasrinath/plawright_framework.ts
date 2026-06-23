import type { BankName } from '../types';

export const VALID_OTP = '123456';
export const INVALID_OTP = '000000';

export const VALID_COUPON = 'SAVE10';
export const INVALID_COUPON = 'BADCODE';

export const VALID_VPA = 'testuser@upi';
export const INVALID_VPA = 'badinput';

export const BANKS: readonly BankName[] = ['HDFC', 'SBI', 'ICICI', 'AXIS', 'KOTAK'] as const;

export const BANK_DISPLAY_NAMES: Record<BankName, string> = {
  HDFC: 'HDFC Bank',
  SBI: 'State Bank of India (SBI)',
  ICICI: 'ICICI Bank',
  AXIS: 'Axis Bank',
  KOTAK: 'Kotak Mahindra Bank',
};

export const PAYMENT_METHODS = {
  UPI: 'UPI',
  NETBANKING: 'NETBANKING',
  CARD: 'CARD',
} as const;

export const EXPECTED_TOTALS = {
  ORIGINAL: '₹1,178.82',
  DISCOUNTED: '₹1,062',
};
