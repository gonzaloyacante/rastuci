import { test, expect } from '@playwright/test';

test.describe('Purchase Flow (Guest)', () => {
    test('should allow a user to browse, add to cart and proceed to checkout', async ({ page }) => {
        // 1. Visit Home
        await page.goto('/');
        await expect(page).toHaveTitle(/Rastuci/);

        // 2. Navigate to Products
        await page.click('text=Ver Productos');
        await expect(page.url()).toContain('/productos');

        // 3. Select a Product (first one in grid)
        await page.click('article a');

        // 4. Add to Cart
        // Wait for product details to load
        await expect(page.locator('h1')).toBeVisible();

        const addToCartButton = page.getByRole('button', { name: /agregar al carrito/i });
        await addToCartButton.click();

        // 5. Open Cart Sheet
        // Usually clicking "Adding to cart" triggers a toast or opens the cart. 
        // Assuming we need to manually open it or it opens automatically.
        // Let's click the cart icon in header if needed, but first check if it's open.
        const cartTrigger = page.getByLabel('Abrir carrito');
        await cartTrigger.click();

        // 6. Proceed to Checkout
        const checkoutButton = page.getByRole('link', { name: /iniciar compra/i });
        await expect(checkoutButton).toBeVisible();
        await checkoutButton.click();

        // 7. Verify Checkout Page
        await expect(page.url()).toContain('/checkout');
        await expect(page.getByText('Resumen de compra')).toBeVisible();
    });
});
