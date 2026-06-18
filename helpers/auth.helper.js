/**
 * Auth Helper — Fungsi utilitas untuk login SauceDemo
 */

/**
 * Login sebagai user tertentu
 * @param {import('@playwright/test').Page} page
 * @param {string} username
 * @param {string} password
 */
async function loginAs(page, username, password) {
    await page.goto('/');
    await page.locator('#user-name').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('#login-button').click();
    await page.waitForURL('**/inventory.html');
}

/**
 * Login sebagai standard_user (default)
 * @param {import('@playwright/test').Page} page
 */
async function loginAsStandardUser(page) {
    const email = process.env.TEST_EMAIL || 'standard_user';
    const password = process.env.TEST_PASSWORD || 'secret_sauce';
    await loginAs(page, email, password);
}

/**
 * Logout dari aplikasi via hamburger menu
 * @param {import('@playwright/test').Page} page
 */
async function logout(page) {
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#logout_sidebar_link').click();
    await page.waitForURL('**/');
}

module.exports = { loginAs, loginAsStandardUser, logout };
