// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAsStandardUser } = require('../../helpers/auth.helper');

test.describe('Cart Module — SauceDemo', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsStandardUser(page);
    });

    // ═══════════════════════════════════════════════════════════
    // NAVIGASI KE CART
    // ═══════════════════════════════════════════════════════════

    test('TC-CART-001: Navigasi ke halaman cart via ikon shopping cart', async ({ page }) => {
        await page.locator('.shopping_cart_link').click();

        await expect(page).toHaveURL(/.*cart\.html/);
        await expect(page.locator('.title')).toHaveText('Your Cart');
    });

    test('TC-CART-002: Cart kosong menampilkan halaman tanpa item', async ({ page }) => {
        await page.locator('.shopping_cart_link').click();

        await expect(page.locator('.cart_item')).toHaveCount(0);
    });

    // ═══════════════════════════════════════════════════════════
    // ITEM DI CART
    // ═══════════════════════════════════════════════════════════

    test('TC-CART-003: Item yang ditambahkan muncul di halaman cart', async ({ page }) => {
        // Tambah 1 item
        await page.locator('#add-to-cart-sauce-labs-backpack').click();

        // Navigasi ke cart
        await page.locator('.shopping_cart_link').click();

        // Verifikasi item ada
        await expect(page.locator('.cart_item')).toHaveCount(1);
        await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
        await expect(page.locator('.inventory_item_price')).toHaveText('$29.99');
        await expect(page.locator('.cart_quantity')).toHaveText('1');
    });

    test('TC-CART-004: Multiple items tampil di cart', async ({ page }) => {
        // Tambah 3 item
        await page.locator('#add-to-cart-sauce-labs-backpack').click();
        await page.locator('#add-to-cart-sauce-labs-bike-light').click();
        await page.locator('#add-to-cart-sauce-labs-onesie').click();

        // Navigasi ke cart
        await page.locator('.shopping_cart_link').click();

        // Verifikasi 3 item di cart
        await expect(page.locator('.cart_item')).toHaveCount(3);
    });

    test('TC-CART-005: Remove item dari halaman cart', async ({ page }) => {
        // Tambah item
        await page.locator('#add-to-cart-sauce-labs-backpack').click();
        await page.locator('#add-to-cart-sauce-labs-bike-light').click();

        // Navigasi ke cart
        await page.locator('.shopping_cart_link').click();
        await expect(page.locator('.cart_item')).toHaveCount(2);

        // Remove satu item
        await page.locator('#remove-sauce-labs-backpack').click();
        await expect(page.locator('.cart_item')).toHaveCount(1);
        await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Bike Light');
    });

    // ═══════════════════════════════════════════════════════════
    // NAVIGASI DARI CART
    // ═══════════════════════════════════════════════════════════

    test('TC-CART-006: Tombol Continue Shopping kembali ke inventory', async ({ page }) => {
        await page.locator('.shopping_cart_link').click();
        await page.locator('#continue-shopping').click();

        await expect(page).toHaveURL(/.*inventory\.html/);
    });

    test('TC-CART-007: Klik nama item di cart membuka halaman detail', async ({ page }) => {
        await page.locator('#add-to-cart-sauce-labs-backpack').click();
        await page.locator('.shopping_cart_link').click();

        await page.locator('.inventory_item_name').click();

        await expect(page).toHaveURL(/.*inventory-item\.html\?id=4/);
        await expect(page.locator('.inventory_details_name')).toHaveText('Sauce Labs Backpack');
    });

    // ═══════════════════════════════════════════════════════════
    // CHECKOUT NAVIGATION
    // ═══════════════════════════════════════════════════════════

    test('TC-CART-008: Tombol Checkout menuju checkout step one', async ({ page }) => {
        await page.locator('#add-to-cart-sauce-labs-backpack').click();
        await page.locator('.shopping_cart_link').click();
        await page.locator('#checkout').click();

        await expect(page).toHaveURL(/.*checkout-step-one\.html/);
        await expect(page.locator('.title')).toHaveText('Checkout: Your Information');
    });
});
