import { test, expect } from '@playwright/test';

test.describe('Search and Filter Flow', () => {
    test('should allow users to search for products', async ({ page }) => {
        await page.goto('/productos');

        // 1. Search for a term
        const searchInput = page.getByPlaceholder(/buscar/i);
        await searchInput.fill('Test');
        await searchInput.press('Enter');

        // 2. Verify results
        // Expect the URL to contain the search query
        await expect(page.url()).toContain('buscar=Test');

        // Expect at least one result (assuming we have test data or simulated API)
        // If mocking is needed, we'll intercept the request in a real scenario.
        // For now, checking UI state.
        const resultsContainer = page.locator('main');
        await expect(resultsContainer).toBeVisible();
    });

    test('should allow users to filter by category', async ({ page }) => {
        await page.goto('/productos');

        // 1. Open Filters panel
        const filtersButton = page.getByRole('button', { name: /filtros/i });
        await filtersButton.click();

        // 2. Select a category from the dropdown
        const categorySelect = page.getByLabel(/categoría/i);
        // Get the second option (first is "Todas")
        // Note: This relies on categories being present. If DB is empty, this might fail or show only "Todas".
        // We assume seed data exists.
        await categorySelect.selectOption({ index: 1 }); // Select second option

        // 3. Verify filter application
        await expect(page.url()).toContain('categoria=');
    });
});
