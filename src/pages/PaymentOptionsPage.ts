import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { UpiPage } from './UpiPage';
import { NetBankingPage } from './NetBankingPage';
import { ROUTES } from '../constants/routes';

export class PaymentOptionsPage extends BasePage {
  private readonly SELECTORS = {
    UPI_TAB: '[data-testid="upi-tab"]',
    CARD_TAB: '[data-testid="card-tab"]',
    NETBANKING_TAB: '[data-testid="netbanking-tab"]',
  } as const;

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.navigateTo(ROUTES.PAYMENT_OPTIONS);
  }

  async selectUpi(): Promise<UpiPage> {
    await this.click(this.SELECTORS.UPI_TAB);
    await this.waitForNavigation(/\/upi/);
    return new UpiPage(this.page);
  }

  async selectNetBanking(): Promise<NetBankingPage> {
    await this.click(this.SELECTORS.NETBANKING_TAB);
    await this.waitForNavigation(/\/netbanking/);
    return new NetBankingPage(this.page);
  }

  async isUpiTabVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.UPI_TAB);
  }

  async isCardTabVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.CARD_TAB);
  }

  async isNetBankingTabVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.NETBANKING_TAB);
  }

  async getPageHeading(): Promise<string> {
    return this.getText('h1');
  }
}
