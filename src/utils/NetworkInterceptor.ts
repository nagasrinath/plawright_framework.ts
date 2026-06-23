import { Page, Route } from '@playwright/test';

export class NetworkInterceptor {
  constructor(private readonly page: Page) {}

  async interceptPaymentSuccess(): Promise<void> {
    await this.page.route(/\/payment\/.*/, (route: Route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'SUCCESS', message: 'Payment processed successfully' }),
      });
    });
  }

  async interceptPaymentFailure(reason: string): Promise<void> {
    await this.page.route(/\/payment\/.*/, (route: Route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'FAILURE', message: reason }),
      });
    });
  }

  async interceptGatewayTimeout(): Promise<void> {
    await this.page.route(/\/payment\/.*/, (route: Route) => {
      // Abort after a 30-second delay to simulate a gateway timeout
      setTimeout(() => {
        void route.abort('timedout');
      }, 30_000);
    });
  }

  async interceptWithCustomResponse(
    urlPattern: string | RegExp,
    body: object,
    status = 200
  ): Promise<void> {
    await this.page.route(urlPattern, (route: Route) => {
      void route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  }

  async removeAllInterceptors(): Promise<void> {
    await this.page.unrouteAll({ behavior: 'ignoreErrors' });
  }
}
