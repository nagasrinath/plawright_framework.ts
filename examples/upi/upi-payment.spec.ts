import { test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/utils/TestDataFactory';
import { SuccessPage } from '../../src/pages/SuccessPage';

test.describe('UPI Payment — Happy Path', () => {
  test.beforeEach(async ({ checkoutPage }) => {
    await checkoutPage.navigate();
  });

  test('full UPI happy path: checkout → UPI tab → VPA → OTP → success', async ({ checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const upiPage = await paymentOptionsPage.selectUpi();
    const otpPage = await upiPage.enterVpa(TestDataFactory.validUpiVpa()).then(p => p.pay());
    const resultPage = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit());

    expect(resultPage).toBeInstanceOf(SuccessPage);
    const successPage = resultPage as SuccessPage;
    const heading = await successPage.getPageHeading();
    expect(heading).toContain('Successful');
  });

  test('success page shows transaction ID after UPI payment', async ({ checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const upiPage = await paymentOptionsPage.selectUpi();
    const otpPage = await upiPage.enterVpa(TestDataFactory.validUpiVpa()).then(p => p.pay());
    const resultPage = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit());

    const successPage = resultPage as SuccessPage;
    const txnId = await successPage.getTransactionId();
    expect(txnId).toMatch(/^TXN/);
    expect(txnId.length).toBeGreaterThan(3);
  });

  test('success page shows amount paid after UPI payment', async ({ checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const upiPage = await paymentOptionsPage.selectUpi();
    const otpPage = await upiPage.enterVpa(TestDataFactory.validUpiVpa()).then(p => p.pay());
    const resultPage = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit());

    const successPage = resultPage as SuccessPage;
    const amount = await successPage.getAmountPaid();
    expect(amount).toMatch(/₹/);
  });

  test('success page shows correct payment method label for UPI', async ({ checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const upiPage = await paymentOptionsPage.selectUpi();
    const otpPage = await upiPage.enterVpa(TestDataFactory.validUpiVpa()).then(p => p.pay());
    const resultPage = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit());

    const successPage = resultPage as SuccessPage;
    const method = await successPage.getPaymentMethod();
    expect(method).toBe('UPI');
  });
});
