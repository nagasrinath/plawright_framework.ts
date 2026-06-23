import { test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/utils/TestDataFactory';

test.describe('Checkout — Happy Path', () => {
  test.beforeEach(async ({ checkoutPage }) => {
    await checkoutPage.navigate();
  });

  test('checkout page loads with product details', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Order Summary');
    await expect(page.locator('.product-row').first()).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });

  test('clicking Proceed to Pay navigates to payment options with all tabs visible', async ({ checkoutPage }) => {
    const paymentOptionsPage = await checkoutPage.proceedToPay();

    expect(await paymentOptionsPage.isUpiTabVisible()).toBe(true);
    expect(await paymentOptionsPage.isCardTabVisible()).toBe(true);
    expect(await paymentOptionsPage.isNetBankingTabVisible()).toBe(true);
    expect(await paymentOptionsPage.getPageHeading()).toContain('Choose Payment Method');
  });

  test('applying valid coupon displays discounted total', async ({ checkoutPage }) => {
    await checkoutPage.applyCoupon(TestDataFactory.validCoupon());

    expect(await checkoutPage.isCouponSuccessVisible()).toBe(true);
    const successMsg = await checkoutPage.getCouponSuccessMessage();
    expect(successMsg).toContain('Coupon applied');
    const total = await checkoutPage.getTotalAmount();
    expect(total).not.toBe('₹1,178.82');
  });

  test('applying invalid coupon shows error message', async ({ checkoutPage }) => {
    await checkoutPage.applyCoupon(TestDataFactory.invalidCoupon());

    expect(await checkoutPage.isCouponErrorVisible()).toBe(true);
    const errorMsg = await checkoutPage.getCouponErrorMessage();
    expect(errorMsg).toContain('Invalid coupon');
  });
});
