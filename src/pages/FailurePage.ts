import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { PaymentOptionsPage } from './PaymentOptionsPage';

export class FailurePage extends BasePage {
  private readonly SELECTORS = {
    FAILURE_REASON: '[data-testid="failure-reason"]',
    RETRY_BTN: '[data-testid="retry-btn"]',
    CANCEL_BTN: '[data-testid="cancel-btn"]',
  } as const;

  constructor(page: Page) {
    super(page);
  }

  async getFailureReason(): Promise<string> {
    await this.waitForElement(this.SELECTORS.FAILURE_REASON);
    return this.getText(this.SELECTORS.FAILURE_REASON);
  }

  async retry(): Promise<PaymentOptionsPage> {
    await this.click(this.SELECTORS.RETRY_BTN);
    await this.waitForNavigation(/\/payment-options/);
    return new PaymentOptionsPage(this.page);
  }

  async cancel(): Promise<void> {
    await this.click(this.SELECTORS.CANCEL_BTN);
    await this.waitForNavigation(/\/checkout/);
  }

  async getPageHeading(): Promise<string> {
    return this.getText('h1');
  }

  async isRetryButtonVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.RETRY_BTN);
  }

  async isCancelButtonVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.CANCEL_BTN);
  }
}
