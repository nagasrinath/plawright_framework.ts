import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SuccessPage extends BasePage {
  private readonly SELECTORS = {
    TRANSACTION_ID: '[data-testid="transaction-id"]',
    AMOUNT_PAID: '[data-testid="amount-paid"]',
    PAYMENT_METHOD: '[data-testid="payment-method"]',
    BACK_TO_HOME_BTN: '[data-testid="back-to-home-btn"]',
  } as const;

  constructor(page: Page) {
    super(page);
  }

  async getTransactionId(): Promise<string> {
    await this.waitForElement(this.SELECTORS.TRANSACTION_ID);
    return this.getText(this.SELECTORS.TRANSACTION_ID);
  }

  async getAmountPaid(): Promise<string> {
    await this.waitForElement(this.SELECTORS.AMOUNT_PAID);
    return this.getText(this.SELECTORS.AMOUNT_PAID);
  }

  async getPaymentMethod(): Promise<string> {
    await this.waitForElement(this.SELECTORS.PAYMENT_METHOD);
    return this.getText(this.SELECTORS.PAYMENT_METHOD);
  }

  async getPageHeading(): Promise<string> {
    return this.getText('h1');
  }

  async isBackToHomeVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.BACK_TO_HOME_BTN);
  }
}
