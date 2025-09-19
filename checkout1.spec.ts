// 📁 tests/checkout1.spec.ts

import { test, expect } from '@playwright/test';
import { CheckoutPage } from './pages/checkout.page';

test.describe('Checkout Page Functionality', () => {

    // This hook runs before each test in this file.
    // It ensures the user is logged in (via storageState) and has an item in their cart.
    test.beforeEach(async ({ page }) => {
        // Step 1: Add an item to the cart.
        // The user is already logged in thanks to global.setup.ts.
        await page.goto('/petrol-brush-cutter-4stroke');
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