import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { PaymentOptionsPage } from './PaymentOptionsPage';
import { ROUTES } from '../constants/routes';

export class CheckoutPage extends BasePage {
  private readonly SELECTORS = {
    COUPON_INPUT: '[data-testid="coupon-input"]',
    APPLY_COUPON_BTN: '[data-testid="apply-coupon-btn"]',
    PROCEED_BTN: '[data-testid="proceed-to-pay-btn"]',
    TOTAL_AMOUNT: '[data-testid="total-amount"]',
    COUPON_ERROR: '[data-testid="coupon-error"]',
    COUPON_SUCCESS: '[data-testid="coupon-success"]',
  } as const;

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.navigateTo(ROUTES.CHECKOUT);
  }

  async applyCoupon(code: string): Promise<CheckoutPage> {
    await this.fill(this.SELECTORS.COUPON_INPUT, code);
    await this.click(this.SELECTORS.APPLY_COUPON_BTN);
    await this.waitForNavigation(/\/checkout/);
    return this;
  }

  async proceedToPay(): Promise<PaymentOptionsPage> {
    await this.click(this.SELECTORS.PROCEED_BTN);
    await this.waitForNavigation(/\/payment-options/);
    return new PaymentOptionsPage(this.page);
  }

  async getTotalAmount(): Promise<string> {
    return this.getText(this.SELECTORS.TOTAL_AMOUNT);
  }

  async getCouponErrorMessage(): Promise<string> {
    await this.waitForElement(this.SELECTORS.COUPON_ERROR);
    return this.getText(this.SELECTORS.COUPON_ERROR);
  }

  async getCouponSuccessMessage(): Promise<string> {
    await this.waitForElement(this.SELECTORS.COUPON_SUCCESS);
    return this.getText(this.SELECTORS.COUPON_SUCCESS);
  }

  async isCouponErrorVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.COUPON_ERROR);
  }

  async isCouponSuccessVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.COUPON_SUCCESS);
  }

  async isProceedButtonVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.PROCEED_BTN);
  }

  async getPageHeading(): Promise<string> {
    return this.getText('h1');
  }
}
