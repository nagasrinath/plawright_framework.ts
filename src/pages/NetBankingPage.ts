import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { OtpPage } from './OtpPage';
import type { BankName } from '../types';
import { ROUTES } from '../constants/routes';

export class NetBankingPage extends BasePage {
  private readonly SELECTORS = {
    BANK_SELECT: '[data-testid="bank-select"]',
    CONTINUE_BTN: '[data-testid="continue-to-bank-btn"]',
  } as const;

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.navigateTo(ROUTES.NETBANKING);
  }

  async selectBank(bank: BankName): Promise<this> {
    await this.selectOption(this.SELECTORS.BANK_SELECT, bank);
    return this;
  }

  async proceed(): Promise<OtpPage> {
    await this.click(this.SELECTORS.CONTINUE_BTN);
    await this.waitForNavigation(/\/otp/);
    return new OtpPage(this.page);
  }

  async getSelectedBank(): Promise<string> {
    return this.page.locator(this.SELECTORS.BANK_SELECT).inputValue();
  }

  async getPageHeading(): Promise<string> {
    return this.getText('h1');
  }
}
