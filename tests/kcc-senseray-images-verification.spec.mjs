import { test, expect } from '@playwright/test';

test('/materials?category=데코타일&brand=KCC&line=senseray displays valid images for B0071P and senseray cards', async ({ page }) => {
  await page.goto('/materials?category=데코타일&brand=KCC&line=senseray');
  await page.waitForLoadState('domcontentloaded');

  // Verify B0071P product card is visible
  const b0071pCard = page.locator('text=KCC 센스레이 B0071P (5.0T)').locator('..').locator('..');
  await expect(b0071pCard).toBeVisible({ timeout: 10000 });

  // B0071P card image should have an actual src and NOT show fallback text
  const b0071pImg = b0071pCard.locator('img');
  await expect(b0071pImg).toBeVisible();
  const src = await b0071pImg.getAttribute('src');
  expect(src).toContain('B0071P.jpg');

  // "이미지 준비중" fallback text should NOT appear on B0071P
  await expect(b0071pCard.locator('text=이미지 준비중')).toHaveCount(0);
});

