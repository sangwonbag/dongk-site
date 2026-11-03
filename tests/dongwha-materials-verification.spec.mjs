import { test, expect } from '@playwright/test';

test.describe('동화마루 자재찾기 및 상품 카드 전면 개선 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test('동화마루 라인업 탭, 상품명 중복 제거, 썸네일 cover 검증', async ({ page }) => {
    await page.goto('/materials?category=마루&brand=동화');
    await page.waitForLoadState('networkidle');

    // 1. Check 라인업 탭 명칭: 이상한 중복 텍스트(진테라 진테라 텍..., 클릭 클릭 등)가 없어야 함
    const lineupButtons = page.locator('.materials-lineup-filter button, .material-type-chip');
    const lineupTexts = await lineupButtons.allInnerTexts();
    console.log('Lineup tabs found:', lineupTexts);

    // Verify there are no duplicate combined names
    for (const text of lineupTexts) {
      expect(text).not.toContain('진테라 진테라');
      expect(text).not.toContain('클릭 클릭');
    }

    // 2. Check Product Card Titles: No pipe duplicates like '까사 내추럴 (KANG TEXTURE) | 까사 내추럴'
    const cardTitles = await page.locator('.material-card .card-name').allInnerTexts();
    console.log('First 10 card titles:', cardTitles.slice(0, 10));

    expect(cardTitles.length).toBeGreaterThan(0);
    for (const title of cardTitles) {
      // Must not contain duplicate names joined with pipe
      expect(title).not.toMatch(/(.+)\s*\|\s*\1/i);
      expect(title).not.toContain('(2)');
    }

    // 3. Verify Material Thumbnail object-fit is cover
    const firstThumb = page.locator('.material-card .material-thumb').first();
    await expect(firstThumb).toBeVisible();
    const objectFit = await firstThumb.evaluate(el => window.getComputedStyle(el).objectFit);
    expect(objectFit).toBe('cover');
  });
});

