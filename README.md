# Playwright Payment E2E Starter

[![CI](https://github.com/nagasrinath/plawright_framework.ts/actions/workflows/e2e.yml/badge.svg)](https://github.com/nagasrinath/plawright_framework.ts/actions/workflows/e2e.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Playwright](https://img.shields.io/badge/playwright-1.44-purple)](https://playwright.dev)

A production-grade **Playwright + TypeScript** end-to-end test framework for payment flows. Clone it, point it at your app, and get full browser automation with Page Object Model, typed fixtures, network interception, and Allure reporting out of the box.

---

## What's included

- **Mock payment app** — a self-contained Express server that simulates checkout, UPI, net banking, OTP, success/failure, and subscription flows. Use it to run examples immediately, then replace it with your own app.
- **Page Object Model** — one class per page, all extending a typed `BasePage`. No raw `page.click()` calls in test code.
- **Custom Playwright fixtures** — every page object is pre-wired into the test context. Just destructure and go.
- **TestDataFactory** — static factory methods for VPAs, OTPs, coupons, bank names, and transaction IDs.
- **NetworkInterceptor** — intercept and mock any request pattern in a single call.
- **Allure + HTML reporting** — structured test reports with screenshots, videos, and traces on failure.
- **Three-browser CI matrix** — Chromium, Firefox, WebKit via GitHub Actions.
- **Docker support** — compose file runs the mock app and test runner together.

---

## Prerequisites

- Node.js ≥ 20
- npm ≥ 9

---

## Quick start

```bash
git clone https://github.com/your-org/playwright-payment-e2e-starter.git
cd playwright-payment-e2e-starter
npm install
npx playwright install chromium          # or --with-deps for all browsers
npm test                                 # runs all examples against the mock app
```

The `webServer` config in `playwright.config.ts` starts the mock app automatically before the test run.

---

## Project structure

```
playwright-payment-e2e-starter/
│
├── mock-app/
│   └── server.ts              # Express mock payment server (port 3000)
│
├── src/                       # THE FRAMEWORK — extend this for your app
│   ├── pages/
│   │   ├── BasePage.ts        # Abstract base — all page objects extend this
│   │   ├── CheckoutPage.ts
│   │   ├── PaymentOptionsPage.ts
│   │   ├── UpiPage.ts
│   │   ├── NetBankingPage.ts
│   │   ├── OtpPage.ts
│   │   ├── SuccessPage.ts
│   │   ├── FailurePage.ts
│   │   └── SubscriptionPage.ts
│   ├── fixtures/
│   │   └── index.ts           # Extended test object — import { test, expect } from here
│   ├── utils/
│   │   ├── NetworkInterceptor.ts
│   │   ├── TestDataFactory.ts
│   │   └── ApiHelper.ts
│   ├── types/
│   │   └── index.ts           # PaymentMethod, BankName, PaymentStatus, etc.
│   └── constants/
│       ├── routes.ts          # All URL paths in one place
│       └── testData.ts        # OTPs, coupons, VPAs, bank list
│
├── examples/                  # Usage examples — each file shows a real pattern
│   ├── checkout/
│   │   ├── happy-path.spec.ts
│   │   └── validation.spec.ts
│   ├── upi/
│   │   ├── upi-payment.spec.ts
│   │   └── upi-failure.spec.ts
│   ├── netbanking/
│   │   └── netbanking.spec.ts
│   ├── subscription/
│   │   └── subscription.spec.ts
│   └── regression/
│       └── smoke.spec.ts      # Full E2E journeys tagged @smoke
│
├── docs/
│   ├── writing-page-objects.md
│   ├── network-interceptor.md
│   └── adapting-to-your-app.md
│
├── .github/workflows/
│   └── e2e.yml                # CI: lint → 3-browser matrix → Allure to GitHub Pages
├── playwright.config.ts
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Core concepts

### BasePage

Every page object extends `BasePage` (`src/pages/BasePage.ts`). It wraps raw Playwright actions so test code never calls `page.click()` directly:

```typescript
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async click(selector: string): Promise<void>
  async fill(selector: string, value: string): Promise<void>
  async getText(selector: string): Promise<string>
  async waitForElement(selector: string): Promise<void>
  async waitForNavigation(url: string | RegExp): Promise<void>
  // ...
}
```

Page objects expose **action methods** that return the next page, making flows chainable and type-safe:

```typescript
const successPage = await checkoutPage
  .proceedToPay()
  .then(p => p.selectUpi())
  .then(p => p.enterVpa('user@upi').then(u => u.pay()))
  .then(p => p.enterOtp('123456').then(o => o.submit()));
```

### Custom fixtures

All test files import `test` and `expect` from `src/fixtures/index.ts`, not from `@playwright/test` directly. This gives every test access to pre-constructed page objects:

```typescript
import { test, expect } from '../../src/fixtures/index';

test('checkout loads', async ({ checkoutPage }) => {
  await checkoutPage.navigate();
  expect(await checkoutPage.getPageHeading()).toBe('Order Summary');
});
```

Available fixtures: `checkoutPage`, `paymentOptionsPage`, `upiPage`, `netBankingPage`, `otpPage`, `successPage`, `failurePage`, `subscriptionPage`, `networkInterceptor`.

### TestDataFactory

Static methods for all test inputs — no magic strings in spec files:

```typescript
import { TestDataFactory } from '../../src/utils/TestDataFactory';

TestDataFactory.validUpiVpa()    // 'testuser@upi'
TestDataFactory.validOtp()       // '123456'
TestDataFactory.invalidOtp()     // '000000'
TestDataFactory.validCoupon()    // 'SAVE10'
TestDataFactory.bankName()       // random from ['HDFC','SBI','ICICI','AXIS','KOTAK']
TestDataFactory.transactionId()  // 'TXNABC12345'
```

### NetworkInterceptor

Mock any request pattern without touching the server:

```typescript
test('shows failure when gateway times out', async ({ networkInterceptor, upiPage }) => {
  await networkInterceptor.interceptPaymentFailure('Gateway timeout');
  // ... drive the UI, assert failure page
});
```

See [`docs/network-interceptor.md`](docs/network-interceptor.md) for the full API.

---

## Examples walkthrough

### Checkout — coupon and proceed

```typescript
// examples/checkout/happy-path.spec.ts
test('valid coupon shows discounted total', async ({ checkoutPage }) => {
  await checkoutPage.navigate();
  await checkoutPage.applyCoupon(TestDataFactory.validCoupon());
  expect(await checkoutPage.isCouponSuccessVisible()).toBe(true);
});
```

### Full UPI payment

```typescript
// examples/upi/upi-payment.spec.ts
test('UPI happy path', async ({ checkoutPage }) => {
  const paymentOptionsPage = await checkoutPage.proceedToPay();
  const upiPage           = await paymentOptionsPage.selectUpi();
  const otpPage           = await upiPage.enterVpa(TestDataFactory.validUpiVpa()).then(p => p.pay());
  const successPage       = await otpPage.enterOtp(TestDataFactory.validOtp()).then(p => p.submit()) as SuccessPage;

  expect(await successPage.getTransactionId()).toMatch(/^TXN/);
  expect(await successPage.getPaymentMethod()).toBe('UPI');
});
```

### Subscription cancel

```typescript
// examples/subscription/subscription.spec.ts
test('cancel subscription', async ({ subscriptionPage }) => {
  await subscriptionPage.navigate();
  await subscriptionPage.cancelSubscription();   // opens modal
  await subscriptionPage.confirmCancel();         // submits
  expect(await subscriptionPage.getPlanStatus()).toBe('CANCELLED');
});
```

---

## How to adapt to your own app

See [`docs/adapting-to-your-app.md`](docs/adapting-to-your-app.md) for the full walkthrough. The short version:

1. **Replace the mock server** — point `playwright.config.ts` `webServer.url` at your real app, or keep the mock for isolated testing.
2. **Update `src/constants/routes.ts`** — replace paths with your app's routes.
3. **Update `src/constants/testData.ts`** — replace OTPs, VPAs, coupons with values your app accepts.
4. **Rewrite page objects in `src/pages/`** — keep extending `BasePage`; update selectors to match your UI. Each page object only needs two things: private `SELECTORS` constants and public action methods.
5. **Update fixtures** in `src/fixtures/index.ts` — add or remove page fixtures to match your new page objects.
6. **Write your own examples** in `examples/` — follow the same `import { test, expect } from '../../src/fixtures/index'` pattern.

---

## How to add a new page object

```typescript
// src/pages/MyNewPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyNewPage extends BasePage {
  private readonly SELECTORS = {
    SUBMIT_BTN: '[data-testid="submit"]',
    RESULT:     '[data-testid="result"]',
  } as const;

  constructor(page: Page) { super(page); }

  async navigate(): Promise<void> {
    await this.navigateTo('/my-route');
  }

  async submit(): Promise<void> {
    await this.click(this.SELECTORS.SUBMIT_BTN);
    await this.waitForNavigation(/\/next-page/);
  }

  async getResult(): Promise<string> {
    return this.getText(this.SELECTORS.RESULT);
  }
}
```

Then add it to the fixtures in `src/fixtures/index.ts`:

```typescript
myNewPage: async ({ page }, use) => {
  await use(new MyNewPage(page));
},
```

See [`docs/writing-page-objects.md`](docs/writing-page-objects.md) for the complete guide.

---

## Scripts reference

| Script | What it does |
|--------|-------------|
| `npm test` | Run all examples across configured browsers |
| `npm run test:chromium` | Chromium only |
| `npm run test:smoke` | Tests tagged `@smoke` only |
| `npm run test:headed` | Open browser window while running |
| `npm run start:mock-app` | Start the Express mock server on port 3000 |
| `npm run lint` | ESLint on `src/` and `examples/` |
| `npm run format` | Prettier on all files |
| `npm run report` | Generate and open Allure HTML report |
| `npm run docker:up` | Build and start everything via Docker Compose |
| `npm run docker:test` | Run examples inside Docker against the mock app |

---

## CI/CD

`.github/workflows/e2e.yml` runs on every push to `main` and on pull requests:

1. **lint** — ESLint + `tsc --noEmit`
2. **test** — matrix across `chromium`, `firefox`, `webkit` in parallel
3. **report** — merges Allure results and publishes to GitHub Pages (main branch only)

Set the `BASE_URL` environment variable in CI to point the runner at a deployed environment instead of the mock app:

```yaml
env:
  BASE_URL: https://staging.yourapp.com
```

---

## Docker

```bash
# Build and run everything — mock app + Playwright in one command
npm run docker:up

# Run only the test runner against a running mock app
npm run docker:test
```

The `docker-compose.yml` uses a healthcheck on the mock app so the Playwright container waits until the server is ready before starting tests.

---

## Reporting

After a test run, raw Allure data is written to `allure-results/`. To view it:

```bash
npm run report
```

This generates `allure-report/` and opens it in your browser. The CI workflow publishes the report to GitHub Pages automatically on merges to `main`.

On failure, Playwright captures:
- **Screenshot** at the point of failure
- **Video** of the full test run
- **Trace** on first retry (open with `npx playwright show-trace`)

---

## License

[MIT](LICENSE)
