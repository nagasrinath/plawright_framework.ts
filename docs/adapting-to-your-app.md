# Adapting to Your Own App

This guide walks through replacing the built-in mock payment app with your real application.

---

## Step 1 — Point Playwright at your app

Open `playwright.config.ts`. Find the `webServer` block:

```typescript
webServer: {
  command: 'npm run start:mock-app',
  url: 'http://localhost:3000/checkout',
  reuseExistingServer: !process.env.CI,
  timeout: 30_000,
},
```

**Option A — keep running a local dev server:**
Replace `command` with whatever starts your app (e.g. `npm run dev`), and update `url` to a route you know will return 200.

**Option B — test against a deployed environment:**
Remove the `webServer` block entirely and set `BASE_URL` in your environment:

```bash
BASE_URL=https://staging.yourapp.com npx playwright test
```

The `use.baseURL` config already reads from `process.env.BASE_URL`, so all `page.goto('/route')` calls resolve against the new base.

---

## Step 2 — Update routes

`src/constants/routes.ts` maps logical names to URL paths. Replace the paths with your app's routes:

```typescript
export const ROUTES = {
  CHECKOUT:        '/cart',                // was '/checkout'
  PAYMENT_OPTIONS: '/pay/select-method',  // was '/payment-options'
  UPI:             '/pay/upi',
  // ... add or remove routes as needed
} as const;
```

---

## Step 3 — Update test data

`src/constants/testData.ts` holds OTPs, VPAs, coupons, and bank codes. Replace them with values your app accepts:

```typescript
export const VALID_OTP    = '654321';    // whatever your test OTP is
export const VALID_COUPON = 'TEST20';
export const VALID_VPA    = 'qa@yourbank';
export const BANKS        = ['HDFC', 'ICICI'] as const;
```

`TestDataFactory` reads from these constants, so test files need no changes.

---

## Step 4 — Rewrite page objects

Each file in `src/pages/` maps to one screen. For each screen in your app:

1. Create a new file (or edit the existing one with the closest match).
2. Update the `SELECTORS` block to match your HTML — prefer `data-testid` attributes.
3. Update action methods to reflect what the page actually does.
4. Keep the same return pattern: return `this` for in-page actions, return a new page object when navigation occurs.

You don't have to rewrite all pages at once. Start with the ones your first test needs; the unused page objects are harmless.

---

## Step 5 — Update the fixture

`src/fixtures/index.ts` constructs all page objects. If you renamed a page class or added a new one, update the fixture accordingly:

```typescript
import { MyNewPage } from '../pages/MyNewPage';

interface PageFixtures {
  // ...
  myNewPage: MyNewPage;
}

const test = base.extend<PageFixtures>({
  // ...
  myNewPage: async ({ page }, use) => {
    await use(new MyNewPage(page));
  },
});
```

---

## Step 6 — Write your first real test

Copy an existing example from `examples/` as a starting point. The import path and test structure stay identical — only the page methods and assertions change:

```typescript
import { test, expect } from '../../src/fixtures/index';
import { TestDataFactory } from '../../src/utils/TestDataFactory';

test.describe('Checkout', () => {
  test.beforeEach(async ({ checkoutPage }) => {
    await checkoutPage.navigate();
  });

  test('proceeds to payment', async ({ checkoutPage }) => {
    const paymentPage = await checkoutPage.proceedToPay();
    expect(await paymentPage.isUpiTabVisible()).toBe(true);
  });
});
```

---

## Keeping the mock app

You can keep `mock-app/server.ts` running alongside your tests even when testing a real app — useful for:

- **CI environments** that can't reach a deployed backend
- **Offline development** when the staging environment is down
- **Deterministic failure testing** (the `?fail=true` and `?timeout=true` query params are always available)

Just run both servers and switch `BASE_URL` between them.

---

## Checklist

- [ ] `playwright.config.ts` `webServer` or `BASE_URL` points at your app
- [ ] `src/constants/routes.ts` paths match your app's URLs
- [ ] `src/constants/testData.ts` values match your app's test credentials
- [ ] Page objects in `src/pages/` have updated `SELECTORS`
- [ ] New page objects registered in `src/fixtures/index.ts`
- [ ] `npx tsc --noEmit` passes
- [ ] At least one example runs green against your app
