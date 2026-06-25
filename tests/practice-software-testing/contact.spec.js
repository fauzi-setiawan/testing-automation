const { test, expect } = require('@playwright/test');

test.describe('Contact Support Module', () => {
    let baseURL;

    test.beforeAll(() => {
        baseURL = process.env.BASE_URL || 'https://practicesoftwaretesting.com/';
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL + '#/contact');
        await page.waitForSelector('[data-test="contact-submit"]');
    });

    test('[TC-PST-CON-001] Kirim pesan valid', async ({ page }) => {
        await page.locator('[data-test="first-name"]').fill('Test');
        await page.locator('[data-test="last-name"]').fill('User');
        await page.locator('[data-test="email"]').fill('testuser@example.com');
        await page.locator('[data-test="subject"]').selectOption('Customer service');
        await page.locator('[data-test="message"]').fill('This is a test message that needs to be at least fifty characters long to pass validation.');
        
        await page.locator('[data-test="contact-submit"]').click();

        // Verify success alert
        const alert = page.locator('.alert-success, [data-test="contact-success"]');
        if (await alert.count() > 0) {
            await expect(alert).toBeVisible({ timeout: 10000 });
            await expect(alert).toContainText(/Thanks for your message/i);
        }
    });

    test('[TC-PST-CON-002] Kirim form dengan message terlalu pendek', async ({ page }) => {
        await page.locator('[data-test="first-name"]').fill('Test');
        await page.locator('[data-test="last-name"]').fill('User');
        await page.locator('[data-test="email"]').fill('testuser@example.com');
        await page.locator('[data-test="subject"]').selectOption('Customer service');
        
        // Fill message less than 50 characters
        await page.locator('[data-test="message"]').fill('Too short message');
        
        await page.locator('[data-test="contact-submit"]').click();

        // Verify validation error
        const errorMessage = page.locator('[data-test="message-error"]');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText(/must be at least 50 characters/i);
    });
});
