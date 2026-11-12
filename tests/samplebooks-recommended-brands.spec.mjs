import { test, expect } from '@playwright/test';

test('/samplebooks recommended tab shows only 전체 브랜드, KCC, 동신 brand pills', async ({ page }) => {
  await page.goto('/samplebooks');
  await page.waitForLoadState('domcontentloaded');

  const brandGroup = page.locator('.sb-brand-row, .brand-filter-group, .filter-pills').first();
  await expect(page.getByRole('button', { name: '전체 브랜드' })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: 'KCC', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '동신', exact: true })).toBeVisible();

  // Other brands should NOT appear under 추천 자재
  for (const hiddenBrand of ['LX하우시스', '우성', '동화', '구정', '녹수', '현대', '스완', '이건마루']) {
    await expect(page.getByRole('button', { name: hiddenBrand, exact: true })).toHaveCount(0);
  }

  // Verify filtering works
  await page.getByRole('button', { name: 'KCC', exact: true }).click();
  await expect(page.locator('text=총 1권의 샘플북')).toBeVisible();

  await page.getByRole('button', { name: '동신', exact: true }).click();
  await expect(page.locator('text=총 1권의 샘플북')).toBeVisible();

  await page.getByRole('button', { name: '전체 브랜드', exact: true }).click();
  await expect(page.locator('text=총 2권의 샘플북')).toBeVisible();
});

