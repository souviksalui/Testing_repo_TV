// Import the necessary modules from Playwright.
import { test, expect } from '@playwright/test';

// Define a test suite for the Toolsvilla Product Page.
test.describe('Toolsvilla Product Page', () => {

  const productURL = 'https://www.toolsvilla.com/ac-induction-motor-copper-winding';
  const productName = 'AC Induction Motor Copper Winding';

  // This block runs before each test in this suite, navigating to the product page.
  test.beforeEach(async ({ page }) => {
    await page.goto(productURL);
    console.log(`Mapsd to the product page: ${productURL}`);
  });

  // Test case 1: Verify that product details are visible and the item can be added to the cart.
  test('should display product details and allow adding to cart', async ({ page }) => {
    // 1. Verify the product name (heading) is visible.
    await expect(page.getByRole('heading', { name: productName })).toBeVisible();
    console.log('Verified product name is visible.');

    // 2. Verify the price is visible.
    // This locator targets the specific span for the final price.
    await expect(page.locator('.price-final_price .price')).toBeVisible();
    console.log('Verified product price is visible.');

    // 3. Find and click the "Add to Cart" button.
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();
    console.log('Clicked the "Add to Cart" button.');

    // 4. Wait for and verify the success message.
    const successMessage = page.locator('.message-success');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    await expect(successMessage).toContainText(`You added ${productName} to your shopping cart.`);
    console.log('Verified "added to cart" success message.');

    // 5. Open the minicart to proceed to the main cart page.
    await page.locator('[data-block="minicart"]').click();
    console.log('Clicked the minicart icon.');
    
    // 6. Click the "View and Edit Cart" button.
    await page.getByRole('link', { name: 'View and Edit Cart' }).click();
    console.log('Navigated to the cart page.');

    // 7. Verify the product is visible on the cart page.
    await expect(page.locator('.cart.item .product-item-name a').first()).toContainText(productName);
    console.log('Verified the product is present in the cart.');
  });

  // Test case 2: Verify the pincode checker functionality.
  test('should allow checking for pincode availability', async ({ page }) => {
    const pincode = '110001'; // An example pincode for Delhi.

    // 1. Find the pincode input field and verify it's visible.
    const pincodeInput = page.getByPlaceholder('Enter Pincode');
    await expect(pincodeInput).toBeVisible();
    console.log('Pincode input is visible.');

    // 2. Fill the pincode into the input field.
    await pincodeInput.fill(pincode);
    console.log(`Entered pincode: ${pincode}`);

    // 3. Click the "Check" button.
    await page.getByRole('button', { name: 'Check' }).click();
    console.log('Clicked the "Check" button.');

    // 4. Wait for the delivery details to appear and verify the text.
    const deliveryDetails = page.locator('.delivery-details-text');
    await expect(deliveryDetails).toBeVisible({ timeout: 10000 });
    // This checks that some delivery information is shown, which indicates success.
    await expect(deliveryDetails).not.toBeEmpty(); 
    console.log('Verified that delivery details are displayed.');
  });
});
