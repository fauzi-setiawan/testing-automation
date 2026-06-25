const { test, expect } = require('@playwright/test');

test.describe('Authentication Module', () => {
    let baseURL;
    let testEmail;
    let testPassword;

    test.beforeAll(() => {
        baseURL = process.env.BASE_URL || 'https://practicesoftwaretesting.com/';
        testEmail = process.env.TEST_EMAIL || 'fauzisetiawan75@gmail.com';
        testPassword = process.env.TEST_PASSWORD || 'Uji12345.';
    });

    test.beforeEach(async ({ page }) => {
        // Go to login page
        await page.goto(baseURL + '#/auth/login');
    });

    test('[TC-PST-AUTH-001] Login dengan kredensial valid', async ({ page }) => {
        await page.locator('[data-test="email"]').fill(testEmail);
        await page.locator('[data-test="password"]').fill(testPassword);
        await page.locator('[data-test="login-submit"]').click();
        
        // Assert redirect to My Account or Account details
        await expect(page).toHaveURL(/.*\/account/);
        await expect(page.locator('[data-test="nav-menu"]')).toContainText('fauzisetiawan75');
    });

    test('[TC-PST-AUTH-002] Login dengan password yang salah', async ({ page }) => {
        await page.locator('[data-test="email"]').fill(testEmail);
        await page.locator('[data-test="password"]').fill('WrongPassword123!');
        await page.locator('[data-test="login-submit"]').click();

        // Assert error message
        const errorAlert = page.locator('[data-test="login-error"]');
        await expect(errorAlert).toBeVisible();
        await expect(errorAlert).toContainText('Invalid email or password');
    });

    test('[TC-PST-AUTH-003] Login dengan field kosong', async ({ page }) => {
        await page.locator('[data-test="login-submit"]').click();

        // Assert validation error
        await expect(page.locator('[data-test="email-error"]')).toBeVisible();
        await expect(page.locator('[data-test="password-error"]')).toBeVisible();
    });

    test('[TC-PST-AUTH-004] Register akun baru valid', async ({ page }) => {
        await page.goto(baseURL + '#/auth/register');

        const uniqueEmail = `testuser${Date.now()}@test.com`;

        await page.locator('[data-test="first-name"]').fill('Test');
        await page.locator('[data-test="last-name"]').fill('User');
        await page.locator('[data-test="dob"]').fill('1990-01-01');
        await page.locator('[data-test="address"]').fill('123 Test Street');
        await page.locator('[data-test="postcode"]').fill('12345');
        await page.locator('[data-test="city"]').fill('Test City');
        await page.locator('[data-test="state"]').fill('Test State');
        await page.locator('[data-test="country"]').selectOption('US');
        await page.locator('[data-test="phone"]').fill('1234567890');
        await page.locator('[data-test="email"]').fill(uniqueEmail);
        await page.locator('[data-test="password"]').fill('ValidPass123!');
        await page.locator('[data-test="register-submit"]').click();

        // Assert registration success, usually redirected to login
        await expect(page).toHaveURL(/.*\/auth\/login/);
    });
});
