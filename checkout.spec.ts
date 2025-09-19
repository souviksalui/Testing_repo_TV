import { test, expect } from '@playwright/test';
import { CheckoutPage } from './pages/checkout.page';

const BASE_URL = 'https://testingenv-2021.toolsvilla.in';

test.describe('Checkout Page Functionality', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Set up Authentication
        const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1ODI2NTQyNSwiZXhwIjoxNzYwOTQzODI1fQ.tSZxnkzt2tebqcB0EF4wgOaRtiqccixnLtpjkjC6XRI';
        
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