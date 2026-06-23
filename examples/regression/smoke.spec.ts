import { test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/utils/TestDataFactory';
import { SuccessPage } from '../../src/pages/SuccessPage';

test.describe('@smoke Full End-to-End Journey', () => {
  test('complete UPI payment flow — checkout to success @smoke', async ({ checkoutPage }) => {
    // Step 1: Checkout
    await checkoutPage.navigate();
    expect(await checkoutPage.getPageHeading()).toBe('Order Summary');

    // Step 2: Proceed to payment options
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    expect(await paymentOptionsPage.isUpiTabVisible()).toBe(true);
    expect(await paymentOptionsPage.isCardTabVisible()).toBe(true);
    expect(await paymentOptionsPage.isNetBankingTabVisible()).toBe(true);

    // Step 3: Select UPI
    const upiPage = await paymentOptionsPage.selectUpi();
    expect(await upiPage.getPageHeading()).toContain('UPI');

    // Step 4: Enter VPA
    await upiPage.enterVpa(TestDataFactory.validUpiVpa());

    // Step 5: Navigate to OTP
    const otpPage = await upiPage.pay();
    expect(await otpPage.getPageHeading()).toContain('OTP');

    // Step 6: Enter valid OTP
    await otpPage.enterOtp(TestDataFactory.validOtp());

    // Step 7: Submit and verify success
    const resultPage = await otpPage.submit();
    expect(resultPage).toBeInstanceOf(SuccessPage);

    const successPage = resultPage as SuccessPage;
    const txnId = await successPage.getTransactionId();
    const amount = await successPage.getAmountPaid();
    const method = await successPage.getPaymentMethod();

    expect(txnId).toMatch(/^TXN/);
    expect(amount).toMatch(/₹/);
    expect(method).toBe('UPI');
    expect(await successPage.isBackToHomeVisible()).toBe(true);
  });

  test('complete Net Banking flow — checkout to success @smoke', async ({ checkoutPage }) => {
    await checkoutPage.navigate();

    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const netBankingPage = await paymentOptionsPage.selectNetBanking();
    const otpPage = await netBankingPage.selectBank('HDFC').then(p => p.proceed());
    const resultPage = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit());

    expect(resultPage).toBeInstanceOf(SuccessPage);
    const method = await (resultPage as SuccessPage).getPaymentMethod();
    expect(method).toBe('NETBANKING');
  });

  test('coupon discount is reflected in payment flow @smoke', async ({ checkoutPage }) => {
    await checkoutPage.navigate();

    await checkoutPage.applyCoupon(TestDataFactory.validCoupon());
    expect(await checkoutPage.isCouponSuccessVisible()).toBe(true);

    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const upiPage = await paymentOptionsPage.selectUpi();
    const otpPage = await upiPage.enterVpa(TestDataFactory.validUpiVpa()).then(p => p.pay());
    const resultPage = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit());

    const successPage = resultPage as SuccessPage;
    const amount = await successPage.getAmountPaid();
    // Discounted total is ₹1,062 (not ₹1,178.82)
    expect(amount).toContain('1,062');
  });
});
