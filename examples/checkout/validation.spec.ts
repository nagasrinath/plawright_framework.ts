import { test, expect } from '../../src/fixtures/index';

test.describe('Checkout — Validation', () => {
  test.beforeEach(async ({ checkoutPage }) => {
    await checkoutPage.navigate();
  });

  test('"Proceed to Pay" button is present and clickable', async ({ checkoutPage }) => {
    expect(await checkoutPage.isProceedButtonVisible()).toBe(true);
  });

  test('page title and heading text are correct', async ({ checkoutPage, page }) => {
    const heading = await checkoutPage.getPageHeading();
    expect(heading).toBe('Order Summary');
    await expect(page).toHaveTitle(/MockPay/);
  });

  test('total amount is displayed on checkout page', async ({ checkoutPage }) => {
    const total = await checkoutPage.getTotalAmount();
    expect(total).toBeTruthy();
    expect(total).toMatch(/₹/);
  });

  test('coupon input field is present', async ({ page }) => {
    await expect(page.locator('[data-testid="coupon-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="apply-coupon-btn"]')).toBeVisible();
  });
});
