import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { SubscriptionStatus } from '../types';
import { ROUTES } from '../constants/routes';

export class SubscriptionPage extends BasePage {
  private readonly SELECTORS = {
    PLAN_STATUS: '[data-testid="plan-status"]',
    CANCEL_SUBSCRIPTION_BTN: '[data-testid="cancel-subscription-btn"]',
    CANCEL_MODAL: '[data-testid="cancel-modal"]',
    CONFIRM_CANCEL_BTN: '[data-testid="confirm-cancel-btn"]',
    KEEP_PLAN_BTN: '[data-testid="keep-plan-btn"]',
    CANCELLATION_NOTICE: '[data-testid="cancellation-notice"]',
    RESUBSCRIBE_BTN: '[data-testid="resubscribe-btn"]',
  } as const;

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.navigateTo(ROUTES.SUBSCRIPTION);
  }

  async getPlanStatus(): Promise<SubscriptionStatus> {
    await this.waitForElement(this.SELECTORS.PLAN_STATUS);
    const text = await this.getText(this.SELECTORS.PLAN_STATUS);
    return text.toUpperCase() as SubscriptionStatus;
  }

  async cancelSubscription(): Promise<SubscriptionPage> {
    await this.click(this.SELECTORS.CANCEL_SUBSCRIPTION_BTN);
    await this.waitForElement(this.SELECTORS.CANCEL_MODAL);
    return this;
  }

  async confirmCancel(): Promise<SubscriptionPage> {
    await this.click(this.SELECTORS.CONFIRM_CANCEL_BTN);
    await this.waitForNavigation(/\/subscription/);
    return this;
  }

  async keepPlan(): Promise<SubscriptionPage> {
    await this.click(this.SELECTORS.KEEP_PLAN_BTN);
    return this;
  }

  async isCancelModalVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.CANCEL_MODAL);
  }

  async isCancellationNoticeVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.CANCELLATION_NOTICE);
  }

  async isCancelSubscriptionButtonVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.CANCEL_SUBSCRIPTION_BTN);
  }

  async getPageHeading(): Promise<string> {
    return this.getText('h1');
  }
}
