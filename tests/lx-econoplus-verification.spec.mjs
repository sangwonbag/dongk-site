import { test, expect } from '@playwright/test';

test.describe('LX EconoPlus 104 Products & Estimate Request Verification', () => {

  test('1. Materials Page: LX Decotile lineup includes 에코노플러스 (104) and sub-filters', async ({ page }) => {
    await page.goto('/materials?category=데코타일&brand=LX');
    await page.waitForLoadState('networkidle');

    // Verify existing lineups preserved
    await expect(page.locator('button:has-text("LX하우스 (15)")').first()).toBeVisible();
    await expect(page.locator('button:has-text("LX하우스스타일 (12)")').first()).toBeVisible();
    await expect(page.locator('button:has-text("디럭스 (14)")').first()).toBeVisible();
    await expect(page.locator('button:has-text("보타닉 (13)")').first()).toBeVisible();

    // Verify 에코노플러스 (104) lineup button exists
    const econoBtn = page.locator('button:has-text("에코노플러스 (104)")').first();
    await expect(econoBtn).toBeVisible();

    // Click 에코노플러스
    await econoBtn.click();
    await page.waitForTimeout(600);

    // Verify Sub-filters: 전체 104종, 600각 77종, 450각 16종, 우드 11종
    const subFilterWrap = page.locator('.econoplus-spec-filter');
    await expect(subFilterWrap).toBeVisible();
    await expect(subFilterWrap.locator('button:has-text("전체 104종")')).toBeVisible();
    await expect(subFilterWrap.locator('button:has-text("600각 77종")')).toBeVisible();
    await expect(subFilterWrap.locator('button:has-text("450각 16종")')).toBeVisible();
    await expect(subFilterWrap.locator('button:has-text("우드 11종")')).toBeVisible();

    // Test sub-filter clicks
    // Click 600각 77종
    await subFilterWrap.locator('button:has-text("600각 77종")').click();
    await page.waitForTimeout(600);
    let countText = await page.locator('.results-info strong').textContent();
    expect(countText?.trim()).toBe('77');

    // Click 450각 16종
    await subFilterWrap.locator('button:has-text("450각 16종")').click();
    await page.waitForTimeout(600);
    countText = await page.locator('.results-info strong').textContent();
    expect(countText?.trim()).toBe('16');

    // Click 우드 11종
    await subFilterWrap.locator('button:has-text("우드 11종")').click();
    await page.waitForTimeout(600);
    countText = await page.locator('.results-info strong').textContent();
    expect(countText?.trim()).toBe('11');
  });

  test('2. Product Card: DET6553 card rendering and meta info', async ({ page }) => {
    await page.goto('/materials?category=데코타일&brand=LX&line=에코노플러스&spec=600각');
    await page.waitForLoadState('networkidle');

    // Filter by searching DET6553 or directly verify card
    const searchInput = page.locator('.materials-search-input');
    await searchInput.fill('DET6553');
    await page.waitForTimeout(600);

    // Find card with DET6553
    const card = page.locator('.material-card:has-text("DET6553")').first();
    await expect(card).toBeVisible();
    await expect(card).toContainText('클레이 콘크리트');
    await expect(card).toContainText('600×600mm');
    await expect(card).toContainText('3.0T');
    await expect(card).toContainText('9매 / BOX');
    await expect(card).toContainText('3.24㎡');

    // Verify card image exists and has valid src
    const img = card.locator('img');
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toContain('DET6553');
  });

  test('3. Product Detail Page: 5-Layer structure, features, and cautions', async ({ page }) => {
    await page.goto('/materials/데코타일-lx-에코노플러스-600각-DET6553-클레이-콘크리트');
    await page.waitForLoadState('networkidle');

    // Verify title and badge
    await expect(page.locator('.showroom-product-title')).toContainText('에코노플러스 DET6553 클레이 콘크리트');
    await expect(page.locator('.product-brand-badge')).toContainText('LX하우시스');
    await expect(page.locator('.product-brand-badge')).toContainText('에코노플러스');
    await expect(page.locator('.product-brand-badge')).toContainText('600각');

    // Verify 5 layers
    const detailSection = page.locator('.econoplus-detail-section');
    await expect(detailSection).toBeVisible();
    await expect(detailSection).toContainText('고강도 표면처리층 (Metal Shield)');
    await expect(detailSection).toContainText('보호 필름층 (Wear Layer)');
    await expect(detailSection).toContainText('디자인층 (Design Layer)');
    await expect(detailSection).toContainText('Base층 (Base Layer)');
    await expect(detailSection).toContainText('Balance층 (Balance Layer)');

    // Verify features
    await expect(detailSection).toContainText('Metal Shield 고강도 표면코팅');
    await expect(detailSection).toContainText('마틴데일 B1');
    await expect(detailSection).toContainText('TrueMatte 표면 무광 기술');

    // Check 0-won protection on detail page
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('가격 확인이 필요한 자재입니다');
      await dialog.accept();
    });

    const cartBtn = page.locator('button.btn-cart, button:has-text("장바구니 담기")').first();
    if (await cartBtn.isVisible()) {
      await cartBtn.click();
    }
  });

  test('4. Special Notices: Art Rug (DET6579) and 600 Wood (DET6523)', async ({ page }) => {
    // A. Art Rug
    await page.goto('/materials/데코타일-lx-에코노플러스-600각-DET6579-아트-러그');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.econoplus-detail-section')).toContainText('아트 러그');
    await expect(page.locator('.econoplus-detail-section')).toContainText('원장별 무늬 편차');
    await expect(page.locator('.econoplus-detail-section')).toContainText('TrueView 디지털 인쇄');

    // B. 600 Wood
    await page.goto('/materials/데코타일-lx-에코노플러스-600각-DET6523-파켓-우드');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.econoplus-detail-section')).toContainText('600각 우드·모던');
    await expect(page.locator('.econoplus-detail-section')).toContainText('교차시공');
  });

  test('5. Estimate Request: 4 Work Types dropdown verified', async ({ page }) => {
    await page.goto('/estimate/request');
    await page.waitForLoadState('networkidle');

    // Fill Step 1
    await page.fill('input[placeholder*="홍길동"]', '홍길동');
    await page.fill('input[placeholder*="010"]', '010-1234-5678');

    // Next step
    const nextBtn = page.locator('button:has-text("다음 단계")').first();
    await nextBtn.click();
    await page.waitForTimeout(600);

    // Verify Step 2 Work Types dropdown has exactly 4 options in fixed order
    const workTypeSelect = page.locator('.form-group:has-text("작업 유형") select');
    await expect(workTypeSelect).toBeVisible();

    const options = await workTypeSelect.locator('option').allTextContents();
    expect(options).toEqual(['시공', '철거만', '철거 후 시공', '상담 후 결정']);
  });

});
