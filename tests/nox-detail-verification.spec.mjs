import { test, expect } from '@playwright/test';

test.describe('Nox NOX 3 Lines (Orchid 3000, Prime 1500, Ecohome 2000) Detail Page & Spec Verification', () => {

  // 1. NOW-3051 (Orchid 3000 Premium Wood, Rustic Edge)
  test('1. Orchid 3000: NOW-3051 renders Rustic Edge, 152.4x914.4mm, 24 pcs, 3.34m2, and price inquiry', async ({ page }) => {
    await page.goto('/materials/데코타일-녹수-오키드3000_프리미엄_우드-now-3051');
    await page.waitForLoadState('networkidle');

    // Title & Breadcrumb
    await expect(page.locator('.showroom-product-title')).toContainText('NOW-3051');
    await expect(page.locator('.product-brand-badge')).toContainText('녹수');
    await expect(page.locator('.product-brand-badge')).toContainText('오키드3000');

    // Showroom card quick specs
    const quickSpecs = page.locator('.quick-tech-specs');
    await expect(quickSpecs).toContainText('152.4 × 914.4mm');
    await expect(quickSpecs).toContainText('3.0T');
    await expect(quickSpecs).toContainText('24장');
    await expect(quickSpecs).toContainText('3.34㎡');

    // Price inquiry
    await expect(page.locator('.showroom-price-card')).toContainText('가격문의');
    await expect(page.locator('.showroom-price-card')).not.toContainText('0원');

    // Features: Rustic Edge
    await expect(page.locator('.doc-section-title', { hasText: '제품 특장점' })).toBeVisible();
    await expect(page.locator('.kcc-features-grid')).toContainText('Rustic Edge 정밀 가공');

    // Structure 5 layers
    await expect(page.getByRole('heading', { name: '제품 구조' })).toBeVisible();
    await expect(page.locator('.kcc-structure-cards-grid')).toContainText('EPT™ Shield');
    await expect(page.locator('.kcc-structure-cards-grid')).toContainText('EMT™ Core');

    // Comparison table: current row highlighted
    const comparisonTable = page.locator('.kcc-comparison-table');
    await expect(comparisonTable).toBeVisible();
    const currentRow = comparisonTable.locator('tr.current-product-row');
    await expect(currentRow).toBeVisible();
    await expect(currentRow).toContainText('152.4 × 914.4mm');
    await expect(currentRow).toContainText('24장');

    // Precautions 10 items
    const precautions = page.locator('.kcc-precautions-grid');
    await expect(precautions.locator('.kcc-precaution-card')).toHaveCount(10);
    await expect(precautions).toContainText('7~14일');
    await expect(precautions).toContainText('18°C');
    await expect(precautions).toContainText('50kg');
  });

  // 2. NOW-3061 (Orchid 3000 Parquet Wood - 457.2x457.2mm)
  test('2. Orchid 3000: NOW-3061 renders Parquet Wood, 457.2x457.2mm, 15 pcs, 3.14m2', async ({ page }) => {
    await page.goto('/materials/데코타일-녹수-오키드3000_우드-now-3061');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.showroom-product-title')).toContainText('NOW-3061');
    await expect(page.locator('.showroom-product-title')).toContainText('European Oak Parquet');

    // Must be 457.2x457.2mm, not 150 wood
    const quickSpecs = page.locator('.quick-tech-specs');
    await expect(quickSpecs).toContainText('457.2 × 457.2mm');
    await expect(quickSpecs).toContainText('15장');
    await expect(quickSpecs).toContainText('3.14㎡');

    // Swatch image displayed
    const mainImg = page.locator('.showroom-main-img');
    await expect(mainImg).toBeVisible();
    await expect(mainImg).toHaveAttribute('src', /NOW-3061\.webp/);
  });

  // 3. NOT-3071 (Orchid 3000 Premium Natural Stone - 609.6x609.6mm, Built-In-Grout)
  test('3. Orchid 3000: NOT-3071 renders 609.6x609.6mm (not 600) and Built-In-Grout feature', async ({ page }) => {
    await page.goto('/materials/데코타일-녹수-오키드3000_프리미엄_600각-not-3071');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.showroom-product-title')).toContainText('NOT-3071');

    // Distinct 609.6x609.6mm
    const quickSpecs = page.locator('.quick-tech-specs');
    await expect(quickSpecs).toContainText('609.6 × 609.6mm');
    await expect(quickSpecs).not.toContainText('600 × 600mm');
    await expect(quickSpecs).toContainText('9장');
    await expect(quickSpecs).toContainText('3.34㎡');

    // Feature: Built-In-Grout
    await expect(page.locator('.kcc-features-grid')).toContainText('Built-In-Grout');
  });

  // 4. NOT-3991 (Orchid 3000 Signature Big Slab - 914.4x914.4mm, 6 pcs, 5.02m2)
  test('4. Orchid 3000: NOT-3991 renders Signature Big Slab 914.4x914.4mm, 6 pcs, 5.02m2', async ({ page }) => {
    await page.goto('/materials/데코타일-녹수-오키드3000_900각-not-3991');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.showroom-product-title')).toContainText('NOT-3991');

    // Distinct 914.4x914.4mm
    const quickSpecs = page.locator('.quick-tech-specs');
    await expect(quickSpecs).toContainText('914.4 × 914.4mm');
    await expect(quickSpecs).toContainText('6장');
    await expect(quickSpecs).toContainText('5.02㎡');

    // Feature: Big Slab
    await expect(page.locator('.kcc-features-grid')).toContainText('Big Slab');
  });

  // 5. NPW-1201 (Prime 1500 Wood - 184x950mm, 19 pcs, 3.32m2)
  test('5. Prime 1500: NPW-1201 renders Wood 184x950mm, 19 pcs, 3.32m2', async ({ page }) => {
    await page.goto('/materials/데코타일-녹수-프라임1500_우드-npw-1201');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.showroom-product-title')).toContainText('NPW-1201');
    await expect(page.locator('.product-brand-badge')).toContainText('프라임1500');

    const quickSpecs = page.locator('.quick-tech-specs');
    await expect(quickSpecs).toContainText('184 × 950mm');
    await expect(quickSpecs).toContainText('19장');
    await expect(quickSpecs).toContainText('3.32㎡');
  });

  // 6. NPT-0611 (Prime 1500 Square 457.2 - 16 pcs, 3.34m2)
  test('6. Prime 1500: NPT-0611 renders Square 457.2x457.2mm, 16 pcs, 3.34m2', async ({ page }) => {
    await page.goto('/materials/데코타일-녹수-프라임1500_450각-npt-0611');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.showroom-product-title')).toContainText('NPT-0611');

    const quickSpecs = page.locator('.quick-tech-specs');
    await expect(quickSpecs).toContainText('457.2 × 457.2mm');
    await expect(quickSpecs).toContainText('16장');
    await expect(quickSpecs).toContainText('3.34㎡');
  });

  // 7. NEH-2014 & NEH-2619 (Ecohome 2000 Wood & Stone 600 Ondol)
  test('7. Ecohome 2000: NEH-2014 & NEH-2619 render Ondol heating features and exact specs', async ({ page }) => {
    // Wood NEH-2014
    await page.goto('/materials/데코타일-녹수-에코홈2000_우드-neh-2014');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.showroom-product-title')).toContainText('NEH-2014');
    await expect(page.locator('.product-brand-badge')).toContainText('에코홈2000');

    const woodSpecs = page.locator('.quick-tech-specs');
    await expect(woodSpecs).toContainText('180 × 920mm');
    await expect(woodSpecs).toContainText('19장');
    await expect(woodSpecs).toContainText('3.15㎡');

    await expect(page.locator('.kcc-features-grid')).toContainText('온돌난방 환경 최적화');
    await expect(page.locator('.kcc-features-grid')).toContainText('치수안정 보강층');

    // Stone NEH-2619
    await page.goto('/materials/데코타일-녹수-에코홈2000_600각-neh-2619');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.showroom-product-title')).toContainText('NEH-2619');
    const stoneSpecs = page.locator('.quick-tech-specs');
    await expect(stoneSpecs).toContainText('600 × 600mm');
    await expect(stoneSpecs).toContainText('9장');
    await expect(stoneSpecs).toContainText('3.24㎡');
  });

  // 8. Mobile Viewport & Consultation CTA
  test('8. Mobile Viewport: layout stacks naturally and CTA connects to estimate request with material info', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/materials/데코타일-녹수-오키드3000_프리미엄_우드-now-3051');
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner if present
    const cookieAccept = page.locator('.cookie-banner-btn-accept, .cookie-banner-wrapper button').first();
    if (await cookieAccept.isVisible()) {
      await cookieAccept.click();
    }

    // Mobile layout verification
    await expect(page.locator('.mobile-cta-fixed-bar')).toBeVisible();
    await expect(page.locator('.mobile-cta-fixed-bar')).toContainText('견적문의');

    // Click consultation button in mobile bottom bar
    await page.locator('.mobile-cta-fixed-bar button', { hasText: '견적문의' }).click({ force: true });
    await page.waitForLoadState('networkidle');

    // Should navigate to estimate request
    await expect(page).toHaveURL(/\/estimate\/request/);
  });
});
