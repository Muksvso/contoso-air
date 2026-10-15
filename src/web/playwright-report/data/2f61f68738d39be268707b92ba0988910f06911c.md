# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking-flow.spec.ts >> End-to-end booking flow >> user can login and book two trips
- Location: tests\booking-flow.spec.ts:18:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Booking confirmed')
Expected: visible
Error: strict mode violation: getByText('Booking confirmed') resolved to 2 elements:
    1) <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">Booking confirmed</h1> aka getByRole('heading', { name: 'Booking confirmed' })
    2) <div role="alert" aria-live="assertive" id="__next-route-announcer__">Booking confirmed</div> aka locator('[id="__next-route-announcer__"]')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Booking confirmed')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e7]:
      - img [ref=e8]
    - generic [ref=e11]:
      - button "Open issues overlay" [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: "0"
          - generic [ref=e15]: "1"
        - generic [ref=e16]: Issue
      - button "Collapse issues badge" [ref=e17]:
        - img [ref=e18]
  - banner [ref=e20]:
    - navigation "Main" [ref=e21]:
      - link "Contoso Air Home" [ref=e23] [cursor=pointer]:
        - /url: /
        - img "Contoso Air" [ref=e24]
      - list [ref=e25]:
        - listitem [ref=e26]:
          - link "Book" [ref=e27] [cursor=pointer]:
            - /url: /book
        - listitem [ref=e28]:
          - link "My Booked" [ref=e29] [cursor=pointer]:
            - /url: /booked
        - listitem [ref=e30]:
          - button "Hi, User" [ref=e31]
  - main [ref=e32]:
    - generic [ref=e33]:
      - generic [ref=e34]:
        - heading "Booking confirmed" [level=1] [ref=e35]
        - paragraph [ref=e36]: Your reservation is complete. A confirmation email will arrive shortly.
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e40]:
              - generic [ref=e41]:
                - paragraph [ref=e42]: Booking reference
                - paragraph [ref=e43]:
                  - generic [ref=e44]: OAIHIE
              - generic [ref=e45]:
                - paragraph [ref=e46]: Total paid
                - paragraph [ref=e47]: $378.00
            - generic [ref=e48]:
              - generic [ref=e49]:
                - generic [ref=e50]:
                  - paragraph [ref=e51]: OUTBOUND
                  - paragraph [ref=e52]: "Seat: 10D"
                - generic [ref=e53]:
                  - generic [ref=e54]:
                    - paragraph [ref=e55]: LAX
                    - paragraph [ref=e56]: Los Angeles, CA
                    - paragraph [ref=e57]: 12:00 AM
                  - generic [ref=e58]: →
                  - generic [ref=e59]:
                    - paragraph [ref=e60]: HNL
                    - paragraph [ref=e61]: Honolulu, HI
                    - paragraph [ref=e62]: 03:30 AM
              - generic [ref=e63]:
                - generic [ref=e64]:
                  - paragraph [ref=e65]: RETURN
                  - paragraph [ref=e66]: "Seat: 13A"
                - generic [ref=e67]:
                  - generic [ref=e68]:
                    - paragraph [ref=e69]: HNL
                    - paragraph [ref=e70]: Honolulu, HI
                    - paragraph [ref=e71]: 12:00 AM
                  - generic [ref=e72]: →
                  - generic [ref=e73]:
                    - paragraph [ref=e74]: LAX
                    - paragraph [ref=e75]: Los Angeles, CA
                    - paragraph [ref=e76]: 04:00 AM
          - generic [ref=e77]:
            - button "Home" [ref=e78]
            - button "Book another" [ref=e79]
        - generic [ref=e80]:
          - heading "Receipt" [level=2] [ref=e81]
          - list [ref=e82]:
            - listitem [ref=e83]:
              - generic [ref=e84]: Base fare
              - generic [ref=e85]: $321.30
            - listitem [ref=e86]:
              - generic [ref=e87]: Taxes & fees
              - generic [ref=e88]: $56.70
            - listitem [ref=e89]:
              - generic [ref=e90]: Total paid
              - generic [ref=e91]: $378.00
          - paragraph [ref=e92]: Your credit card was not really charged. This is a demo app 😉
  - button "Open chat" [ref=e94]:
    - img [ref=e97]
    - generic [ref=e99]: Open chat
  - alert [ref=e100]: Booking confirmed
```

# Test source

```ts
  1  | import { test, expect, Page } from '@playwright/test';
  2  | 
  3  | // Helper to select a flight by flight number.
  4  | async function pickFlight(page: Page, flightNumber: string) {
  5  |   const btn = page.getByRole('button', { name: new RegExp(`^${flightNumber} `) }).first();
  6  |   await expect(btn).toBeVisible();
  7  |   await btn.click();
  8  | }
  9  | 
  10 | async function waitForPurchaseEnabled(page: Page) {
  11 |   const purchase = page.getByRole('button', { name: 'Purchase' });
  12 |   await expect(purchase).toBeVisible();
  13 |   await expect(purchase).toBeEnabled();
  14 |   return purchase;
  15 | }
  16 | 
  17 | test.describe('End-to-end booking flow', () => {
  18 |   test('user can login and book two trips', async ({ page }) => {
  19 |     await page.goto('/');
  20 | 
  21 |     // Go to login
  22 |     await page.getByRole('link', { name: 'Login' }).click();
  23 | 
  24 |     // Fill credentials (auth provider accepts anything currently)
  25 |     await page.getByLabel('Username').fill('User');
  26 |     await page.getByLabel('Password').fill('123');
  27 |     await page.getByRole('button', { name: 'Sign in' }).click();
  28 | 
  29 |     // Wait for greeting (ensures auth context updated)
  30 |     await expect(page.getByRole('button', { name: /Hi, / })).toBeVisible();
  31 | 
  32 |     // After login redirect start booking
  33 |     await page.goto('/book');
  34 | 
  35 |     // First trip LAX -> HNL
  36 |     await page.getByLabel('From').selectOption('LAX');
  37 |     await page.getByLabel('To', { exact: true }).selectOption('HNL');
  38 |     await page.getByLabel('Depart date').fill('2025-09-09');
  39 |     await page.getByLabel('Return date').fill('2025-09-26');
  40 |     await page.getByRole('button', { name: 'Find flights' }).click();
  41 |     // Wait for flights to render
  42 |     await expect(page.getByRole('button', { name: /^CA123 / })).toBeVisible();
  43 | 
  44 |     // Pick outbound (CA123) and return (CA789)
  45 |     await pickFlight(page, 'CA123');
  46 |     await pickFlight(page, 'CA789');
  47 |     await page.getByRole('button', { name: 'Continue' }).click();
  48 |     const purchase1 = await waitForPurchaseEnabled(page);
  49 |     await purchase1.click();
  50 | 
  51 |     // Ensure booking is confirmed
> 52 |     await expect(page.getByText('Booking confirmed')).toBeVisible();
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  53 | 
  54 |     // Go to booked list
  55 |     await page.getByRole('link', { name: 'My Booked' }).click();
  56 | 
  57 |     // Back home via brand link
  58 |     await page.getByRole('link', { name: 'Contoso Air Home' }).click();
  59 | 
  60 |     // Second trip LAX -> CDG (these labels differ slightly on landing hero component)
  61 |     // Hero uses aria-label Departure date / Return date
  62 |     await page.getByLabel('From').selectOption('LAX');
  63 |     await page.getByLabel('To', { exact: true }).selectOption('CDG');
  64 |     await page.getByLabel('Departure date').fill('2025-09-30');
  65 |     await page.getByLabel('Return date').fill('2025-10-10');
  66 |     await page.getByRole('button', { name: 'Search Flights' }).click();
  67 |     await expect(page.getByRole('button', { name: /^CA202 / })).toBeVisible();
  68 | 
  69 |     await pickFlight(page, 'CA202');
  70 |     await pickFlight(page, 'CA101');
  71 |     await page.getByRole('button', { name: 'Continue' }).click();
  72 |     const purchase2 = await waitForPurchaseEnabled(page);
  73 |     await purchase2.click();
  74 | 
  75 |     await page.getByRole('link', { name: 'My Booked' }).click();
  76 | 
  77 |     // Assert greeting shows user (desktop navbar)
  78 |     await expect(page.getByRole('button', { name: /Hi, User|Hi, Traveler/ })).toBeVisible();
  79 |   });
  80 | });
  81 | 
```