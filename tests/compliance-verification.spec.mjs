import { test, expect } from '@playwright/test';

test.describe('Legal Policies, Consent & Accessibility Verification', () => {
  test('Footer displays business information and all legal policy links', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer.footer');
    await expect(footer).toBeVisible();

    // Check Business Info
    await expect(footer).toContainText('주식회사 동경바닥재');
    await expect(footer).toContainText('최화선');
    await expect(footer).toContainText('890-88-02243');
    await expect(footer).toContainText('02-487-9775');
    await expect(footer).toContainText('Vercel Inc.');

    // Check 4 Legal Links
    await expect(footer.locator('a[href="/terms-of-service"]')).toBeVisible();
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
    await expect(footer.locator('a[href="/refund-policy"]')).toBeVisible();
    await expect(footer.locator('a[href="/cookie-policy"]')).toBeVisible();
  });

  test('Policy pages load with appropriate titles and contents', async ({ page }) => {
    // 1. Terms of Service
    await page.goto('/terms-of-service');
    await expect(page.locator('.policy-title')).toContainText('서비스 이용약관');

    // 2. Privacy Policy
    await page.goto('/privacy');
    await expect(page.locator('.policy-title')).toContainText('개인정보 처리방침');

    // 3. Refund Policy
    await page.goto('/refund-policy');
    await expect(page.locator('.policy-title')).toContainText('환불·교환·취소정책');
    await expect(page.locator('.policy-content')).toContainText('청약철회');

    // 4. Cookie Policy
    await page.goto('/cookie-policy');
    await expect(page.locator('.policy-title')).toContainText('쿠키 및 스토리지 정책');
  });

  test('Cookie consent banner is rendered and stores preference', async ({ page }) => {
    // Clear localStorage first
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('dk_cookie_consent'));
    await page.reload();

    const banner = page.locator('.cookie-banner-wrapper');
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toContainText('필수 쿠키');

    // Click "모두 수락"
    await page.locator('.cookie-btn-primary').click();
    await expect(banner).not.toBeVisible();

    // Check localStorage
    const saved = await page.evaluate(() => localStorage.getItem('dk_cookie_consent'));
    expect(saved).not.toBeNull();
    expect(JSON.parse(saved).necessary).toBe(true);
  });

  test('Signup requires age 14+ confirmation', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('text=만 14세 이상 이용자 확인')).toBeVisible();
  });

  test('AuthModal closes when Escape key is pressed', async ({ page }) => {
    await page.goto('/');
    // Trigger login modal
    await page.locator('button:has-text("로그인")').first().click();
    const modal = page.locator('.auth-modal-card');
    await expect(modal).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});
