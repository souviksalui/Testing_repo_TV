# Testing_repo_TV
Test scripts for TV

## Playwright

Here's a comprehensive approach and layout for testing the checkout page of https://testingenv-2021.toolsvilla.in/checkout using Playwright, based on the provided screenshot and details.

1. Testing Approach & Strategy
The overall strategy is to simulate a user journey through the checkout process, verifying each component's functionality and ensuring the final order details are accurate. We will use a Page Object Model (POM) to keep the code organized, readable, and maintainable.

Here is a breakdown of the steps:

Setup & Authentication:

Initialize Playwright and a browser context.

Use the provided authorization token to log the user in. This is typically done by setting the token in the browser's localStorage or as a cookie before navigating to the page. This bypasses the need to interact with the login UI, making tests faster and more stable.

Navigation:

Navigate directly to the checkout URL.

Modular Testing:

Divide the test script into logical blocks corresponding to the sections on the page: Shipping Information, Payment Mode, and Order Review.

Assertions:

At each step, use Playwright's assertions (expect) to validate the state of the application. This includes checking visibility of elements, text content, form values, and calculated totals.

End-to-End Test Case:

Create a complete end-to-end test that fills out the form, selects a payment method, modifies the cart, and attempts to proceed, verifying the final amounts.

2. Page Layout (Using Page Object Model)
The Page Object Model (POM) is a design pattern that creates an object repository for web UI elements. It helps to reduce code duplication and improves test maintenance.

We can define a CheckoutPage class that encapsulates all the locators and actions for the checkout page.

CheckoutPage Class Structure
Python

# tests/pages/checkout_page.py

from playwright.sync_api import Page, expect

class CheckoutPage:
    def __init__(self, page: Page):
        self.page = page

        # 1. Shipping Information Locators
        self.name_input = page.locator('input[name="name"]')
        self.phone_input = page.locator('input[name="phone"]')
        self.address_input = page.locator('input[name="address"]') # Assuming a locator
        self.street_input = page.locator('input[name="street_name"]') # Assuming a locator

        # 2. Payment Mode Locators
        self.full_online_payment_radio = page.get_by_text("Full Online Payment")
        self.ten_percent_online_payment_radio = page.get_by_text("10 % Online Payment")
        self.cod_option = page.get_by_text("Cash on Delivery")
        self.redeem_coins_checkbox = page.locator('text=Redeem Your Coins') # Adjust locator

        # 3. Order Review Locators
        self.subtotal_amount = page.locator('//div[text()="Subtotal"]/following-sibling::div') # Example XPath
        self.total_amount_display = page.locator('.total-amount-selector') # Example CSS selector

        # You would add locators for quantity buttons, product rows, etc.
        # For a specific product quantity button:
        self.broadcast10_quantity_increase = page.locator('//div[contains(text(), "Broadcast10")]/..//button[text()="+"]')

    # --- Actions ---
    def fill_shipping_details(self, address, street):
        self.address_input.fill(address)
        self.street_input.fill(street)

    def select_payment_mode(self, mode: str):
        if mode == "full_online":
            self.full_online_payment_radio.click()
        elif mode == "ten_percent_online":
            self.ten_percent_online_payment_radio.click()

    def apply_redeem_coins(self):
        self.redeem_coins_checkbox.click()

    # --- Assertions ---
    def verify_prefilled_data(self, name, phone):
        expect(self.name_input).to_have_value(name)
        expect(self.phone_input).to_have_value(phone)

    def verify_cod_is_disabled(self):
        expect(self.cod_option.locator('..')).to_contain_text("not available on this purchase")
3. Test Case Implementation
Here is an example test file that uses the CheckoutPage class.

test_checkout.py
Python

# tests/test_checkout.py

import re
from playwright.sync_api import Page, expect
from tests.pages.checkout_page import CheckoutPage

# Base URL for the environment
BASE_URL = "https://testingenv-2021.toolsvilla.in"

def test_checkout_flow(page: Page):
    # 1. Set up Authentication using the token
    page.goto(BASE_URL) # Go to the base URL first
    auth_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODE2ODk4OSwiZXhwIjoxNzYwODQ3Mzg5fQ.i767U3fX5-AZYBAj5ojAUwi-a7SDbYNGRrJXqznXSTM'
    page.evaluate(f"window.localStorage.setItem('auth_token', '{auth_token}');") # Adjust key 'auth_token' as needed

    # 2. Navigate to the checkout page
    page.goto(f"{BASE_URL}/checkout")
    checkout_page = CheckoutPage(page)

    # --- Test Steps & Assertions ---

    # 3. Verify Shipping Information is pre-filled
    checkout_page.verify_prefilled_data("Testing purposes", "+91 9566068352")

    # 4. Verify Order Review initial state
    # Expect the subtotal to be correct based on the screenshot
    expect(checkout_page.subtotal_amount).to_have_text("₹68,500.00")

    # 5. Verify Payment Modes
    # Check that "Full Online Payment" is selected by default (Recommended)
    expect(checkout_page.full_online_payment_radio.locator('input[type="radio"]')).to_be_checked()
    # Verify the total reflects the 1.5% discount for this option
    expect(checkout_page.page.get_by_text("₹67472")).to_be_visible()
    # Verify COD is disabled
    checkout_page.verify_cod_is_disabled()

    # 6. Interact with the page - change quantity
    initial_subtotal_text = checkout_page.subtotal_amount.inner_text()
    # Click the '+' button for "Broadcast10" product
    checkout_page.broadcast10_quantity_increase.click()
    # Wait for the subtotal to update and verify it has increased
    expect(checkout_page.subtotal_amount).not_to_have_text(initial_subtotal_text)
    # The new subtotal should be 68,500 + 2,000 = 70,500
    expect(checkout_page.subtotal_amount).to_have_text("₹70,500.00")

    # 7. Fill in required shipping details
    checkout_page.fill_shipping_details("123 Test House", "Automation Street")

    # 8. Change Payment Mode and verify total changes
    checkout_page.select_payment_mode("ten_percent_online")
    # The total should now revert to the subtotal amount without the discount
    expect(checkout_page.page.get_by_text("₹70500")).to_be_visible() # The full amount without discount

    # 9. (Optional) Test redeeming coins and verify discount is applied
    # This would require locating the total amount and checking that it decreases

    # Final step would be to click a "Place Order" or "Proceed to Payment" button
    # page.locator('button:has-text("Place Order")').click()
    # expect(page).to_have_url(re.compile(r".*/payment-gateway")) # Assert navigation to next page
Summary of Key Test Scenarios
Form Validation: Attempt to submit the form with empty required address fields and assert that validation messages appear.

Payment Mode Logic: Cycle through each available payment option and verify that the "Order Review" section updates with the correct totals, discounts, and payment breakdowns.

Cart Modification: Test both increasing (+) and decreasing (-) item quantities in the "Order Review" and confirm the subtotal and grand total update in real-time.

Redeem Coins: Toggle the "Redeem Your Coins" option and verify the discount is correctly applied to the final amount.

Responsiveness (Optional): Run tests across different viewport sizes (desktop, tablet, mobile) to check for layout issues.








need to have like this , explain how will i integrate above files in this



Show thinking
Of course! It looks like your project is set up with TypeScript, which is great. My previous explanation was a general approach using Python as an example, but we can easily integrate the same logic into your TypeScript project structure.

Here’s how you can create the checkout test, following the same organized Page Object Model (POM) pattern you see in professional test suites.

## Step 1: Create the Page Object File
First, let's create a file to manage all the locators and actions for the checkout page. This keeps your actual test file clean and easy to read.

Inside your tests folder, create a new folder named pages.

Inside tests/pages, create a new file named checkout.page.ts.

Paste this code into checkout.page.ts:

TypeScript

// 📁 tests/pages/checkout.page.ts

import { type Page, type Locator, expect } from '@playwright/test';

export class CheckoutPage {
    // Class properties to hold the page object and locators
    readonly page: Page;
    
    // Shipping Information Locators
    readonly nameInput: Locator;
    readonly phoneInput: Locator;
    readonly flatHouseInput: Locator;
    readonly streetNameInput: Locator;

    // Payment Mode Locators
    readonly fullOnlinePaymentRadio: Locator;
    readonly tenPercentOnlinePaymentRadio: Locator;
    readonly codNotAvailableText: Locator;
    
    // Order Review Locators
    readonly subtotalAmount: Locator;
    readonly totalAmountHeader: Locator; // The amount next to "Full Online Payment"

    constructor(page: Page) {
        this.page = page;

        // Initialize locators using the page object
        this.nameInput = page.locator('input[placeholder="Name*"]');
        this.phoneInput = page.locator('input[placeholder="Phone Number*"]');
        this.flatHouseInput = page.locator('input[placeholder="Flat/ House no./ Floor/ Building*"]');
        this.streetNameInput = page.locator('input[placeholder="Street Name/ Area/ Colony*"]');
        
        this.fullOnlinePaymentRadio = page.getByText('Full Online Payment');
        this.tenPercentOnlinePaymentRadio = page.getByText('10 % Online Payment');
        this.codNotAvailableText = page.getByText('COD is not available on this purchase.');

        // Using a more robust locator for the subtotal
        this.subtotalAmount = page.locator('div.w-full.py-2.border-b > div.flex.justify-between').filter({ hasText: 'Subtotal' }).locator('span').nth(1);
        this.totalAmountHeader = page.locator('div[class*="border-green-500"]').locator('h1');
    }

    // --- Reusable Actions ---

    async fillShippingDetails(flat: string, street: string) {
        await this.flatHouseInput.fill(flat);
        await this.streetNameInput.fill(street);
    }

    async selectPaymentMode(mode: 'full' | 'partial') {
        if (mode === 'full') {
            await this.fullOnlinePaymentRadio.click();
        } else {
            await this.tenPercentOnlinePaymentRadio.click();
        }
    }

    // --- Reusable Assertions ---

    async verifyPrefilledData(name: string, phone: string) {
        await expect(this.nameInput).toHaveValue(name);
        await expect(this.phoneInput).toHaveValue(phone);
    }
}
## Step 2: Create the Test Spec File
Now, create the actual test file that will use the CheckoutPage object you just defined.

Inside your tests folder, create a new file named checkout.spec.ts.

Paste this code into checkout.spec.ts:

TypeScript

// 📁 tests/checkout.spec.ts

import { test, expect } from '@playwright/test';
import { CheckoutPage } from './pages/checkout.page'; // Import the page object

const BASE_URL = 'https://testingenv-2021.toolsvilla.in';

test.describe('Checkout Page Functionality', () => {

    // This block runs before each test in this file
    test.beforeEach(async ({ page }) => {
        // 1. Set up Authentication using the token
        const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODE2ODk4OSwiZXhwIjoxNzYwODQ0Mzg5fQ.i767U3fX5-AZYBAj5ojAUwi-a7SDbYNGRrJXqznXSTM';
        
        // Go to the base URL to set the token in the browser's context
        await page.goto(BASE_URL);
        
        // Use evaluate to run JavaScript in the browser to set localStorage
        await page.evaluate(token => {
            window.localStorage.setItem('auth_token_received', token); // Key might be different, check browser
        }, authToken);

        // 2. Now navigate to the checkout page as a logged-in user
        await page.goto(`${BASE_URL}/checkout`);
    });

    test('should display correct pre-filled data and order totals', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        // 3. Verify Shipping Information is pre-filled correctly
        await checkoutPage.verifyPrefilledData('Testing purposes', '+91 9566068352');
        
        // 4. Verify initial totals are correct
        await expect(checkoutPage.subtotalAmount).toHaveText('₹68,500.00');
        await expect(checkoutPage.totalAmountHeader).toContainText('₹67472'); // Checks for the discounted total
        
        // 5. Verify COD option is disabled
        await expect(checkoutPage.codNotAvailableText).toBeVisible();
    });

    test('should update total when payment method is changed', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        // Initially, the discounted price is shown
        await expect(checkoutPage.totalAmountHeader).toContainText('₹67472');

        // 6. Change payment mode to "10% Online"
        await checkoutPage.selectPaymentMode('partial');
        
        // 7. Verify the total updates to the non-discounted subtotal amount
        await expect(checkoutPage.totalAmountHeader).toContainText('₹68500');
    });

    test('should allow user to fill shipping address', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillShippingDetails('A-123, Test Apartments', 'Automation Road');

        // 8. Assert that the fields have been filled correctly
        await expect(checkoutPage.flatHouseInput).toHaveValue('A-123, Test Apartments');
        await expect(checkoutPage.streetNameInput).toHaveValue('Automation Road');
    });
});
## Step 3: Run Your New Test
Now you are ready to run the test. Open your terminal in VS Code.

To run only your new checkout test, use this command:

Bash

npx playwright test tests/checkout.spec.ts
To run all tests in your project (including the login and checkout tests):

Bash

npx playwright test
This approach neatly separates the "what to test" (in checkout.spec.ts) from the "how to test it" (in checkout.page.ts), making your automation suite much easier to manage as it grows. 👍







PS C:\Users\USER\Desktop\TV-Playwright> npx playwright test tests/checkout.spec.ts



Running 9 tests using 6 workers

  1) [chromium] › tests\checkout.spec.ts:41:9 › Checkout Page Functionality › should update total when payment method is changed



    Error: expect(locator).toContainText(expected) failed



    Locator: locator('div[class*="border-green-500"]').locator('h1')

    Expected string: "₹67472"

    Received: <element(s) not found>

    Timeout: 5000ms



    Call log:

      - Expect "toContainText" with timeout 5000ms

      - waiting for locator('div[class*="border-green-500"]').locator('h1')





      43 |

      44 |         // Initially, the discounted price is shown

    > 45 |         await expect(checkoutPage.totalAmountHeader).toContainText('₹67472');

         |                                                      ^

      46 |

      47 |         // 6. Change payment mode to "10% Online"

      48 |         await checkoutPage.selectPaymentMode('partial');

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:45:54



    Error Context: test-results\checkout-Checkout-Page-Fun-1d1d8-n-payment-method-is-changed-chromium\error-context.md



  2) [chromium] › tests\checkout.spec.ts:27:9 › Checkout Page Functionality › should display correct pre-filled data and order totals       



    Error: expect(locator).toHaveValue(expected) failed



    Locator: locator('input[placeholder="Name*"]')

    Expected string: "Testing purposes"

    Received: <element(s) not found>

    Timeout: 5000ms



    Call log:

      - Expect "toHaveValue" with timeout 5000ms

      - waiting for locator('input[placeholder="Name*"]')





       at pages\checkout.page.ts:60



      58 |

      59 |     async verifyPrefilledData(name: string, phone: string) {

    > 60 |         await expect(this.nameInput).toHaveValue(name);

         |                                      ^

      61 |         await expect(this.phoneInput).toHaveValue(phone);

      62 |     }

      63 | }

        at CheckoutPage.verifyPrefilledData (C:\Users\USER\Desktop\TV-Playwright\tests\pages\checkout.page.ts:60:38)

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:31:28



    Error Context: test-results\checkout-Checkout-Page-Fun-c037d-illed-data-and-order-totals-chromium\error-context.md



  3) [chromium] › tests\checkout.spec.ts:54:9 › Checkout Page Functionality › should allow user to fill shipping address



    Test timeout of 30000ms exceeded.



    Error: locator.fill: Test timeout of 30000ms exceeded.

    Call log:

      - waiting for locator('input[placeholder="Flat/ House no./ Floor/ Building*"]')





       at pages\checkout.page.ts:45



      43 |

      44 |     async fillShippingDetails(flat: string, street: string) {

    > 45 |         await this.flatHouseInput.fill(flat);

         |                                   ^

      46 |         await this.streetNameInput.fill(street);

      47 |     }

      48 |

        at CheckoutPage.fillShippingDetails (C:\Users\USER\Desktop\TV-Playwright\tests\pages\checkout.page.ts:45:35)

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:57:28



    Error Context: test-results\checkout-Checkout-Page-Fun-9c7b3-er-to-fill-shipping-address-chromium\error-context.md



  4) [firefox] › tests\checkout.spec.ts:54:9 › Checkout Page Functionality › should allow user to fill shipping address



    Test timeout of 30000ms exceeded while running "beforeEach" hook.



       9 |

      10 |     // This block runs before each test in this file

    > 11 |     test.beforeEach(async ({ page }) => {

         |          ^

      12 |         // 1. Set up Authentication using the token

      13 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODE2ODk4OSwiZXhwIjoxNzYwODQ0Mzg5fQ.i767U3fX5-AZYBAj5ojAUwi-a7SDbYNGRrJXqznXSTM';

      14 |

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:11:10



    Error: page.goto: Test timeout of 30000ms exceeded.

    Call log:

      - navigating to "https://testingenv-2021.toolsvilla.in/", waiting until "load"





      14 |

      15 |         // Go to the base URL to set the token in the browser's context

    > 16 |         await page.goto(BASE_URL);

         |                    ^

      17 |

      18 |         // Use evaluate to run JavaScript in the browser to set localStorage

      19 |         await page.evaluate(token => {

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:16:20



    Error Context: test-results\checkout-Checkout-Page-Fun-9c7b3-er-to-fill-shipping-address-firefox\error-context.md



  5) [firefox] › tests\checkout.spec.ts:41:9 › Checkout Page Functionality › should update total when payment method is changed



    Test timeout of 30000ms exceeded while running "beforeEach" hook.



       9 |

      10 |     // This block runs before each test in this file

    > 11 |     test.beforeEach(async ({ page }) => {

         |          ^

      12 |         // 1. Set up Authentication using the token

      13 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODE2ODk4OSwiZXhwIjoxNzYwODQ0Mzg5fQ.i767U3fX5-AZYBAj5ojAUwi-a7SDbYNGRrJXqznXSTM';

      14 |

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:11:10



    Error: page.goto: Test timeout of 30000ms exceeded.

    Call log:

      - navigating to "https://testingenv-2021.toolsvilla.in/", waiting until "load"





      14 |

      15 |         // Go to the base URL to set the token in the browser's context

    > 16 |         await page.goto(BASE_URL);

         |                    ^

      17 |

      18 |         // Use evaluate to run JavaScript in the browser to set localStorage

      19 |         await page.evaluate(token => {

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:16:20



    Error Context: test-results\checkout-Checkout-Page-Fun-1d1d8-n-payment-method-is-changed-firefox\error-context.md



  6) [webkit] › tests\checkout.spec.ts:27:9 › Checkout Page Functionality › should display correct pre-filled data and order totals



    Error: expect(locator).toHaveValue(expected) failed



    Locator: locator('input[placeholder="Name*"]')

    Expected string: "Testing purposes"

    Received: <element(s) not found>

    Timeout: 5000ms



    Call log:

      - Expect "toHaveValue" with timeout 5000ms

      - waiting for locator('input[placeholder="Name*"]')





       at pages\checkout.page.ts:60



      58 |

      59 |     async verifyPrefilledData(name: string, phone: string) {

    > 60 |         await expect(this.nameInput).toHaveValue(name);

         |                                      ^

      61 |         await expect(this.phoneInput).toHaveValue(phone);

      62 |     }

      63 | }

        at CheckoutPage.verifyPrefilledData (C:\Users\USER\Desktop\TV-Playwright\tests\pages\checkout.page.ts:60:38)

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:31:28



    Error Context: test-results\checkout-Checkout-Page-Fun-c037d-illed-data-and-order-totals-webkit\error-context.md



  7) [firefox] › tests\checkout.spec.ts:27:9 › Checkout Page Functionality › should display correct pre-filled data and order totals        



    Test timeout of 30000ms exceeded while running "beforeEach" hook.



       9 |

      10 |     // This block runs before each test in this file

    > 11 |     test.beforeEach(async ({ page }) => {

         |          ^

      12 |         // 1. Set up Authentication using the token

      13 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODE2ODk4OSwiZXhwIjoxNzYwODQ0Mzg5fQ.i767U3fX5-AZYBAj5ojAUwi-a7SDbYNGRrJXqznXSTM';

      14 |

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:11:10



    Error: page.goto: Test timeout of 30000ms exceeded.

    Call log:

      - navigating to "https://testingenv-2021.toolsvilla.in/", waiting until "load"





      14 |

      15 |         // Go to the base URL to set the token in the browser's context

    > 16 |         await page.goto(BASE_URL);

         |                    ^

      17 |

      18 |         // Use evaluate to run JavaScript in the browser to set localStorage

      19 |         await page.evaluate(token => {

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:16:20



    Error Context: test-results\checkout-Checkout-Page-Fun-c037d-illed-data-and-order-totals-firefox\error-context.md



  8) [webkit] › tests\checkout.spec.ts:41:9 › Checkout Page Functionality › should update total when payment method is changed



    Error: expect(locator).toContainText(expected) failed



    Locator: locator('div[class*="border-green-500"]').locator('h1')

    Expected string: "₹67472"

    Received: <element(s) not found>

    Timeout: 5000ms



    Call log:

      - Expect "toContainText" with timeout 5000ms

      - waiting for locator('div[class*="border-green-500"]').locator('h1')





      43 |

      44 |         // Initially, the discounted price is shown

    > 45 |         await expect(checkoutPage.totalAmountHeader).toContainText('₹67472');

         |                                                      ^

      46 |

      47 |         // 6. Change payment mode to "10% Online"

      48 |         await checkoutPage.selectPaymentMode('partial');

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:45:54



    Error Context: test-results\checkout-Checkout-Page-Fun-1d1d8-n-payment-method-is-changed-webkit\error-context.md




Show thinking
Of course. Let's break down these errors and fix them.

The test failures you're seeing all stem from a single root cause: the test is not successfully reaching the checkout page after the login attempt. When Playwright can't find elements like input[placeholder="Name*"] or the page times out, it's a strong sign that you're on the wrong page (likely the login or home page) instead of the checkout page you expect.

This usually happens for one of two reasons: the authentication token isn't being set correctly, or the page needs more time to load and stabilize.

Here is the step-by-step solution.

## 1. Fix the Authentication Logic
The most likely issue is that the application doesn't use 'auth_token_received' as its key in localStorage. You need to find the correct key the website uses.

How to Find the Correct localStorage Key:

Open your browser (e.g., Chrome).

Go to https://testingenv-2021.toolsvilla.in and log in manually.

Right-click on the page and select Inspect to open Developer Tools.

Go to the Application tab.

On the left side, expand Local Storage and select the website's URL.

Look at the list of keys. You will see the key the application uses to store the auth token. It's likely named something like token, auth_token, user, or persist:root.

Let's assume the correct key is auth_token. You need to update your beforeEach hook. We will also add a crucial waitForURL step to ensure the navigation completes before the test proceeds.

## 2. Improve Locators and Add Waits
Your locators are good, but we can make one of them more robust and add an explicit wait to ensure the checkout page is fully loaded before your test tries to find elements. Relying on a specific CSS class like border-green-500 is risky because styling can change. A better way is to find the element relative to the checked radio button.

Here are the complete, corrected files with all the fixes applied.

## 3. The Corrected Code
Simply replace the contents of your two files with the code below.

📁 tests/pages/checkout.page.ts (Updated)
We'll adjust the totalAmountHeader locator to be more reliable.

TypeScript

import { type Page, type Locator, expect } from '@playwright/test';

export class CheckoutPage {
    readonly page: Page;
    
    // Shipping Information Locators
    readonly nameInput: Locator;
    readonly phoneInput: Locator;
    readonly flatHouseInput: Locator;
    readonly streetNameInput: Locator;

    // Payment Mode Locators
    readonly fullOnlinePaymentRadio: Locator;
    readonly tenPercentOnlinePaymentRadio: Locator;
    readonly codNotAvailableText: Locator;
    
    // Order Review Locators
    readonly subtotalAmount: Locator;
    // ⭐ CORRECTION: This locator is now more robust. It finds the <h1> inside
    // the payment option that contains the currently checked radio button.
    readonly totalAmountHeader: Locator; 
    readonly shippingInformationHeader: Locator;

    constructor(page: Page) {
        this.page = page;

        // Locators remain mostly the same, as they are correct.
        this.nameInput = page.locator('input[placeholder="Name*"]');
        this.phoneInput = page.locator('input[placeholder="Phone Number*"]');
        this.flatHouseInput = page.locator('input[placeholder="Flat/ House no./ Floor/ Building*"]');
        this.streetNameInput = page.locator('input[placeholder="Street Name/ Area/ Colony*"]');
        
        this.fullOnlinePaymentRadio = page.getByText('Full Online Payment');
        this.tenPercentOnlinePaymentRadio = page.getByText('10 % Online Payment');
        this.codNotAvailableText = page.getByText('COD is not available on this purchase.');

        this.subtotalAmount = page.locator('div.w-full.py-2.border-b > div.flex.justify-between').filter({ hasText: 'Subtotal' }).locator('span').nth(1);
        
        // ⭐ UPDATED LOCATOR
        this.totalAmountHeader = page.locator('div:has(input[type=radio]:checked) >> h1');

        // A stable element to wait for to ensure the page is loaded
        this.shippingInformationHeader = page.getByRole('heading', { name: 'SHIPPING INFORMATION' });
    }

    // --- Actions (No changes needed here) ---
    async fillShippingDetails(flat: string, street: string) {
        await this.flatHouseInput.fill(flat);
        await this.streetNameInput.fill(street);
    }

    async selectPaymentMode(mode: 'full' | 'partial') {
        if (mode === 'full') {
            await this.fullOnlinePaymentRadio.click();
        } else {
            await this.tenPercentOnlinePaymentRadio.click();
        }
    }

    // --- Assertions (No changes needed here) ---
    async verifyPrefilledData(name: string, phone: string) {
        await expect(this.nameInput).toHaveValue(name);
        await expect(this.phoneInput).toHaveValue(phone);
    }
}
📁 tests/checkout.spec.ts (Updated)
This file has the most important changes in the beforeEach hook.

TypeScript

import { test, expect } from '@playwright/test';
import { CheckoutPage } from './pages/checkout.page';

const BASE_URL = 'https://testingenv-2021.toolsvilla.in';

test.describe('Checkout Page Functionality', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Set up Authentication
        const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODE2ODk4OSwiZXhwIjoxNzYwODQ0Mzg5fQ.i767U3fX5-AZYBAj5ojAUwi-a7SDbYNGRrJXqznXSTM';
        
        await page.goto(BASE_URL);
        
        // ⭐ CORRECTION: Replace 'auth_token' with the actual key you found in dev tools.
        await page.evaluate(token => {
            window.localStorage.setItem('auth_token', token); // <-- UPDATE THIS KEY IF NEEDED
        }, authToken);

        // 2. Navigate to the checkout page
        await page.goto(`${BASE_URL}/checkout`);

        // ⭐ CORRECTION: Add an explicit wait. This ensures the page is fully loaded
        // and you are on the correct URL before any test actions begin.
        await page.waitForURL('**/checkout');
        const checkoutPage = new CheckoutPage(page);
        await expect(checkoutPage.shippingInformationHeader).toBeVisible({ timeout: 10000 }); // Wait up to 10s
    });

    // --- YOUR TESTS (No changes needed below this line) ---

    test('should display correct pre-filled data and order totals', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.verifyPrefilledData('Testing purposes', '+91 9566068352');
        await expect(checkoutPage.subtotalAmount).toHaveText('₹68,500.00');
        await expect(checkoutPage.totalAmountHeader).toContainText('₹67472');
        await expect(checkoutPage.codNotAvailableText).toBeVisible();
    });

    test('should update total when payment method is changed', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await expect(checkoutPage.totalAmountHeader).toContainText('₹67472');
        await checkoutPage.selectPaymentMode('partial');
        await expect(checkoutPage.totalAmountHeader).toContainText('₹68500');
    });

    test('should allow user to fill shipping address', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.fillShippingDetails('A-123, Test Apartments', 'Automation Road');
        await expect(checkoutPage.flatHouseInput).toHaveValue('A-123, Test Apartments');
        await expect(checkoutPage.streetNameInput).toHaveValue('Automation Road');
    });
});
With these changes, your tests should now correctly authenticate, wait for the page to be ready, and use more stable locators to find the elements.







i updated the web_token, updated scripts , got the issues



PS C:\Users\USER\Desktop\TV-Playwright> npx playwright test tests/checkout.spec.ts



Running 9 tests using 6 workers

  1) [chromium] › tests\checkout.spec.ts:48:9 › Checkout Page Functionality › should allow user to fill shipping address



    Error: expect(locator).toBeVisible() failed



    Locator:  getByRole('heading', { name: 'SHIPPING INFORMATION' })

    Expected: visible

    Received: <element(s) not found>

    Timeout:  10000ms



    Call log:

      - Expect "toBeVisible" with timeout 10000ms

      - waiting for getByRole('heading', { name: 'SHIPPING INFORMATION' })





      24 |         await page.waitForURL('**/checkout');

      25 |         const checkoutPage = new CheckoutPage(page);

    > 26 |         await expect(checkoutPage.shippingInformationHeader).toBeVisible({ timeout: 10000 }); // Wait up to 10s

         |                                                              ^

      27 |     });

      28 |

      29 |     // --- YOUR TESTS (No changes needed below this line) ---

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:26:62



    Error Context: test-results\checkout-Checkout-Page-Fun-9c7b3-er-to-fill-shipping-address-chromium\error-context.md



  2) [chromium] › tests\checkout.spec.ts:31:9 › Checkout Page Functionality › should display correct pre-filled data and order totals       



    Test timeout of 30000ms exceeded while running "beforeEach" hook.



       6 | test.describe('Checkout Page Functionality', () => {

       7 |

    >  8 |     test.beforeEach(async ({ page }) => {

         |          ^

       9 |         // 1. Set up Authentication

      10 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';

      11 |

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:8:10



    Error: page.waitForURL: Test timeout of 30000ms exceeded.

    =========================== logs ===========================

    waiting for navigation to "**/checkout" until "load"

    ============================================================



      22 |         // ⭐ CORRECTION: Add an explicit wait. This ensures the page is fully loaded

      23 |         // and you are on the correct URL before any test actions begin.

    > 24 |         await page.waitForURL('**/checkout');

         |                    ^

      25 |         const checkoutPage = new CheckoutPage(page);

      26 |         await expect(checkoutPage.shippingInformationHeader).toBeVisible({ timeout: 10000 }); // Wait up to 10s

      27 |     });

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:24:20



    Error Context: test-results\checkout-Checkout-Page-Fun-c037d-illed-data-and-order-totals-chromium\error-context.md



  3) [chromium] › tests\checkout.spec.ts:40:9 › Checkout Page Functionality › should update total when payment method is changed



    Test timeout of 30000ms exceeded while running "beforeEach" hook.



       6 | test.describe('Checkout Page Functionality', () => {

       7 |

    >  8 |     test.beforeEach(async ({ page }) => {

         |          ^

       9 |         // 1. Set up Authentication

      10 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';

      11 |

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:8:10



    Error: page.waitForURL: Test timeout of 30000ms exceeded.

    =========================== logs ===========================

    waiting for navigation to "**/checkout" until "load"

    ============================================================



      22 |         // ⭐ CORRECTION: Add an explicit wait. This ensures the page is fully loaded

      23 |         // and you are on the correct URL before any test actions begin.

    > 24 |         await page.waitForURL('**/checkout');

         |                    ^

      25 |         const checkoutPage = new CheckoutPage(page);

      26 |         await expect(checkoutPage.shippingInformationHeader).toBeVisible({ timeout: 10000 }); // Wait up to 10s

      27 |     });

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:24:20



    Error Context: test-results\checkout-Checkout-Page-Fun-1d1d8-n-payment-method-is-changed-chromium\error-context.md



  4) [firefox] › tests\checkout.spec.ts:40:9 › Checkout Page Functionality › should update total when payment method is changed



    Test timeout of 30000ms exceeded while running "beforeEach" hook.



       6 | test.describe('Checkout Page Functionality', () => {

       7 |

    >  8 |     test.beforeEach(async ({ page }) => {

         |          ^

       9 |         // 1. Set up Authentication

      10 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';

      11 |

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:8:10



    Error: page.goto: Test timeout of 30000ms exceeded.

    Call log:

      - navigating to "https://testingenv-2021.toolsvilla.in/", waiting until "load"





      10 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';

      11 |

    > 12 |         await page.goto(BASE_URL);

         |                    ^

      13 |

      14 |         // ⭐ CORRECTION: Replace 'auth_token' with the actual key you found in dev tools.

      15 |         await page.evaluate(token => {

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:12:20



    Error Context: test-results\checkout-Checkout-Page-Fun-1d1d8-n-payment-method-is-changed-firefox\error-context.md



  5) [firefox] › tests\checkout.spec.ts:31:9 › Checkout Page Functionality › should display correct pre-filled data and order totals        



    Test timeout of 30000ms exceeded while running "beforeEach" hook.



       6 | test.describe('Checkout Page Functionality', () => {

       7 |

    >  8 |     test.beforeEach(async ({ page }) => {

         |          ^

       9 |         // 1. Set up Authentication

      10 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';

      11 |

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:8:10



    Error: page.goto: Test timeout of 30000ms exceeded.

    Call log:

      - navigating to "https://testingenv-2021.toolsvilla.in/", waiting until "load"





      10 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';

      11 |

    > 12 |         await page.goto(BASE_URL);

         |                    ^

      13 |

      14 |         // ⭐ CORRECTION: Replace 'auth_token' with the actual key you found in dev tools.

      15 |         await page.evaluate(token => {

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:12:20



    Error Context: test-results\checkout-Checkout-Page-Fun-c037d-illed-data-and-order-totals-firefox\error-context.md



  6) [firefox] › tests\checkout.spec.ts:48:9 › Checkout Page Functionality › should allow user to fill shipping address



    Test timeout of 30000ms exceeded while running "beforeEach" hook.



       6 | test.describe('Checkout Page Functionality', () => {

       7 |

    >  8 |     test.beforeEach(async ({ page }) => {

         |          ^

       9 |         // 1. Set up Authentication

      10 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';

      11 |

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:8:10



    Error: page.goto: Test timeout of 30000ms exceeded.

    Call log:

      - navigating to "https://testingenv-2021.toolsvilla.in/", waiting until "load"





      10 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';

      11 |

    > 12 |         await page.goto(BASE_URL);

         |                    ^

      13 |

      14 |         // ⭐ CORRECTION: Replace 'auth_token' with the actual key you found in dev tools.

      15 |         await page.evaluate(token => {

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:12:20



    Error Context: test-results\checkout-Checkout-Page-Fun-9c7b3-er-to-fill-shipping-address-firefox\error-context.md



  7) [webkit] › tests\checkout.spec.ts:48:9 › Checkout Page Functionality › should allow user to fill shipping address



    Error: expect(locator).toBeVisible() failed



    Locator:  getByRole('heading', { name: 'SHIPPING INFORMATION' })

    Expected: visible

    Received: <element(s) not found>

    Timeout:  10000ms



    Call log:

      - Expect "toBeVisible" with timeout 10000ms

      - waiting for getByRole('heading', { name: 'SHIPPING INFORMATION' })





      24 |         await page.waitForURL('**/checkout');

      25 |         const checkoutPage = new CheckoutPage(page);

    > 26 |         await expect(checkoutPage.shippingInformationHeader).toBeVisible({ timeout: 10000 }); // Wait up to 10s

         |                                                              ^

      27 |     });

      28 |

      29 |     // --- YOUR TESTS (No changes needed below this line) ---

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:26:62



    Error Context: test-results\checkout-Checkout-Page-Fun-9c7b3-er-to-fill-shipping-address-webkit\error-context.md



  8) [webkit] › tests\checkout.spec.ts:31:9 › Checkout Page Functionality › should display correct pre-filled data and order totals



    Test timeout of 30000ms exceeded while running "beforeEach" hook.



       6 | test.describe('Checkout Page Functionality', () => {

       7 |

    >  8 |     test.beforeEach(async ({ page }) => {

         |          ^

       9 |         // 1. Set up Authentication

      10 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';

      11 |

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:8:10



    Error: page.waitForURL: Test timeout of 30000ms exceeded.

    =========================== logs ===========================

    waiting for navigation to "**/checkout" until "load"

    ============================================================



      22 |         // ⭐ CORRECTION: Add an explicit wait. This ensures the page is fully loaded

      23 |         // and you are on the correct URL before any test actions begin.

    > 24 |         await page.waitForURL('**/checkout');

         |                    ^

      25 |         const checkoutPage = new CheckoutPage(page);

      26 |         await expect(checkoutPage.shippingInformationHeader).toBeVisible({ timeout: 10000 }); // Wait up to 10s

      27 |     });

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:24:20



    Error Context: test-results\checkout-Checkout-Page-Fun-c037d-illed-data-and-order-totals-webkit\error-context.md



  9) [webkit] › tests\checkout.spec.ts:40:9 › Checkout Page Functionality › should update total when payment method is changed



    Test timeout of 30000ms exceeded while running "beforeEach" hook.



       6 | test.describe('Checkout Page Functionality', () => {

       7 |

    >  8 |     test.beforeEach(async ({ page }) => {

         |          ^

       9 |         // 1. Set up Authentication

      10 |         const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';

      11 |

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:8:10



    Error: page.waitForURL: Test timeout of 30000ms exceeded.

    =========================== logs ===========================

    waiting for navigation to "**/checkout" until "load"

    ============================================================



      22 |         // ⭐ CORRECTION: Add an explicit wait. This ensures the page is fully loaded

      23 |         // and you are on the correct URL before any test actions begin.

    > 24 |         await page.waitForURL('**/checkout');

         |                    ^

      25 |         const checkoutPage = new CheckoutPage(page);

      26 |         await expect(checkoutPage.shippingInformationHeader).toBeVisible({ timeout: 10000 }); // Wait up to 10s

      27 |     });

        at C:\Users\USER\Desktop\TV-Playwright\tests\checkout.spec.ts:24:20



    Error Context: test-results\checkout-Checkout-Page-Fun-1d1d8-n-payment-method-is-changed-webkit\error-context.md





  9 failed

    [chromium] › tests\checkout.spec.ts:31:9 › Checkout Page Functionality › should display correct pre-filled data and order totals        

  9 failed

    [chromium] › tests\checkout.spec.ts:31:9 › Checkout Page Functionality › should display correct pre-filled data and order totals        

    [chromium] › tests\checkout.spec.ts:40:9 › Checkout Page Functionality › should update total when payment method is changed

    [chromium] › tests\checkout.spec.ts:40:9 › Checkout Page Functionality › should update total when payment method is changed

    [chromium] › tests\checkout.spec.ts:48:9 › Checkout Page Functionality › should allow user to fill shipping address

    [chromium] › tests\checkout.spec.ts:48:9 › Checkout Page Functionality › should allow user to fill shipping address

    [firefox] › tests\checkout.spec.ts:31:9 › Checkout Page Functionality › should display correct pre-filled data and order totals

    [firefox] › tests\checkout.spec.ts:40:9 › Checkout Page Functionality › should update total when payment method is changed

    [firefox] › tests\checkout.spec.ts:48:9 › Checkout Page Functionality › should allow user to fill shipping address

    [webkit] › tests\checkout.spec.ts:31:9 › Checkout Page Functionality › should display correct pre-filled data and order totals

    [webkit] › tests\checkout.spec.ts:40:9 › Checkout Page Functionality › should update total when payment method is changed

    [webkit] › tests\checkout.spec.ts:48:9 › Checkout Page Functionality › should allow user to fill shipping address



  Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.

Terminate batch job (Y/N)? y

PS C:\Users\USER\Desktop\TV-Playwright>



I can see you've updated the token and scripts, but you're still facing issues. Let's analyze the new error logs.

The errors have changed slightly, but they still point to the same core problem. The log page.waitForURL: Test timeout of 30000ms exceeded is the key. This means Playwright tried to navigate to /checkout, waited 30 seconds, and the URL never became **/checkout.

This tells us that the application is redirecting the user somewhere else after they visit the /checkout URL. This almost always happens for one of two reasons when testing a checkout flow:

The login is still not working correctly. Even with the new token, the site doesn't consider the user logged in, so it redirects them to the login page.

The user's shopping cart is empty. Most e-commerce sites will redirect you away from the checkout page (e.g., to the homepage or cart page) if you have no items in your cart. Your current script doesn't add any items to the cart before trying to check out.

Based on the logs, the empty cart is the most likely culprit. Let's fix this.

## The Solution: Use a Setup Project for Login
The best practice for handling logins in Playwright is to use a setup project. This is a special test that runs once before all your other tests. It will perform the login, save the authenticated browser state (cookies, local storage, etc.) to a file, and then your actual tests will load this file to start already logged in.

This method is faster, more reliable, and separates your login logic from your test logic.

Here’s how to implement it:

### Step 1: Create a Global Setup File
This file will be responsible for logging in and saving the session.

Create a new file in the root of your project called global.setup.ts.

Paste the following code into global.setup.ts. This script will navigate to the login page, perform the login, and save the storage state.

TypeScript

// 📁 global.setup.ts

import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to the homepage to start the login process
  await page.goto(baseURL!);

  // Perform the login steps
  await page.getByRole('link', { name: 'Account Icon' }).click();
  await page.getByRole('button', { name: 'LOG IN' }).click();
  await page.getByPlaceholder('Your phone number').fill('9566068352');
  await page.getByRole('button', { name: 'GET OTP' }).click();
  
  // Manually solve the OTP for now. You will need to enter it in the terminal.
  await page.pause(); 
  
  // Save the authenticated state to the file
  await page.context().storageState({ path: storageState as string });
  await browser.close();
}

export default globalSetup;
Note: The page.pause() command will pause the test and open an inspector window. This allows you to manually enter the OTP you receive. Once you've entered it and logged in, you can press the "Resume" button in the inspector, and the script will save your login session.

### Step 2: Update the Playwright Config File
Now, you need to tell Playwright to use your new setup file.

Open your playwright.config.ts file.

Add the globalSetup line and configure the storageState in the use block.

TypeScript

// 📁 playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // ⭐ ADD THIS LINE to tell Playwright to run the setup file first
  globalSetup: require.resolve('./global.setup.ts'),

  use: {
    baseURL: 'https://testingenv-2021.toolsvilla.in',
    trace: 'on-first-retry',
    
    // ⭐ ADD THIS LINE to load the saved login state for every test
    storageState: 'playwright/.auth/user.json', 
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // You can add firefox and webkit configs here if needed
  ],
});
### Step 3: Simplify Your Test File
Because the login is now handled automatically, you can remove all the login logic from your beforeEach hook. It's much cleaner!

Open your tests/checkout.spec.ts file.

Replace the contents with the simplified code below.

TypeScript

// 📁 tests/checkout.spec.ts

import { test, expect } from '@playwright/test';
import { CheckoutPage } from './pages/checkout.page';

// The BASE_URL is now set in the config file, so we don't need it here.

test.describe('Checkout Page Functionality', () => {

    // The beforeEach hook is now much simpler!
    test.beforeEach(async ({ page }) => {
        // Since we are logged in, we need to add an item to the cart first.
        // This is a placeholder for adding a product. Replace with actual steps.
        // For example, navigate to a product page and click "Add to Cart".
        await page.goto('/broadcast10'); // Example product page
        await page.getByRole('button', { name: 'Add to Cart' }).click();

        // Now, navigate to the checkout page
        await page.goto('/checkout');
        
        // Wait for the page to be fully loaded
        const checkoutPage = new CheckoutPage(page);
        await expect(checkoutPage.shippingInformationHeader).toBeVisible({ timeout: 15000 });
    });

    // --- YOUR TESTS (No changes needed here) ---

    test('should display correct pre-filled data and order totals', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);
        await checkoutPage.verifyPrefilledData('Testing purposes', '+91 9566068352');
        // Assertions for totals would go here...
    });

    test('should allow user to fill shipping address', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);
        await checkoutPage.fillShippingDetails('A-123, Test Apartments', 'Automation Road');
        await expect(checkoutPage.flatHouseInput).toHaveValue('A-123, Test Apartments');
        await expect(checkoutPage.streetNameInput).toHaveValue('Automation Road');
    });
});
Important: I've added placeholder steps to add an item to the cart in the beforeEach hook. You will need to replace await page.goto('/broadcast10'); and the "Add to Cart" click with the actual steps for your application.

### Step 4: Run the Tests
Now, run your tests again.

The first time you run npx playwright test, the global setup will trigger, and the Playwright inspector will pause for you to enter the OTP.

Enter the OTP and click the "Resume" button. The login state will be saved to playwright/.auth/user.json.

Your checkout tests will now run with a logged-in user who has an item in their cart.

For all subsequent runs, Playwright will reuse the saved auth file, and you won't need to log in again!







i do have the login script login.spec.ts



// Import the necessary modules from Playwright

import { test, expect } from '@playwright/test';

// Define a test for the Toolsvilla login process

test('should handle login process up to OTP screen', async ({ page }) => {

  const phoneNumber = "9566068352"; // Your phone number



  // 1. Go to the homepage

  await page.goto('https://www.toolsvilla.com/');

  console.log('Navigated to the homepage.');



  // 2. Click on the Account icon to open the login menu.

  await page.locator("//div[@class='account-menu dis-flex pl-27']//img[@alt='Account Icon']").click();



  // 3. Click the "LOG IN" button.

  await page.locator("//div[normalize-space()='LOG IN']").click();

  console.log('Clicked the LOG IN button.');



  // 4. Enter the phone number.

//   const className = "login-input";

//  const classSelector = `.${CSS.escape(className)}`; // Results in ".my\\ class"



//   await page.locator(classSelector).fill(phoneNumber);

//   console.log(`Entered phone number: ${phoneNumber}`);

    await page.getByPlaceholder('Mobile Number').fill(phoneNumber);

    console.log(`Entered phone number: ${phoneNumber}`);

// ... existing code ...

//   await page.pause();

    console.log('--- Waiting for 2 seconds before proceeding... ---');

    await page.waitForTimeout(2000); // Wait for 2000 milliseconds (2 seconds)



    // Click the consent checkbox

  const consentCheckbox = page.locator('img[alt="checkbox"]');

  await consentCheckbox.click();



  // 5. Click the "Get OTP" button.

  // Again, using getByRole is more reliable than a long XPath.

//   await page.getByRole('button', { name: 'Get OTP' }).click();

  await page.getByRole('button', { name: 'Get OTP' }).click();

    // console.log('Clicked the "Get OTP" button.');

  console.log('Clicked the "Get OTP" button.');



  // --- Handling the OTP ---

  // In an automated test, you would typically get the OTP from an API or database.

  // For manual testing or debugging, Playwright provides a powerful tool: page.pause().

 

  // When the script reaches page.pause(), it will stop, and the Playwright Inspector

  // will open. This allows you to interact with the browser window that Playwright is

  // controlling. You can manually type the OTP into the input fields on the page.

 

  // Once you've entered the OTP and are ready to continue, you can click the "Resume"

  // button in the Playwright Inspector, and the script will proceed.



  console.log('--- Script paused. Please enter the OTP in the browser. ---');

  await page.pause();



  // 6. After you resume, the script will look for the "Verify OTP" button and click it.

  // You would replace 'Verify OTP' with the actual text on the button.

  console.log('Resuming script...');

  const verifyOtpButton = page.getByRole('button', { name: 'Submit OTP' }); // Adjust name if needed

  await verifyOtpButton.click();

  console.log('Clicked the "Submit OTP" button.');

 

  // 7. Finally, you can add an assertion to verify that the login was successful.

  // For example, you might expect the account icon to change or to be on a new page.

  // This is a placeholder for a successful login check.

  await expect(page.getByText('Login Successfully')).toBeVisible({ timeout: 10000 }); // Example assertion

  console.log('Login appears to be successful!');

});




Show thinking
Excellent! Since you already have a working login script, converting it into a global setup file is very simple. This is the perfect way to do it.

We'll just take the logic from your login.spec.ts, put it into a new global.setup.ts file, and then add one line to save the login session.

### Step 1: Create Your global.setup.ts File
Create a new file in the root of your project named global.setup.ts. Now, copy the logic from your login.spec.ts into this new file, as shown below.

📁 global.setup.ts
This is your login script, adapted to be a setup file. Notice the key line at the end: await page.context().storageState(...).

TypeScript

import { chromium, expect, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Get baseURL and storageState path from the config
  const { baseURL, storageState } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // --- Start: Your login logic from login.spec.ts ---
  const phoneNumber = "9566068352";

  await page.goto(baseURL!);
  console.log('Setup: Navigated to the homepage.');

  await page.locator("//div[@class='account-menu dis-flex pl-27']//img[@alt='Account Icon']").click();
  await page.locator("//div[normalize-space()='LOG IN']").click();
  console.log('Setup: Clicked the LOG IN button.');

  await page.getByPlaceholder('Mobile Number').fill(phoneNumber);
  console.log(`Setup: Entered phone number: ${phoneNumber}`);

  await page.waitForTimeout(2000);
  await page.locator('img[alt="checkbox"]').click();
  await page.getByRole('button', { name: 'Get OTP' }).click();
  console.log('Setup: Clicked the "Get OTP" button.');

  console.log('--- Setup paused. Please enter the OTP in the browser and click Resume. ---');
  await page.pause();
  
  console.log('Setup: Resuming script...');
  const verifyOtpButton = page.getByRole('button', { name: 'Submit OTP' });
  await verifyOtpButton.click();
  
  await expect(page.getByText('Login Successfully')).toBeVisible({ timeout: 10000 });
  console.log('Setup: Login successful!');
  // --- End: Your login logic ---

  // ⭐ **Crucial Step:** Save the authenticated state (cookies, local storage) to a file.
  await page.context().storageState({ path: storageState as string });
  console.log(`Setup: Authentication state saved to ${storageState}`);
  
  await browser.close();
}

export default globalSetup;
### Step 2: Update Your playwright.config.ts
This is the same as before. Make sure your config file tells Playwright to use this new setup file and where to save/load the authentication state from.

📁 playwright.config.ts
TypeScript

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // Tell Playwright to run your new setup file before any tests
  globalSetup: require.resolve('./global.setup.ts'),

  use: {
    baseURL: 'https://testingenv-2021.toolsvilla.in', // Using testing env
    trace: 'on-first-retry',
    
    // Tell all tests to load the saved login state from this file
    storageState: 'playwright/.auth/user.json', 
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
Note: I changed the baseURL to the testingenv-2021 URL to match your checkout page. Your original login script used www.toolsvilla.com.

### Step 3: Simplify Your checkout.spec.ts
Finally, simplify your checkout test. The beforeEach no longer needs any login logic. Its only jobs are to add an item to the cart and navigate to the checkout page.

📁 tests/checkout.spec.ts
TypeScript

import { test, expect } from '@playwright/test';
import { CheckoutPage } from './pages/checkout.page';

test.describe('Checkout Page Functionality', () => {

    test.beforeEach(async ({ page }) => {
        // Step 1: Add an item to the cart to ensure checkout is possible.
        // This is an example for a specific product.
        await page.goto('/spark-plug-for-4-stroke-brush-cutter-engine'); 
        await page.getByRole('button', { name: 'Add to Cart' }).click();
        
        // Wait for the cart confirmation/popup if there is one
        await expect(page.locator('#mini-cart-count')).toContainText('1', { timeout: 10000 });

        // Step 2: Now that the cart is not empty, navigate to checkout.
        await page.goto('/checkout');
        
        // Step 3: Wait for a key element to ensure the page has loaded.
        const checkoutPage = new CheckoutPage(page);
        await expect(checkoutPage.shippingInformationHeader).toBeVisible({ timeout: 15000 });
    });

    test('should display correct pre-filled data', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);
        await checkoutPage.verifyPrefilledData('Testing purposes', '+91 9566068352');
    });

    test('should allow user to fill shipping address', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);
        await checkoutPage.fillShippingDetails('A-123, Test Apartments', 'Automation Road');
        await expect(checkoutPage.flatHouseInput).toHaveValue('A-123, Test Apartments');
        await expect(checkoutPage.streetNameInput).toHaveValue('Automation Road');
    });
});
Now, when you run npx playwright test, it will execute your adapted login script once, save the session, and then run your checkout tests in a fully logged-in state.








where will i set up this global file



Show thinking
You should create the global.setup.ts file in the root directory of your project.

It should be at the same level as your playwright.config.ts, package.json, and tests folder. It is not a test file, so it doesn't go inside the tests directory.

## File Location
Here's how your project structure will look with the new file added:

Plaintext

TV-PLAYWRIGHT/
├── playwright-report/
├── tests/
│   ├── pages/
│   │   └── checkout.page.ts
│   ├── checkout.spec.ts
│   └── login.spec.ts
├── .gitignore
├── global.setup.ts     <-- ✅ CREATE THE FILE HERE
├── package.json
└── playwright.config.ts






my config file already has



import { defineConfig, devices } from '@playwright/test';



/**

 * Read environment variables from file.

 * https://github.com/motdotla/dotenv

 */

// import dotenv from 'dotenv';

// import path from 'path';

// dotenv.config({ path: path.resolve(__dirname, '.env') });



/**

 * See https://playwright.dev/docs/test-configuration.

 */

export default defineConfig({

  testDir: './tests',

  /* Run tests in files in parallel */

  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */

  forbidOnly: !!process.env.CI,

  /* Retry on CI only */

  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */

  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */

  reporter: 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */

  use: {

    /* Base URL to use in actions like `await page.goto('/')`. */

    // baseURL: 'http://localhost:3000',



    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */

    trace: 'on-first-retry',

  },



  /* Configure projects for major browsers */

  projects: [

    {

      name: 'chromium',

      use: { ...devices['Desktop Chrome'] },

    },



    {

      name: 'firefox',

      use: { ...devices['Desktop Firefox'] },

    },



    {

      name: 'webkit',

      use: { ...devices['Desktop Safari'] },

    },



    /* Test against mobile viewports. */

    // {

    //   name: 'Mobile Chrome',

    //   use: { ...devices['Pixel 5'] },

    // },

    // {

    //   name: 'Mobile Safari',

    //   use: { ...devices['iPhone 12'] },

    // },



    /* Test against branded browsers. */

    // {

    //   name: 'Microsoft Edge',

    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },

    // },

    // {

    //   name: 'Google Chrome',

    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },

    // },

  ],



  /* Run your local dev server before starting the tests */

  // webServer: {

  //   command: 'npm run start',

  //   url: 'http://localhost:3000',

  //   reuseExistingServer: !process.env.CI,

  // },

});



where should i add the given script




Show thinking
Of course. You'll add the new lines directly into your existing configuration file.

You need to add the globalSetup property at the top level of the configuration object and add the baseURL and storageState properties inside the existing use block.

## Updated playwright.config.ts
Here is your complete config file with the new lines added and highlighted. You can copy and paste this entire block to replace your current file.

TypeScript

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // ⭐ 1. Add this line to define the global setup file.
  globalSetup: require.resolve('./global.setup.ts'),

  use: {
    // ⭐ 2. Add these two lines inside the 'use' block.
    baseURL: 'https://testingenv-2021.toolsvilla.in',
    storageState: 'playwright/.auth/user.json',

    /* This was your existing setting */
    trace: 'on-first-retry',
  },

  /* Your projects section remains the same */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});






tests/checkout.spec.ts generate this file again fully , name as checkout1



Show thinking
Of course. Here is the complete, updated test file for the checkout page, named checkout1.spec.ts.

This version assumes you are using the global.setup.ts file for logging in. The beforeEach hook is now focused only on adding a product to the cart and then navigating to the checkout page.

## checkout1.spec.ts
TypeScript

// 📁 tests/checkout1.spec.ts

import { test, expect } from '@playwright/test';
import { CheckoutPage } from './pages/checkout.page';

test.describe('Checkout Page Functionality', () => {

    // This hook runs before each test in this file.
    // It ensures the user is logged in (via storageState) and has an item in their cart.
    test.beforeEach(async ({ page }) => {
        // Step 1: Add an item to the cart.
        // The user is already logged in thanks to global.setup.ts.
        await page.goto('/spark-plug-for-4-stroke-brush-cutter-engine');
        await page.getByRole('button', { name: 'Add to Cart' }).click();

        // Optional: Wait for the mini cart icon to show the item has been added.
        await expect(page.locator('#mini-cart-count')).toContainText('1', { timeout: 10000 });

        // Step 2: Now that the cart isn't empty, navigate to the checkout page.
        await page.goto('/checkout');

        // Step 3: Wait for a key element to ensure the page has loaded correctly.
        const checkoutPage = new CheckoutPage(page);
        await expect(checkoutPage.shippingInformationHeader).toBeVisible({ timeout: 15000 });
    });

    // --- Test Cases ---

    test('should display correct pre-filled data and initial totals', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        // Verify user details are pre-filled
        await checkoutPage.verifyPrefilledData('Testing purposes', '+91 9566068352');

        // Verify the initial price is the discounted one
        await expect(checkoutPage.totalAmountHeader).toContainText('₹67472');
    });
    
    test('should update total when payment method is changed', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        // Check the initial discounted total
        await expect(checkoutPage.totalAmountHeader).toContainText('₹67472');

        // Switch to the payment method that has no discount
        await checkoutPage.selectPaymentMode('partial');

        // Verify the total updates to the full, non-discounted amount
        await expect(checkoutPage.totalAmountHeader).toContainText('₹68500');
    });

    test('should allow user to fill shipping address', async ({ page }) => {
        const checkoutPage = new CheckoutPage(page);

        // Fill in the required address fields
        await checkoutPage.fillShippingDetails('A-123, Test Apartments', 'Automation Road');

        // Verify the text was entered correctly
        await expect(checkoutPage.flatHouseInput).toHaveValue('A-123, Test Apartments');
        await expect(checkoutPage.streetNameInput).toHaveValue('Automation Road');
    });
});






it is running headless



Show thinking
Yes, that's correct. By default, Playwright runs tests in headless mode, meaning it runs the browser in the background without opening a visible UI window. This is faster and is the standard for automated tests, especially in CI/CD environments.

If you want to watch your tests run in a regular browser window (known as headed mode), you can easily do so.

## How to Run in Headed Mode
You have two simple options to see the browser during your test run.

1. Use the Command-Line Flag
This is the quickest way to run a test with the browser visible. Just add the --headed flag to your test command.

Bash

npx playwright test --headed
2. Update Your Configuration File
If you want your tests to always run in headed mode locally, you can change the setting in your playwright.config.ts file.

Add headless: false inside the use block.

TypeScript

// playwright.config.ts

export default defineConfig({
  // ... other settings
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://testingenv-2021.toolsvilla.in',
    storageState: 'playwright/.auth/user.json',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    // ⭐ Add this line to always run with a visible browser
    headless: false,
  },
  // ... other settings
});
Using the --headed flag is great for debugging a specific test, while changing the config file is useful for general development. 🖥️







npx playwright test tests/checkout1.spec.ts --headed:chromium



Show thinking
That command is very close! To run a specific test file in headed mode on a single browser, you just need a small syntax correction. The --headed flag and the project name should be separate.

## Correct Command
Here is the corrected command to run your test.

Bash

npx playwright test tests/checkout1.spec.ts --headed --project chromium
### What This Command Does:
npx playwright test tests/checkout1.spec.ts: This tells Playwright to run only the tests within your checkout1.spec.ts file.

--headed: This flag launches a visible browser window so you can watch the test execute. 🖥️

--project chromium: This specifies that the test should run only on the 'chromium' project that you've defined in your playwright.config.ts file.








its not giving me the browser, how to fix this



Show thinking
Based on your screenshot, the good news is that it is working correctly! The browser window is open, but it is likely hidden behind your VS Code window.

## How to Find the Browser Window
The terminal output gives us the clue:

Setup paused. Please enter the OTP in the browser and Click Resume. ---

Resuming script...

This means Playwright has successfully launched the browser in headed mode and has paused the script, waiting for you to take action.

### What to Do:
Check Your Taskbar: Look at the bottom of your screen. You should see a new icon for Chromium, Firefox, or WebKit. Click on it to bring the browser to the front.
2.  Minimize Other Windows: Minimize your VS Code window and any other applications. The Playwright Inspector window (which contains the browser) should be open on your desktop.

Enter the OTP: Once you find the window, type the OTP you received into the input fields on the webpage.

Click Resume: In the Playwright Inspector toolbar, click the "Resume" (▶️) button to continue the test execution.

Your script is doing exactly what you told it to. It's just waiting for you to interact with the visible browser it has opened. 🕵️‍♂️








not working



Show thinking
You are right, it's not working as expected. Thank you for the screenshot with the Task Manager. The process headless shell (4) confirms that Playwright is running a browser, but for some reason, the window is not appearing on your taskbar.

This can sometimes happen with the page.pause() command. Let's use Playwright's dedicated debug mode, which is more reliable for forcing the browser window to appear.

## The Solution: Use the PWDEBUG Flag
We will use a special environment variable called PWDEBUG. This tells Playwright to run in a special headed mode and automatically open the Playwright Inspector, which is a powerful debugging tool.

### Step 1: Remove page.pause()
First, you need to remove or comment out the await page.pause() line from your setup file. The new debug mode will handle pausing for us.

📁 global.setup.ts
TypeScript

// ... inside your globalSetup function

  await page.getByRole('button', { name: 'Get OTP' }).click();
  console.log('Setup: Clicked the "Get OTP" button.');

  // console.log('--- Setup paused. Please enter the OTP in the browser and Click Resume. ---');
  // await page.pause();  // <-- ✅ REMOVE OR COMMENT OUT THIS LINE

  console.log('Setup: Resuming script...');
  const verifyOtpButton = page.getByRole('button', { name: 'Submit OTP' });

// ... rest of the file
### Step 2: Run the Test with the Debug Command
Now, run your test using the following command in your terminal. This command is specifically for Windows.

Bash

set PWDEBUG=1 && npx playwright test
### What Will Happen Next
A new browser window with the Playwright Inspector will open. It is guaranteed to appear. 🖥️

The test will be paused on the very first line.

You can use the "Step Over" button in the Inspector to execute your script line by line.

When your script reaches the point where you need to enter the OTP, you can type it directly into the browser window and then continue stepping through the script to finish the login process.

This method gives you full control over the test execution and is the standard way to debug scripts in Playwright.







set PWDEBUG=1 && npx playwright test , this will run all the test , or should i use specific file name

like this npx playwright test tests/checkout1.spec.ts --headed --project chromium




Show thinking
You are correct. You should use the specific file name.

Running set PWDEBUG=1 && npx playwright test on its own will try to run all of your test files (login.spec.ts, checkout1.spec.ts, etc.) one after the other in debug mode.

To debug only your checkout test, you should specify the file path.

## How to Debug a Specific File
Use this command to target only your checkout test for debugging.

Bash

set PWDEBUG=1 && npx playwright test tests/checkout1.spec.ts
### What This Command Does:
set PWDEBUG=1: This is the most important part. It enables Playwright's debug mode, which opens the Inspector and runs the test in headed mode.

&&: This is a standard Windows command-line operator that runs the next command only if the first one succeeds.

npx playwright test tests/checkout1.spec.ts: This tells Playwright to run only the checkout1.spec.ts file. 🎯

You don't need to add --headed or --project chromium because PWDEBUG=1 already forces the test to run in headed mode.








PS C:\Users\USER\Desktop\TV-Playwright> set PWDEBUG=1 && npx playwright test tests/checkout1.spec.ts           

At line:1 char:15

+ set PWDEBUG=1 && npx playwright test tests/checkout1.spec.ts

+               ~~

The token '&&' is not a valid statement separator in this version.

    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException

    + FullyQualifiedErrorId : InvalidEndOfLine



PS C:\Users\USER\Desktop\TV-Playwright>




Show thinking
You've run into a common issue with Windows terminals. That error happens because you're using PowerShell, which has a slightly different syntax than the older Command Prompt.

PowerShell uses a semicolon (;) to separate commands instead of &&.

## The Correct PowerShell Command
Here is the corrected command that will work in your PowerShell terminal.

PowerShell

$env:PWDEBUG=1; npx playwright test tests/checkout1.spec.ts
### Why this works:
$env:PWDEBUG=1: This is the proper PowerShell syntax for setting an environment variable for the current session.

;: The semicolon is the correct command separator in PowerShell.

Alternatively, you can also just run the commands on two separate lines:

PowerShell

# Press Enter after this first line
$env:PWDEBUG=1

# Then run your test command
npx playwright test tests/checkout1.spec.ts
Both of these methods will correctly start your test in debug mode. 👍
