import { test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/utils/TestDataFactory';
import { SuccessPage } from '../../src/pages/SuccessPage';
import { FailurePage } from '../../src/pages/FailurePage';
import type { BankName } from '../../src/types';
import { BANKS } from '../../src/constants/testData';

test.describe('Net Banking — Happy Path', () => {
  test.beforeEach(async ({ checkoutPage }) => {
    await checkoutPage.navigate();
  });

  test('full net banking happy path: select bank → OTP → success', async ({ checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const netBankingPage = await paymentOptionsPage.selectNetBanking();
    const otpPage = await netBankingPage.selectBank(TestDataFactory.bankName()).then(p => p.proceed());
    const resultPage = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit());

    expect(resultPage).toBeInstanceOf(SuccessPage);
    const heading = await (resultPage as SuccessPage).getPageHeading();
    expect(heading).toContain('Successful');
  });

  test('success page shows NETBANKING as payment method', async ({ checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const netBankingPage = await paymentOptionsPage.selectNetBanking();
    const otpPage = await netBankingPage.selectBank('HDFC').then(p => p.proceed());
    const resultPage = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit());

    const method = await (resultPage as SuccessPage).getPaymentMethod();
    expect(method).toBe('NETBANKING');
  });

  // Parameterized test: all 5 banks
  for (const bank of BANKS) {
    test(`bank selection works for ${bank}`, async ({ checkoutPage }) => {
      const paymentOptionsPage = await checkoutPage.proceedToPay();
      const netBankingPage = await paymentOptionsPage.selectNetBanking();
      await netBankingPage.selectBank(bank as BankName);
      const selectedValue = await netBankingPage.getSelectedBank();
      expect(selectedValue).toBe(bank);
    });
  }

  test('net banking failure flow via ?fail=true query', async ({ page, checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();
    const netBankingPage = await paymentOptionsPage.selectNetBanking();

    // Intercept form submission to append ?fail=true
    await page.route('**/payment/netbanking', async (route) => {
      const request = route.request();
      await route.continue({
        url: request.url() + '?fail=true',
      });
    });

    const otpPage = await netBankingPage.selectBank('HDFC').then(p => p.proceed());
    const resultPage = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit());

    expect(resultPage).toBeInstanceOf(FailurePage);
    const reason = await (resultPage as FailurePage).getFailureReason();
    expect(reason).toBeTruthy();
  });
});
