import { test, expect } from '@playwright/test';
import { resolveCaseMaterialLinks, searchMaterialsForAdmin, matchMaterialFromText } from '../src/utils/caseMaterialUtils.js';

test.describe('1. Construction Case Material Link Utils Test', () => {
  test('matches PTT8698 correctly', () => {
    const item = {
      material_summary: 'LX하우시스 프레스티지 5T PTT8698 (더스크 브론즈) · 457.2×914.4mm · 5.0T',
      products: {
        id: 106078,
        name: 'LX 프레스티지 5T PTT8698 더스크 브론즈',
        slug: 'decotile-lx-prestige-stone-rect-ptt8698-더스크브론즈',
        product_code: 'PTT8698'
      }
    };
    const links = resolveCaseMaterialLinks(item);
    expect(links.length).toBe(1);
    expect(links[0].isDirectDetail).toBe(true);
    expect(decodeURIComponent(links[0].path)).toContain('PTT8698');
  });

  test('matches KCC TS5534M correctly', () => {
    const item = {
      material_summary: 'KCC 센스타일 트랜디 TS 5534 · 450각/600각 · 3.0T',
      products: {
        id: 100909,
        name: 'TS5534M',
        slug: '데코타일-kcc-kcc_square-ts5534m',
        product_code: 'TS5534M'
      }
    };
    const links = resolveCaseMaterialLinks(item);
    expect(links.length).toBe(1);
    expect(links[0].isDirectDetail).toBe(true);
    expect(decodeURIComponent(links[0].path)).toContain('ts5534m');
  });

  test('matches Dongshin 726 correctly', () => {
    const item = {
      material_summary: '동신 아트타일 726 (AH 726 / AB 726) · 3.0T'
    };
    const links = resolveCaseMaterialLinks(item);
    expect(links.length).toBe(1);
    expect(links[0].isDirectDetail).toBe(true);
    expect(decodeURIComponent(links[0].path)).toContain('ah726');
  });

  test('handles unknown product by falling back to search', () => {
    const item = {
      material_summary: '가상의자재 UNKNOWN999'
    };
    const links = resolveCaseMaterialLinks(item);
    expect(links.length).toBe(1);
    expect(links[0].isDirectDetail).toBe(false);
    expect(links[0].path).toContain('/materials?search=');
  });

  test('handles multiple products separated by comma', () => {
    const item = {
      material_summary: 'KCC 센스타일 트랜디 TS5534M, 동신 아트타일 6740'
    };
    const links = resolveCaseMaterialLinks(item);
    expect(links.length).toBe(2);
    expect(decodeURIComponent(links[0].path)).toContain('ts5534m');
    expect(decodeURIComponent(links[1].path)).toContain('ab6740');
  });

  test('searches materials for admin autocomplete', () => {
    const results = searchMaterialsForAdmin('TS5534', 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].code).toContain('TS 5534');
  });
});

test.describe('2. Header Menu and Cases Page UI Integration', () => {
  test('PC Header has 시공사례 menu and navigates to /cases', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Check PC Header nav link
    const caseLink = page.locator('nav.header-menu-links a[href="/cases"]');
    await expect(caseLink).toBeVisible();
    await expect(caseLink).toHaveText('시공사례');

    // Click link and navigate
    await caseLink.click();
    await page.waitForURL('**/cases');

    // Verify active class on cases link
    await expect(caseLink).toHaveClass(/active/);

    // Verify page content
    const heading = page.locator('.banner-content h1');
    await expect(heading).toHaveText('시공사례');
  });

  test('Tablet drawer has 시공사례 menu in hamburger drawer', async ({ page }) => {
    await page.setViewportSize({ width: 850, height: 1000 });
    await page.goto('/');

    // Open hamburger drawer
    const toggleBtn = page.locator('.mobile-menu-toggle');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    const drawerCaseLink = page.locator('.mobile-nav-drawer .drawer-link:has-text("시공사례")');
    await expect(drawerCaseLink).toBeVisible();

    await drawerCaseLink.click();
    await page.waitForURL('**/cases');
  });

  test('/cases page renders clickable material links that navigate to product detail', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/cases');

    // Wait for cards to load
    const cards = page.locator('.case-portfolio-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // Find clickable material links
    const materialLinks = page.locator('.case-material-link');
    const count = await materialLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Verify at least one link has direct detail url
    const firstHref = await materialLinks.first().getAttribute('href');
    expect(firstHref).toMatch(/^\/materials\//);

    // Click the first link and verify navigation to detail page
    await materialLinks.first().click();
    await page.waitForURL('**/materials/**');
  });
});

