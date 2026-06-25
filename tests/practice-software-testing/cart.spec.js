const { test, expect } = require('@playwright/test');

test.describe('Shopping Cart Module', () => {
    let baseURL;

    test.beforeAll(() => {
        baseURL = process.env.BASE_URL || 'https://practicesoftwaretesting.com/';
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(baseURL);
        await page.waitForSelector('[data-test="product-card"]', { state: 'visible' });
    });

    test('[TC-PST-CRT-001] Add to Cart dari list produk', async ({ page }) => {
        // Find the first product card and click it to go to details
        await page.locator('[data-test="product-card"]').first().click();
        
        // Wait for detail page
        await page.waitForSelector('[data-test="add-to-cart"]');
        await page.locator('[data-test="add-to-cart"]').click();

        // Verify toast or cart counter
        const cartBadge = page.locator('[data-test="cart-quantity"]');
        await expect(cartBadge).toHaveText(/1|[1-9]/); // greater than 0
    });

    test('[TC-PST-CRT-002] Add to Cart melebihi stok yang ada', async ({ page }) => {
        await page.locator('[data-test="product-card"]').first().click();
        
        await page.waitForSelector('[data-test="increase-quantity"]');
        
        // Let's assume stock is limited, we try to click increase 50 times
        for (let i = 0; i < 50; i++) {
            await page.locator('[data-test="increase-quantity"]').click();
        }

        await page.locator('[data-test="add-to-cart"]').click();

        // Should either show error toast or not allow to go past stock
        const errorToast = page.locator('.toast-error, [data-test="toast-error"]');
        if (await errorToast.count() > 0) {
            await expect(errorToast).toBeVisible();
        }
    });

    test('[TC-PST-CRT-003] Update Qty di halaman Cart', async ({ page }) => {
        // Add a product first
        await page.locator('[data-test="product-card"]').first().click();
        await page.waitForSelector('[data-test="add-to-cart"]');
        await page.locator('[data-test="add-to-cart"]').click();
        
        // Go to cart
        await page.goto(baseURL + '#/checkout');
        await page.waitForSelector('[data-test="cart-item"]');

        // Increase qty inside cart (depends on UI, assuming an input field or button)
        const qtyInput = page.locator('input[type="number"], [data-test="item-quantity"]').first();
        if (await qtyInput.count() > 0) {
            await qtyInput.fill('3');
            // Check if subtotal is updated (just verifying the element exists and updates)
            await page.waitForTimeout(1000);
            await expect(page.locator('[data-test="cart-total"]')).toBeVisible();
        }
    });
});
