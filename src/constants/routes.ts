export const ROUTES = {
  CHECKOUT: '/checkout',
  PAYMENT_OPTIONS: '/payment-options',
  UPI: '/upi',
  NETBANKING: '/netbanking',
  OTP: '/otp',
  SUCCESS: '/success',
  FAILURE: '/failure',
  SUBSCRIPTION: '/subscription',
} as const;

export const POST_ROUTES = {
  CHECKOUT_PROCEED: '/checkout/proceed',
  CHECKOUT_COUPON: '/checkout/coupon',
  PAYMENT_UPI: '/payment/upi',
  PAYMENT_NETBANKING: '/payment/netbanking',
  PAYMENT_OTP: '/payment/otp',
  SUBSCRIPTION_CANCEL: '/subscription/cancel',
} as const;
