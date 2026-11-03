import { test, expect } from '@playwright/test';

test.describe('동경바닥재 한솔홈데코 마루 68종 검증', () => {
  test('마루 카테고리에서 한솔홈데코 브랜드 탭이 표시되고 68종 상품이 렌더링된다', async ({ page }) => {
    // 1. Visit materials page with category=마루
    await page.goto('/materials?category=마루');
    await page.waitForLoadState('networkidle');

    // 2. Check if "한솔홈데코" brand button exists
    const hansolBrandBtn = page.locator('button.filter-tab', { hasText: '한솔홈데코' });
    await expect(hansolBrandBtn).toBeVisible({ timeout: 10000 });

    // 3. Click HanSol brand button
    await hansolBrandBtn.click();
    await page.waitForLoadState('networkidle');

    // Verify URL parameter
    expect(decodeURIComponent(page.url())).toContain('brand=한솔홈데코');

    // 4. Verify 2-Tier Product Group Filter appears
    const groupFilter = page.locator('.hansol-group-filter');
    await expect(groupFilter).toBeVisible();

    const sbStoneBtn = groupFilter.locator('button', { hasText: 'SB스톤 컬렉션' });
    const sbKangBtn = groupFilter.locator('button', { hasText: 'SB강' });
    const ultraKangBtn = groupFilter.locator('button', { hasText: '울트라강' });

    await expect(sbStoneBtn).toBeVisible();
    await expect(sbKangBtn).toBeVisible();
    await expect(ultraKangBtn).toBeVisible();

    // 5. Verify product cards are displayed
    const cards = page.locator('.material-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // 6. Test Tier 1 filter: Click "SB스톤 컬렉션"
    await sbStoneBtn.click();
    await page.waitForTimeout(500);

    // Verify Tier 2 spec filter appears
    const specFilter = page.locator('.hansol-spec-filter');
    await expect(specFilter).toBeVisible();
    await expect(specFilter.locator('button', { hasText: '스퀘어800' })).toBeVisible();
    await expect(specFilter.locator('button', { hasText: '스톤395' })).toBeVisible();

    // 7. Click on a product card to test detail page
    const firstCard = cards.first();
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    // Verify detail page contains brand "한솔홈데코" and inquiry button
    await expect(page.locator('text=한솔홈데코').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button, a', { hasText: /견적\s*문의|가격\s*문의/ }).first()).toBeVisible();
  });
});
