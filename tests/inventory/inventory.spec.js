// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAsStandardUser } = require('../../helpers/auth.helper');

test.describe('Inventory Module — SauceDemo', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsStandardUser(page);
    });

    // ═══════════════════════════════════════════════════════════
    // TAMPILAN PRODUK
    // ═══════════════════════════════════════════════════════════

    test('TC-INV-001: Menampilkan 6 produk di halaman inventory', async ({ page }) => {
        const items = page.locator('.inventory_item');
        await expect(items).toHaveCount(6);
    });

    test('TC-INV-002: Setiap produk menampilkan nama, deskripsi, harga, dan tombol', async ({ page }) => {
        const firstItem = page.locator('.inventory_item').first();

        await expect(firstItem.locator('.inventory_item_name')).toBeVisible();
        await expect(firstItem.locator('.inventory_item_desc')).toBeVisible();
        await expect(firstItem.locator('.inventory_item_price')).toBeVisible();
        await expect(firstItem.locator('button')).toBeVisible();
    });

    test('TC-INV-003: Verifikasi produk pertama — Sauce Labs Backpack', async ({ page }) => {
        await expect(page.locator('#item_4_title_link .inventory_item_name')).toHaveText('Sauce Labs Backpack');
        await expect(page.locator('#item_4_title_link').locator('..').locator('..').locator('.inventory_item_price')).toHaveText('$29.99');
    });

    test('TC-INV-004: Verifikasi semua harga produk tampil dengan format $XX.XX', async ({ page }) => {
        const prices = page.locator('.inventory_item_price');
        const count = await prices.count();

        for (let i = 0; i < count; i++) {
            const text = await prices.nth(i).textContent();
            expect(text).toMatch(/^\$\d+\.\d{2}$/);
        }
    });

    // ═══════════════════════════════════════════════════════════
    // ADD TO CART & REMOVE
    // ═══════════════════════════════════════════════════════════

    test('TC-INV-005: Tambah produk ke cart — tombol berubah ke Remove', async ({ page }) => {
        const addBtn = page.locator('#add-to-cart-sauce-labs-backpack');
        await expect(addBtn).toHaveText('Add to cart');

        await addBtn.click();

        // Tombol berubah menjadi Remove
        const removeBtn = page.locator('#remove-sauce-labs-backpack');
        await expect(removeBtn).toBeVisible();
        await expect(removeBtn).toHaveText('Remove');
    });

    test('TC-INV-006: Remove produk dari cart — tombol kembali ke Add to cart', async ({ page }) => {
        // Tambah dulu
        await page.locator('#add-to-cart-sauce-labs-backpack').click();
        // Hapus
        await page.locator('#remove-sauce-labs-backpack').click();

        // Tombol kembali ke Add to cart
        const addBtn = page.locator('#add-to-cart-sauce-labs-backpack');
        await expect(addBtn).toBeVisible();
        await expect(addBtn).toHaveText('Add to cart');
    });

    test('TC-INV-007: Badge cart bertambah saat menambah item', async ({ page }) => {
        // Cart badge awalnya tidak ada
        await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);

        // Tambah 1 item
        await page.locator('#add-to-cart-sauce-labs-backpack').click();
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

        // Tambah 1 item lagi
        await page.locator('#add-to-cart-sauce-labs-bike-light').click();
        await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
    });

    test('TC-INV-008: Badge cart berkurang saat remove item', async ({ page }) => {
        // Tambah 2 item
        await page.locator('#add-to-cart-sauce-labs-backpack').click();
        await page.locator('#add-to-cart-sauce-labs-bike-light').click();
        await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

        // Hapus 1 item
        await page.locator('#remove-sauce-labs-backpack').click();
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

        // Hapus item terakhir — badge menghilang
        await page.locator('#remove-sauce-labs-bike-light').click();
        await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
    });

    // ═══════════════════════════════════════════════════════════
    // SORTING
    // ═══════════════════════════════════════════════════════════

    test('TC-INV-009: Sorting default — Name (A to Z)', async ({ page }) => {
        const names = page.locator('.inventory_item_name');
        const firstItem = await names.first().textContent();
        const lastItem = await names.last().textContent();

        expect(firstItem).toBe('Sauce Labs Backpack');
        expect(lastItem).toBe('Test.allTheThings() T-Shirt (Red)');
    });

    test('TC-INV-010: Sorting — Name (Z to A)', async ({ page }) => {
        await page.locator('.product_sort_container').selectOption('za');

        const names = page.locator('.inventory_item_name');
        const firstItem = await names.first().textContent();
        const lastItem = await names.last().textContent();

        expect(firstItem).toBe('Test.allTheThings() T-Shirt (Red)');
        expect(lastItem).toBe('Sauce Labs Backpack');
    });

    test('TC-INV-011: Sorting — Price (low to high)', async ({ page }) => {
        await page.locator('.product_sort_container').selectOption('lohi');

        const prices = page.locator('.inventory_item_price');
        const firstPrice = await prices.first().textContent();
        const lastPrice = await prices.last().textContent();

        expect(firstPrice).toBe('$7.99');   // Sauce Labs Onesie
        expect(lastPrice).toBe('$49.99');   // Sauce Labs Fleece Jacket
    });

    test('TC-INV-012: Sorting — Price (high to low)', async ({ page }) => {
        await page.locator('.product_sort_container').selectOption('hilo');

        const prices = page.locator('.inventory_item_price');
        const firstPrice = await prices.first().textContent();
        const lastPrice = await prices.last().textContent();

        expect(firstPrice).toBe('$49.99');  // Sauce Labs Fleece Jacket
        expect(lastPrice).toBe('$7.99');    // Sauce Labs Onesie
    });

    // ═══════════════════════════════════════════════════════════
    // DETAIL PRODUK
    // ═══════════════════════════════════════════════════════════

    test('TC-INV-013: Klik nama produk — buka halaman detail', async ({ page }) => {
        await page.locator('#item_4_title_link').click();

        await expect(page).toHaveURL(/.*inventory-item\.html\?id=4/);
        await expect(page.locator('.inventory_details_name')).toHaveText('Sauce Labs Backpack');
        await expect(page.locator('.inventory_details_price')).toHaveText('$29.99');
    });

    test('TC-INV-014: Tombol Back to products kembali ke inventory', async ({ page }) => {
        await page.locator('#item_4_title_link').click();
        await page.locator('#back-to-products').click();

        await expect(page).toHaveURL(/.*inventory\.html/);
        await expect(page.locator('.inventory_item')).toHaveCount(6);
    });

    test('TC-INV-015: Add to cart dari halaman detail sinkron ke inventory', async ({ page }) => {
        // Buka detail produk
        await page.locator('#item_4_title_link').click();

        // Add to cart dari halaman detail
        await page.locator('#add-to-cart').click();
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

        // Kembali ke inventory — tombol harus Remove
        await page.locator('#back-to-products').click();
        await expect(page.locator('#remove-sauce-labs-backpack')).toBeVisible();
    });

    // ═══════════════════════════════════════════════════════════
    // HAMBURGER MENU
    // ═══════════════════════════════════════════════════════════

    test('TC-INV-016: Hamburger menu — All Items navigasi ke inventory', async ({ page }) => {
        // Navigasi ke cart dulu
        await page.locator('.shopping_cart_link').click();
        await expect(page).toHaveURL(/.*cart\.html/);

        // Buka menu → All Items
        await page.locator('#react-burger-menu-btn').click();
        await page.locator('#inventory_sidebar_link').click();

        await expect(page).toHaveURL(/.*inventory\.html/);
    });

    test('TC-INV-017: Hamburger menu — Reset App State mengosongkan cart', async ({ page }) => {
        // Tambah item ke cart
        await page.locator('#add-to-cart-sauce-labs-backpack').click();
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

        // Reset app state
        await page.locator('#react-burger-menu-btn').click();
        await page.locator('#reset_sidebar_link').click();

        // Badge harus menghilang (mungkin perlu reload)
        await page.reload();
        await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
    });
});
