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
  // await page.pause(); // <-- ✅ REMOVE OR COMMENT OUT THIS LINE
  
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