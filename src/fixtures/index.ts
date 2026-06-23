import { test as base, expect } from '@playwright/test';
import { NetworkInterceptor } from '../utils/NetworkInterceptor';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentOptionsPage } from '../pages/PaymentOptionsPage';
import { UpiPage } from '../pages/UpiPage';
import { NetBankingPage } from '../pages/NetBankingPage';
import { OtpPage } from '../pages/OtpPage';
import { SuccessPage } from '../pages/SuccessPage';
import { FailurePage } from '../pages/FailurePage';
import { SubscriptionPage } from '../pages/SubscriptionPage';

interface PageFixtures {
  networkInterceptor: NetworkInterceptor;
  checkoutPage: CheckoutPage;
  paymentOptionsPage: PaymentOptionsPage;
  upiPage: UpiPage;
  netBankingPage: NetBankingPage;
  otpPage: OtpPage;
  successPage: SuccessPage;
  failurePage: FailurePage;
  subscriptionPage: SubscriptionPage;
}

const test = base.extend<PageFixtures>({
  networkInterceptor: async ({ page }, use) => {
    const interceptor = new NetworkInterceptor(page);
    await use(interceptor);
    await interceptor.removeAllInterceptors();
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  paymentOptionsPage: async ({ page }, use) => {
    await use(new PaymentOptionsPage(page));
  },

  upiPage: async ({ page }, use) => {
    await use(new UpiPage(page));
  },

  netBankingPage: async ({ page }, use) => {
    await use(new NetBankingPage(page));
  },

  otpPage: async ({ page }, use) => {
    await use(new OtpPage(page));
  },

  successPage: async ({ page }, use) => {
    await use(new SuccessPage(page));
  },

  failurePage: async ({ page }, use) => {
    await use(new FailurePage(page));
  },

  subscriptionPage: async ({ page }, use) => {
    await use(new SubscriptionPage(page));
  },
});

export { test, expect };
export type { PageFixtures };
