import { test, expect } from '@playwright/test';

test.describe('Nox 2000·3000 Series Price Inquiry (가격문의) Policy Verification', () => {
  test('1. Materials List: NOX 2000 & 3000 products display "가격문의" while Prime 1500 displays numeric price', async ({ page }) => {
    await page.goto('/materials?category=데코타일&brand=녹수');
    await page.waitForLoadState('networkidle');

    // Search for NEH-2613 (에코홈 2000)
    const searchInput = page.locator('.materials-search-input');
    await searchInput.fill('NEH-2613');
    await page.waitForTimeout(600);

    const nehCard = page.locator('.material-card:has-text("NEH-2613")').first();
    await expect(nehCard).toBeVisible();
    await expect(nehCard.locator('.card-price')).toContainText('가격문의');
    // Ensure "0원" is NOT displayed
    await expect(nehCard.locator('.card-price')).not.toContainText('0원');
    await expect(nehCard.locator('.card-price')).not.toContainText('35,000');

    // Search for NOT-3021 (오키드 3000)
    await searchInput.fill('NOT-3021');
    await page.waitForTimeout(600);

    const notCard = page.locator('.material-card:has-text("NOT-3021")').first();
    await expect(notCard).toBeVisible();
    await expect(notCard.locator('.card-price')).toContainText('가격문의');
    await expect(notCard.locator('.card-price')).not.toContainText('0원');
    await expect(notCard.locator('.card-price')).not.toContainText('35,000');

    // Search for NPT-0281 (프라임 1500) -> MUST preserve numeric price (24,000원)
    await searchInput.fill('NPT-0281');
    await page.waitForTimeout(600);

    const nptCard = page.locator('.material-card:has-text("NPT-0281")').first();
    await expect(nptCard).toBeVisible();
    await expect(nptCard.locator('.card-price')).toContainText('24,000원');
  });

  test('2. Product Detail Page: NEH-2613 shows "가격문의" and blocks 0-won checkout', async ({ page }) => {
    await page.goto('/materials/데코타일-녹수-에코홈2000_600각-neh-2613');
    await page.waitForLoadState('networkidle');

    // Price container checks
    const priceCard = page.locator('.showroom-price-card');
    await expect(priceCard).toContainText('가격문의');
    await expect(priceCard).not.toContainText('35,000');
    await expect(priceCard).not.toContainText('0원');

    // Attempt to add to cart or buy now -> should trigger alert preventing 0-won purchase
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    const cartBtn = page.locator('.btn-main-cart');
    await cartBtn.click();
    await page.waitForTimeout(600);

    expect(alertMessage).toContain('가격 확인이 필요한 자재입니다');
  });

  test('3. Product Detail Page: NOT-3021 shows "가격문의" and quotation consultation CTA connects seamlessly', async ({ page }) => {
    await page.goto('/materials/데코타일-녹수-오키드3000_450각-not-3021');
    await page.waitForLoadState('networkidle');

    const priceCard = page.locator('.showroom-price-card');
    await expect(priceCard).toContainText('가격문의');

    // Click "이 자재로 시공 견적 상담" button
    const consultBtn = page.locator('.btn-installation-consult');
    await consultBtn.click();
    await page.waitForLoadState('networkidle');

    // Verify redirected to estimate request page with NOT-3021 preselected in banner
    expect(page.url()).toContain('/estimate/request');
    const selectedMatSection = page.locator('.selected-material-banner-card');
    await expect(selectedMatSection).toBeVisible();
    await expect(selectedMatSection).toContainText('NOT-3021');
    await expect(selectedMatSection).toContainText('오키드3000');
  });

  test('4. Card "견적문의" button seamlessly navigates to estimate request with material info', async ({ page }) => {
    await page.goto('/materials?category=데코타일&brand=녹수');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('.materials-search-input');
    await searchInput.fill('NEH-2613');
    await page.waitForTimeout(600);

    const nehCard = page.locator('.material-card:has-text("NEH-2613")').first();
    const quoteBtn = nehCard.locator('.btn-quote');
    await quoteBtn.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/estimate/request');
    const selectedMatSection = page.locator('.selected-material-banner-card');
    await expect(selectedMatSection).toBeVisible();
    await expect(selectedMatSection).toContainText('NEH-2613');
    await expect(selectedMatSection).toContainText('에코홈2000');
  });
});
