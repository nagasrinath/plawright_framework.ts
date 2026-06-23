import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { SuccessPage } from './SuccessPage';
import { FailurePage } from './FailurePage';
import { ROUTES } from '../constants/routes';

export class OtpPage extends BasePage {
  private readonly SELECTORS = {
    OTP_INPUT: '[data-testid="otp-input"]',
    SUBMIT_BTN: '[data-testid="otp-submit-btn"]',
    COUNTDOWN: '[data-testid="otp-countdown"]',
    RESEND_LINK: '[data-testid="resend-link"]',
  } as const;

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.navigateTo(ROUTES.OTP);
  }

  async enterOtp(otp: string): Promise<this> {
    await this.fill(this.SELECTORS.OTP_INPUT, otp);
    return this;
  }

  async submit(): Promise<SuccessPage | FailurePage> {
    await this.click(this.SELECTORS.SUBMIT_BTN);
    await this.page.waitForURL(/\/(success|failure)/);
    const currentUrl = this.page.url();
    if (currentUrl.includes('/success')) {
      return new SuccessPage(this.page);
    }
    return new FailurePage(this.page);
  }

  async isCountdownVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.COUNTDOWN);
  }

  async isResendLinkVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.RESEND_LINK);
  }

  async getPageHeading(): Promise<string> {
    return this.getText('h1');
  }
}
