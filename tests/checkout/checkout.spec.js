// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAsStandardUser } = require('../../helpers/auth.helper');

test.describe('Checkout Module — SauceDemo', () => {

    // Helper: tambah item dan navigasi ke checkout
    async function addItemsAndGoToCheckout(page) {
        await page.locator('#add-to-cart-sauce-labs-backpack').click();   // $29.99
        await page.locator('#add-to-cart-sauce-labs-bike-light').click(); // $9.99
        await page.locator('.shopping_cart_link').click();
        await page.locator('#checkout').click();
    }

    test.beforeEach(async ({ page }) => {
        await loginAsStandardUser(page);
    });

    // ═══════════════════════════════════════════════════════════
    // CHECKOUT STEP ONE — VALIDASI FORM
    // ═══════════════════════════════════════════════════════════

    test('TC-CHK-001: Error saat semua field kosong', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#continue').click();

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText('Error: First Name is required');
    });

    test('TC-CHK-002: Error saat Last Name kosong', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#first-name').fill('John');
        await page.locator('#continue').click();

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText('Error: Last Name is required');
    });

    test('TC-CHK-003: Error saat Postal Code kosong', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#first-name').fill('John');
        await page.locator('#last-name').fill('Doe');
        await page.locator('#continue').click();

        const errorMsg = page.locator('[data-test="error"]');
        await expect(errorMsg).toBeVisible();
        await expect(errorMsg).toContainText('Error: Postal Code is required');
    });

    test('TC-CHK-004: Form valid — navigasi ke checkout overview', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#first-name').fill('John');
        await page.locator('#last-name').fill('Doe');
        await page.locator('#postal-code').fill('12345');
        await page.locator('#continue').click();

        await expect(page).toHaveURL(/.*checkout-step-two\.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Overview');
    });

    test('TC-CHK-005: Tombol Cancel kembali ke halaman cart', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#cancel').click();

        await expect(page).toHaveURL(/.*cart\.html/);
    });

    // ═══════════════════════════════════════════════════════════
    // CHECKOUT STEP TWO — OVERVIEW
    // ═══════════════════════════════════════════════════════════

    test('TC-CHK-006: Checkout overview menampilkan ringkasan produk', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#first-name').fill('John');
        await page.locator('#last-name').fill('Doe');
        await page.locator('#postal-code').fill('12345');
        await page.locator('#continue').click();

        // Verifikasi 2 item di overview
        await expect(page.locator('.cart_item')).toHaveCount(2);
        
        // Verifikasi nama produk
        const names = page.locator('.inventory_item_name');
        await expect(names.nth(0)).toHaveText('Sauce Labs Backpack');
        await expect(names.nth(1)).toHaveText('Sauce Labs Bike Light');
    });

    test('TC-CHK-007: Checkout overview — verifikasi payment & shipping info', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#first-name').fill('John');
        await page.locator('#last-name').fill('Doe');
        await page.locator('#postal-code').fill('12345');
        await page.locator('#continue').click();

        // Payment info
        await expect(page.locator('.summary_value_label').first()).toContainText('SauceCard #31337');
        
        // Shipping info
        await expect(page.locator('.summary_value_label').nth(1)).toContainText('Free Pony Express Delivery!');
    });

    test('TC-CHK-008: Checkout overview — verifikasi kalkulasi harga', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#first-name').fill('John');
        await page.locator('#last-name').fill('Doe');
        await page.locator('#postal-code').fill('12345');
        await page.locator('#continue').click();

        // Item total: $29.99 + $9.99 = $39.98
        await expect(page.locator('.summary_subtotal_label')).toContainText('$39.98');

        // Tax: $39.98 × 0.08 = $3.20 (approx)
        await expect(page.locator('.summary_tax_label')).toContainText('$3.20');

        // Total: $39.98 + $3.20 = $43.18
        await expect(page.locator('.summary_total_label')).toContainText('$43.18');
    });

    test('TC-CHK-009: Tombol Cancel di overview kembali ke inventory', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#first-name').fill('John');
        await page.locator('#last-name').fill('Doe');
        await page.locator('#postal-code').fill('12345');
        await page.locator('#continue').click();

        await page.locator('#cancel').click();
        await expect(page).toHaveURL(/.*inventory\.html/);
    });

    // ═══════════════════════════════════════════════════════════
    // CHECKOUT COMPLETE
    // ═══════════════════════════════════════════════════════════

    test('TC-CHK-010: Checkout complete — order berhasil', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#first-name').fill('John');
        await page.locator('#last-name').fill('Doe');
        await page.locator('#postal-code').fill('12345');
        await page.locator('#continue').click();
        await page.locator('#finish').click();

        // Verifikasi halaman checkout complete
        await expect(page).toHaveURL(/.*checkout-complete\.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Complete!');
        await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
        await expect(page.locator('.complete-text')).toContainText('Your order has been dispatched');
    });

    test('TC-CHK-011: Setelah checkout — cart dikosongkan', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#first-name').fill('John');
        await page.locator('#last-name').fill('Doe');
        await page.locator('#postal-code').fill('12345');
        await page.locator('#continue').click();
        await page.locator('#finish').click();

        // Badge cart harus menghilang
        await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
    });

    test('TC-CHK-012: Tombol Back Home kembali ke inventory', async ({ page }) => {
        await addItemsAndGoToCheckout(page);
        await page.locator('#first-name').fill('John');
        await page.locator('#last-name').fill('Doe');
        await page.locator('#postal-code').fill('12345');
        await page.locator('#continue').click();
        await page.locator('#finish').click();
        await page.locator('#back-to-products').click();

        await expect(page).toHaveURL(/.*inventory\.html/);
        await expect(page.locator('.title')).toHaveText('Products');
    });

    // ═══════════════════════════════════════════════════════════
    // END-TO-END CHECKOUT FLOW
    // ═══════════════════════════════════════════════════════════

    test('TC-CHK-013: E2E — Full checkout flow dari awal hingga selesai', async ({ page }) => {
        // 1. Tambah item ke cart dari inventory
        await page.locator('#add-to-cart-sauce-labs-fleece-jacket').click(); // $49.99
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

        // 2. Buka cart
        await page.locator('.shopping_cart_link').click();
        await expect(page.locator('.cart_item')).toHaveCount(1);

        // 3. Checkout step one — isi form
        await page.locator('#checkout').click();
        await page.locator('#first-name').fill('Jane');
        await page.locator('#last-name').fill('Smith');
        await page.locator('#postal-code').fill('10110');
        await page.locator('#continue').click();

        // 4. Checkout overview — verifikasi
        await expect(page.locator('.title')).toHaveText('Checkout: Overview');
        await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Fleece Jacket');
        await expect(page.locator('.summary_subtotal_label')).toContainText('$49.99');

        // 5. Finish
        await page.locator('#finish').click();
        await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');

        // 6. Back to products
        await page.locator('#back-to-products').click();
        await expect(page).toHaveURL(/.*inventory\.html/);
        await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
    });
});
