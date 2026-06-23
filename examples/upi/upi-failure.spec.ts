import { test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/utils/TestDataFactory';
import { FailurePage } from '../../src/pages/FailurePage';

test.describe('UPI Payment — Failure Scenarios', () => {
  test.beforeEach(async ({ checkoutPage }) => {
    await checkoutPage.navigate();
  });

  test('entering wrong OTP shows failure page with error reason', async ({ checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const upiPage = await paymentOptionsPage.selectUpi();
    const otpPage = await upiPage.enterVpa(TestDataFactory.validUpiVpa()).then(p => p.pay());
    const resultPage = await otpPage.enterOtp(TestDataFactory.invalidOtp()).then(p => p.submit());

    expect(resultPage).toBeInstanceOf(FailurePage);
    const failurePage = resultPage as FailurePage;
    const reason = await failurePage.getFailureReason();
    expect(reason).toBeTruthy();
    expect(reason.length).toBeGreaterThan(0);
  });

  test('failure page Retry button navigates back to payment options', async ({ checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const upiPage = await paymentOptionsPage.selectUpi();
    const otpPage = await upiPage.enterVpa(TestDataFactory.validUpiVpa()).then(p => p.pay());
    const resultPage = await otpPage.enterOtp(TestDataFactory.invalidOtp()).then(p => p.submit());

    const failurePage = resultPage as FailurePage;
    const retriedOptionsPage = await failurePage.retry();

    expect(await retriedOptionsPage.isUpiTabVisible()).toBe(true);
    expect(await retriedOptionsPage.getPageHeading()).toContain('Choose Payment Method');
  });

  test('network interceptor: route rewrite forces failure path', async ({
    page,
    networkInterceptor,
    upiPage,
  }) => {
    await page.goto('/upi');

    // Rewrite POST /payment/upi to append ?fail=true so the server returns a failure redirect
    await networkInterceptor.interceptWithCustomResponse(
      /\/payment\/upi/,
      { status: 'intercepted' },
      // We use a real route continue instead — override via page.route for this test
      200
    );
    await networkInterceptor.removeAllInterceptors();

    // Use page.route to rewrite the form action URL to include ?fail=true
    await page.route('**/payment/upi', async (route) => {
      await route.continue({ url: route.request().url() + '?fail=true' });
    });

    await upiPage.enterVpa(TestDataFactory.validUpiVpa());
    const otpPage = await upiPage.pay();
    const resultPage = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit());

    expect(resultPage).toBeInstanceOf(FailurePage);
    const reason = await (resultPage as FailurePage).getFailureReason();
    expect(reason).toBeTruthy();
  });

  test('failure page shows Retry and Cancel buttons', async ({ checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const upiPage = await paymentOptionsPage.selectUpi();
    const otpPage = await upiPage.enterVpa(TestDataFactory.validUpiVpa()).then(p => p.pay());
    const resultPage = await otpPage.enterOtp(TestDataFactory.invalidOtp()).then(p => p.submit());

    const failurePage = resultPage as FailurePage;
    expect(await failurePage.isRetryButtonVisible()).toBe(true);
    expect(await failurePage.isCancelButtonVisible()).toBe(true);
  });
});
