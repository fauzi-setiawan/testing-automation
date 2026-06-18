// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAs, loginAsStandardUser, logout } = require('../../helpers/auth.helper');

test.describe('Authentication Module — SauceDemo', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // ═══════════════════════════════════════════════════════════
    // LOGIN VALID
    // ═══════════════════════════════════════════════════════════

    test('TC-AUTH-001: Login dengan kredensial valid (standard_user)', async ({ page }) => {
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();

        await expect(page).toHaveURL(/.*inventory\.html/);
        await expect(page.locator('.title')).toHaveText('Products');
    });

    test('TC-AUTH-002: Verifikasi halaman inventory setelah login', async ({ page }) => {
        await loginAsStandardUser(page);

        // Verifikasi elemen utama halaman inventory
        await expect(page.locator('.app_logo')).toHaveText('Swag Labs');
        await expect(page.locator('.title')).toHaveText('Products');
        await expect(page.locator('.inventory_item')).toHaveCount(6);
    });

    // ═══════════════════════════════════════════════════════════
    // LOGIN INVALID — FIELD KOSONG
    // ═══════════════════════════════════════════════════════════

    test('TC-AUTH-003: Login dengan username kosong', async ({ page }) => {
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText('Epic sadface: Username is required');
    });

    test('TC-AUTH-004: Login dengan password kosong', async ({ page }) => {
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#login-button').click();

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText('Epic sadface: Password is required');
    });

    test('TC-AUTH-005: Login dengan kedua field kosong', async ({ page }) => {
        await page.locator('#login-button').click();

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText('Epic sadface: Username is required');
    });

    // ═══════════════════════════════════════════════════════════
    // LOGIN INVALID — KREDENSIAL SALAH
    // ═══════════════════════════════════════════════════════════

    test('TC-AUTH-006: Login dengan kredensial salah', async ({ page }) => {
        await page.locator('#user-name').fill('invalid_user');
        await page.locator('#password').fill('wrong_password');
        await page.locator('#login-button').click();

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText('Epic sadface: Username and password do not match any user in this service');
    });

    test('TC-AUTH-007: Login dengan username valid tapi password salah', async ({ page }) => {
        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('wrong_password');
        await page.locator('#login-button').click();

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText('do not match any user in this service');
    });

    // ═══════════════════════════════════════════════════════════
    // AKUN TERKUNCI
    // ═══════════════════════════════════════════════════════════

    test('TC-AUTH-008: Login dengan akun terkunci (locked_out_user)', async ({ page }) => {
        await page.locator('#user-name').fill('locked_out_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText('Epic sadface: Sorry, this user has been locked out.');
    });

    // ═══════════════════════════════════════════════════════════
    // PROTEKSI AKSES
    // ═══════════════════════════════════════════════════════════

    test('TC-AUTH-009: Akses langsung ke /inventory.html tanpa login', async ({ page }) => {
        await page.goto('/inventory.html');

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText("You can only access '/inventory.html' when you are logged in");
    });

    test('TC-AUTH-010: Akses langsung ke /cart.html tanpa login', async ({ page }) => {
        await page.goto('/cart.html');

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText("You can only access '/cart.html' when you are logged in");
    });

    // ═══════════════════════════════════════════════════════════
    // LOGOUT
    // ═══════════════════════════════════════════════════════════

    test('TC-AUTH-011: Logout berhasil kembali ke halaman login', async ({ page }) => {
        await loginAsStandardUser(page);

        // Buka hamburger menu & klik Logout
        await page.locator('#react-burger-menu-btn').click();
        await page.locator('#logout_sidebar_link').click();

        // Verifikasi kembali ke halaman login
        await expect(page).toHaveURL(/.*saucedemo\.com\/?$/);
        await expect(page.locator('#login-button')).toBeVisible();
    });
});
