# NetworkInterceptor

`src/utils/NetworkInterceptor.ts` wraps Playwright's `page.route()` API with named methods for the most common payment testing scenarios. Use it to simulate gateway failures, timeouts, and custom responses without changing the server.

---

## Setup

`networkInterceptor` is a built-in fixture — it's already wired into the test context and cleaned up automatically after each test.

```typescript
import { test, expect } from '../../src/fixtures/index';

test('gateway failure', async ({ networkInterceptor, upiPage }) => {
  // set up interception BEFORE the action that triggers the request
  await networkInterceptor.interceptPaymentFailure('Gateway declined');
  // ... drive the UI
});
```

---

## API

### `interceptPaymentSuccess()`

Intercepts all `POST /payment/*` requests and returns a success JSON body. Useful when you want to skip real processing and just assert the success page.

```typescript
await networkInterceptor.interceptPaymentSuccess();
```

### `interceptPaymentFailure(reason: string)`

Intercepts all `POST /payment/*` requests and returns a failure JSON body with the given reason.

```typescript
await networkInterceptor.interceptPaymentFailure('Insufficient funds');
```

### `interceptGatewayTimeout()`

Intercepts `POST /payment/*` and aborts the request after 30 seconds — simulates a gateway that never responds.

```typescript
await networkInterceptor.interceptGatewayTimeout();
```

> **Note:** Pair this with a reduced `page.setDefaultTimeout()` or `expect(..., { timeout: 5000 })` so your test doesn't hang for 30 seconds.

### `interceptWithCustomResponse(urlPattern, body, status?)`

The escape hatch — intercept any URL pattern with any JSON body and HTTP status.

```typescript
await networkInterceptor.interceptWithCustomResponse(
  /\/api\/validate-vpa/,
  { valid: false, message: 'VPA not registered' },
  422
);
```

### `removeAllInterceptors()`

Clears all active route handlers. Called automatically after each test via fixture teardown, but call it manually mid-test if you need to remove an interceptor before the next action.

```typescript
await networkInterceptor.removeAllInterceptors();
```

---

## Pattern: force a failure via URL rewrite

When the server uses redirects instead of JSON responses (like the mock app does), inject `?fail=true` into the request URL rather than returning a JSON override:

```typescript
test('forced failure via query param', async ({ page, upiPage }) => {
  await page.route('**/payment/upi', async (route) => {
    await route.continue({ url: route.request().url() + '?fail=true' });
  });

  const otpPage     = await upiPage.enterVpa('user@upi').then(p => p.pay());
  const resultPage  = await otpPage.enterOtp('123456').then(p => p.submit());

  expect(resultPage).toBeInstanceOf(FailurePage);
});
```

---

## Interceptors and test isolation

Each interceptor is scoped to the fixture's `page` instance. Because Playwright creates a fresh page per test by default, interceptors from one test cannot bleed into another — but you should still call `removeAllInterceptors()` in tests that install multiple interceptors during a single test body.
