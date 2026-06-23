import { test, expect } from '../../src/fixtures/index';

test.describe('Subscription Management', () => {
  test.beforeEach(async ({ subscriptionPage }) => {
    await subscriptionPage.navigate();
  });

  test('subscription page loads with active plan details', async ({ subscriptionPage, page }) => {
    const heading = await subscriptionPage.getPageHeading();
    expect(heading).toContain('Subscription');

    const status = await subscriptionPage.getPlanStatus();
    expect(status).toBe('ACTIVE');

    await expect(page.locator('.plan-card')).toBeVisible();
    await expect(page.locator('.plan-name')).toContainText('Premium');
  });

  test('clicking Cancel Subscription shows confirmation modal', async ({ subscriptionPage }) => {
    expect(await subscriptionPage.isCancelModalVisible()).toBe(false);

    await subscriptionPage.cancelSubscription();

    expect(await subscriptionPage.isCancelModalVisible()).toBe(true);
  });

  test('confirming cancellation changes plan status to Cancelled', async ({ subscriptionPage }) => {
    await subscriptionPage.cancelSubscription();
    await subscriptionPage.confirmCancel();

    const status = await subscriptionPage.getPlanStatus();
    expect(status).toBe('CANCELLED');
  });

  test('cancellation notice is shown after cancel is confirmed', async ({ subscriptionPage }) => {
    await subscriptionPage.cancelSubscription();
    await subscriptionPage.confirmCancel();

    expect(await subscriptionPage.isCancellationNoticeVisible()).toBe(true);
    expect(await subscriptionPage.isCancelSubscriptionButtonVisible()).toBe(false);
  });

  test('keeping the plan closes the modal without cancelling', async ({ subscriptionPage }) => {
    await subscriptionPage.cancelSubscription();
    expect(await subscriptionPage.isCancelModalVisible()).toBe(true);

    await subscriptionPage.keepPlan();
    expect(await subscriptionPage.isCancelModalVisible()).toBe(false);

    const status = await subscriptionPage.getPlanStatus();
    expect(status).toBe('ACTIVE');
  });
});
