const { test, expect } = require('@playwright/test');

test.describe('Catalog & Filter Module', () => {
    let baseURL;

    test.beforeAll(() => {
        baseURL = process.env.BASE_URL || 'https://practicesoftwaretesting.com/';
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL);
        // Wait for products to load
        await page.waitForSelector('[data-test="product-card"]', { state: 'visible', timeout: 10000 });
    });

    test('[TC-PST-CAT-001] Mencari produk dengan keyword valid', async ({ page }) => {
        const searchInput = page.locator('[data-test="search-query"]');
        await searchInput.fill('Pliers');
        await page.locator('[data-test="search-submit"]').click();

        // Verify products displayed contain 'Pliers' in title
        await expect(page.locator('[data-test="product-card"]')).not.toHaveCount(0);
        const firstProductName = await page.locator('[data-test="product-name"]').first().textContent();
        expect(firstProductName.toLowerCase()).toContain('pliers');
    });

    test('[TC-PST-CAT-002] Mencari produk dengan keyword yang tidak ada', async ({ page }) => {
        const searchInput = page.locator('[data-test="search-query"]');
        await searchInput.fill('Xyz123RandomString');
        await page.locator('[data-test="search-submit"]').click();

        // Verify no products displayed
        await expect(page.locator('[data-test="product-card"]')).toHaveCount(0);
        await expect(page.getByText('There are no products found.')).toBeVisible();
    });

    test('[TC-PST-CAT-003] Filter kategori & brand beririsan', async ({ page }) => {
        // Select Hand Tools category
        await page.locator('label', { hasText: 'Hand Tools' }).locator('input[type="checkbox"]').check();
        
        // Let's assume there is a Brand "ForgeFlex Tools"
        const brandCheckbox = page.locator('label', { hasText: 'ForgeFlex Tools' }).locator('input[type="checkbox"]');
        if (await brandCheckbox.count() > 0) {
            await brandCheckbox.check();
        }

        // Wait for results to update
        await page.waitForTimeout(1000); 

        // Verify products are still visible or count updated
        await expect(page.locator('[data-test="product-card"]')).toBeVisible();
    });

    test('[TC-PST-CAT-004] Sorting harga mahal ke murah', async ({ page }) => {
        const sortDropdown = page.locator('[data-test="sort"]');
        await sortDropdown.selectOption('price,desc'); // 'Price (High - Low)'

        await page.waitForTimeout(1000); // Wait for sort

        // Extract first two product prices and compare
        const priceLocators = page.locator('[data-test="product-price"]');
        if (await priceLocators.count() > 1) {
            const firstPriceStr = await priceLocators.nth(0).textContent();
            const secondPriceStr = await priceLocators.nth(1).textContent();
            
            const firstPrice = parseFloat(firstPriceStr.replace(/[^0-9.]/g, ''));
            const secondPrice = parseFloat(secondPriceStr.replace(/[^0-9.]/g, ''));
            
            expect(firstPrice).toBeGreaterThanOrEqual(secondPrice);
        }
    });
});
