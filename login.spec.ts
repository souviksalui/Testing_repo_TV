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
//   const className = "login-input";
//  const classSelector = `.${CSS.escape(className)}`; // Results in ".my\\ class"

//   await page.locator(classSelector).fill(phoneNumber);
//   console.log(`Entered phone number: ${phoneNumber}`);
    await page.getByPlaceholder('Mobile Number').fill(phoneNumber);
    console.log(`Entered phone number: ${phoneNumber}`);
// ... existing code ...
//   await page.pause();
    console.log('--- Waiting for 2 seconds before proceeding... ---');
    await page.waitForTimeout(2000); // Wait for 2000 milliseconds (2 seconds)

    // Click the consent checkbox
  const consentCheckbox = page.locator('img[alt="checkbox"]');
  await consentCheckbox.click();

  // 5. Click the "Get OTP" button.
  // Again, using getByRole is more reliable than a long XPath.
//   await page.getByRole('button', { name: 'Get OTP' }).click(); 
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


// // Import the necessary modules from Playwright.
// import { test, expect } from '@playwright/test';

// // Define a test suite for the Toolsvilla login process.
// test.describe('Toolsvilla Login', () => {
//   // Define a single test case for handling the login flow up to the OTP screen.
//   test('should handle login process up to OTP screen and verify', async ({ page }) => {
//     const phoneNumber = "9566068352"; // Your phone number for the test.

//     // 1. Navigate to the Toolsvilla homepage.
//     await page.goto('https://www.toolsvilla.com/');
//     console.log('Navigated to the homepage.');

//     // 2. Click on the Account icon to open the login menu.
//     // Using getByRole is more user-centric and robust than a specific XPath or CSS selector.
//     await page.getByRole('link', { name: 'Account' }).click();
//     console.log('Clicked the Account icon.');

//     // 3. Click the "LOG IN" button in the dropdown menu.
//     await page.getByRole('button', { name: 'LOG IN' }).click();
//     console.log('Clicked the LOG IN button.');

//     // 4. Enter the phone number into the input field.
//     // Using getByPlaceholder is more reliable than a class name which might be used elsewhere.
//     await page.getByPlaceholder('Enter Mobile Number').fill(phoneNumber);
//     console.log(`Entered phone number: ${phoneNumber}`);

//     // 5. Click the "Get OTP" button.
//     // Replaced a brittle, absolute XPath with a much more stable role-based locator.
//     await page.getByRole('button', { name: 'Get OTP' }).click();
//     console.log('Clicked the "Get OTP" button.');

//     // --- Handling the OTP ---
//     // The page.pause() command stops the script and opens the Playwright Inspector.
//     // This allows you to interact with the browser window that Playwright is
//     // controlling. You can manually type the OTP into the input fields on the page.
//     //
//     // Once you've entered the OTP, click the "Resume" button (blue play icon)
//     // in the Playwright Inspector, and the script will proceed.
//     console.log('--- Script paused. Please enter the OTP in the browser and resume from the Inspector. ---');
//     await page.pause();

//     // 6. After resuming, the script will click the "Verify OTP" button.
//     console.log('Resuming script...');
//     // Ensure the name here exactly matches the button text on the website.
//     const verifyOtpButton = page.getByRole('button', { name: 'Verify OTP' });
//     await verifyOtpButton.click();
//     console.log('Clicked the "Verify OTP" button.');

//     // 7. Add a final assertion to verify a successful login.
//     // This example waits for a "My Account" text to be visible, which is a common
//     // indicator of being logged in. Adjust the text as needed for the actual site.
//     // The timeout is increased to give the page time to load after verification.
//     await expect(page.getByText('My Account')).toBeVisible({ timeout: 10000 });
//     console.log('Login verification successful!');
//   });
// });