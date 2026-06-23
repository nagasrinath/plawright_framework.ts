# Writing Page Objects

Every screen in your app gets one page object class that extends `BasePage`. The class owns two things: the selectors for that screen, and the user actions available on it.

---

## Anatomy of a page object

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { NextPage } from './NextPage';          // import the page you navigate TO

export class MyPage extends BasePage {
  // 1. All selectors as private constants — never inline in methods
  private readonly SELECTORS = {
    HEADING:    'h1',
    INPUT:      '[data-testid="my-input"]',
    SUBMIT_BTN: '[data-testid="submit-btn"]',
    ERROR_MSG:  '[data-testid="error-message"]',
  } as const;

  constructor(page: Page) {
    super(page);
  }

  // 2. Navigation method
  async navigate(): Promise<void> {
    await this.navigateTo('/my-route');
  }

  // 3. Action methods — return the next page when navigation occurs
  async fillInput(value: string): Promise<this> {
    await this.fill(this.SELECTORS.INPUT, value);
    return this;                                 // fluent: chaining stays on this page
  }

  async submit(): Promise<NextPage> {
    await this.click(this.SELECTORS.SUBMIT_BTN);
    await this.waitForNavigation(/\/next-route/);
    return new NextPage(this.page);              // hand off to the next page
  }

  // 4. State-reading methods — return values, not void
  async getHeading(): Promise<string> {
    return this.getText(this.SELECTORS.HEADING);
  }

  async isErrorVisible(): Promise<boolean> {
    return this.isVisible(this.SELECTORS.ERROR_MSG);
  }
}
```

---

## Rules

| Rule | Why |
|------|-----|
| All selectors are `private readonly` constants | Changes in markup require only one edit per page, not a grep across test files |
| Action methods return the **next** page object | Navigation is type-safe; tests can't call the wrong page's methods |
| No `page.waitForTimeout()` | Use `waitForNavigation`, `waitForElement`, or `waitForResponse` instead — these wait for a real condition |
| No raw `this.page.click()` calls | Always use the inherited `this.click()` wrapper — it keeps the abstraction layer intact |
| Use `data-testid` attributes as selectors | CSS classes and text change; testids are stable by convention |

---

## Adding the page to fixtures

Open `src/fixtures/index.ts` and add your page to the interface and the `test.extend` block:

```typescript
// 1. Add to the interface
interface PageFixtures {
  // ... existing fixtures ...
  myPage: MyPage;
}

// 2. Add to the extend block
const test = base.extend<PageFixtures>({
  // ... existing fixtures ...
  myPage: async ({ page }, use) => {
    await use(new MyPage(page));
  },
});
```

Now any example file can destructure `{ myPage }` from the test context.

---

## Using it in an example

```typescript
import { test, expect } from '../../src/fixtures/index';

test.describe('My Feature', () => {
  test.beforeEach(async ({ myPage }) => {
    await myPage.navigate();
  });

  test('happy path', async ({ myPage }) => {
    const nextPage = await myPage.fillInput('hello').then(p => p.submit());
    expect(await nextPage.getConfirmationText()).toContain('hello');
  });

  test('shows error on empty input', async ({ myPage }) => {
    await myPage.submit();                       // submit without filling
    expect(await myPage.isErrorVisible()).toBe(true);
  });
});
```

---

## Checklist for a new page object

- [ ] Class extends `BasePage`
- [ ] All selectors declared as `private readonly SELECTORS`
- [ ] `navigate()` method calling `this.navigateTo('/route')`
- [ ] Action methods return `Promise<this>` or `Promise<NextPage>` (never `void` for navigation)
- [ ] State-reading methods return `Promise<string | boolean>`
- [ ] Registered in `src/fixtures/index.ts`
- [ ] At least one example in `examples/` that uses it
