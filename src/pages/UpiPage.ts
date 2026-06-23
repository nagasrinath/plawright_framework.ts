import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { OtpPage } from './OtpPage';
import { ROUTES } from '../constants/routes';

export class UpiPage extends BasePage {
  private readonly SELECTORS = {
    VPA_INPUT: '[data-testid="vpa-input"]',
    PAY_BTN: '[data-testid="upi-pay-btn"]',
    VPA_ERROR: '[data-testid="vpa-error"]',
  } as const;

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.navigateTo(ROUTES.UPI);
  }

  async enterVpa(vpa: string): Promise<this> {
    await this.fill(this.SELECTORS.VPA_INPUT, vpa);
    return this;
  }

  async pay(): Promise<OtpPage> {
    await this.click(this.SELECTORS.PAY_BTN);
    await this.waitForNavigation(/\/otp/);
    return new OtpPage(this.page);
  }

  async isVpaErrorVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.VPA_ERROR);
  }

  async getVpaErrorMessage(): Promise<string> {
    return this.getText(this.SELECTORS.VPA_ERROR);
  }

  async getPageHeading(): Promise<string> {
    return this.getText('h1');
  }
}
