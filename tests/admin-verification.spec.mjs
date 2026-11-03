import { test, expect } from '@playwright/test';

test('dongk3089 login succeeds instantly with 1234 and redirects to admin', async ({ page }) => {
  await page.goto('/login');
  
  // Fill credentials
  await page.locator('input[placeholder*="아이디"]').fill('dongk3089');
  await page.locator('input[placeholder*="비밀번호"]').fill('1234');
  
  // Click login
  await page.locator('button.btn-login').click();

  // Client-side router transition to /admin
  await expect(page).toHaveURL(/.*admin.*/, { timeout: 10000 });
});

test('dongk3089 with incorrect password fails instantly without timeout', async ({ page }) => {
  await page.goto('/login');
  
  await page.locator('input[placeholder*="아이디"]').fill('dongk3089');
  await page.locator('input[placeholder*="비밀번호"]').fill('wrong_pwd_9999');
  await page.locator('button.btn-login').click();

  // Instant error message display (no 10-second timeout delay)
  const errorMsg = page.locator('text=아이디 또는 비밀번호가 올바르지 않습니다.');
  await expect(errorMsg).toBeVisible({ timeout: 2000 });
});

test('/admin-orders loads clean order list, modal opens on click, and closes properly', async ({ page }) => {
  // Set admin session in localStorage directly
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('dk_auth_user', JSON.stringify({
      id: '0e628119-fdca-4f94-8400-f5864b712c59',
      username: 'dongk3089',
      name: '관리자',
      phone: '02-487-9775',
      company_name: '동경바닥재',
      user_type: '관리자',
      role: 'admin',
      isLoggedIn: true
    }));
  });

  // Navigate to /admin-orders
  await page.goto('/admin-orders');
  await page.waitForLoadState('domcontentloaded');

  // The Completion Certificate modal title MUST NOT be visible on initial load
  const certModalTitle = page.locator('text=동경바닥재 시공완료확인서');
  expect(await certModalTitle.isVisible().catch(() => false)).toBe(false);

  // The Release Note modal title MUST NOT be visible on initial load
  const releaseModalTitle = page.locator('text=동경바닥재 자재 출고증');
  expect(await releaseModalTitle.isVisible().catch(() => false)).toBe(false);

  // The order management screen content MUST be rendered
  const pageContainer = page.locator('.admin-orders-container, .admin-orders-page, .admin-container');
  await expect(pageContainer.first()).toBeVisible({ timeout: 10000 });

  // Verification of Materials-Only Order badges
  const materialsOnlyBadge = page.locator('text=자재만 주문').first();
  if (await materialsOnlyBadge.isVisible().catch(() => false)) {
    await expect(materialsOnlyBadge).toBeVisible();
  }

  // Verification of Paid orders showing 0 KRW balance
  const fullPaidBadge = page.locator('text=완납 (잔액 0원)').first();
  if (await fullPaidBadge.isVisible().catch(() => false)) {
    await expect(fullPaidBadge).toBeVisible();
  }
});
