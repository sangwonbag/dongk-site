import { test, expect } from '@playwright/test';

test.describe('Estimate Request & Material Search Modal Flow', () => {
  test('STEP 2 has 5 work types and updates labels dynamically', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/estimate/request');

    // Dismiss cookie banner if present
    const cookieAcceptBtn = page.locator('button:has-text("모두 수락")');
    if (await cookieAcceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cookieAcceptBtn.click().catch(() => {});
    }

    // Hide overlapping floating desktop sidecars during test
    await page.addStyleTag({ content: '.right-float-desktop, .scroll-reveal-menu { display: none !important; }' });

    // STEP 1: Fill customer info
    await page.fill('input[placeholder*="홍길동"]', '홍길동');
    await page.fill('input[placeholder*="010"]', '010-1234-5678');
    await page.click('button:has-text("다음 단계")');

    // STEP 2: Verify 5 work types
    const workTypeSelect = page.locator('select').nth(1);
    const options = await workTypeSelect.locator('option').allInnerTexts();
    expect(options).toEqual([
      '자재만 구매',
      '자재 + 시공',
      '철거만',
      '철거 + 시공',
      '상담 후 결정'
    ]);

    // Select '철거만'
    await workTypeSelect.selectOption('철거만');
    await expect(page.locator('text=철거 예정 평수 (선택)')).toBeVisible();
    await expect(page.locator('text=철거 희망일 (선택)')).toBeVisible();

    // Select '자재만 구매'
    await workTypeSelect.selectOption('자재만 구매');
    await expect(page.locator('text=예상 면적 / 수량 (선택)')).toBeVisible();
    await expect(page.locator('text=희망 배송 / 수령일 (선택)')).toBeVisible();

    // Select '자재 + 시공'
    await workTypeSelect.selectOption('자재 + 시공');
    await expect(page.locator('text=시공 예정 평수 (선택)')).toBeVisible();

    // Enter address and move to STEP 3
    await page.fill('input[placeholder*="기본 주소를 입력하세요"]', '서울시 강남구 역삼동 123');
    await page.click('button:has-text("다음 단계")');

    // STEP 3: Verify header and '자재 검색 및 추가' button
    await expect(page.locator('h3:has-text("STEP 3. 자재 선택")')).toBeVisible();
    const searchModalBtn = page.locator('button:has-text("자재 검색 및 추가")');
    await expect(searchModalBtn).toBeVisible();

    // Click to open modal
    await searchModalBtn.click();
    await expect(page.locator('.search-modal')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.search-modal h2')).toHaveText('견적 자재 검색 및 추가');

    // Verify Category Tabs
    const categoryTabs = page.locator('.filter-tabs-row').first().locator('.filter-tab-btn');
    const catTexts = await categoryTabs.allInnerTexts();
    expect(catTexts).toEqual(['전체', '데코타일', '장판', '마루', '벽지', '카페트타일']);

    // Verify Popular Keywords
    await expect(page.locator('.popular-keywords-bar')).toBeVisible();

    // Search 'TS 5502P'
    const searchInput = page.locator('.search-modal-input-wrap input');
    await searchInput.fill('TS 5502P');

    // Wait for search results
    await page.waitForTimeout(600);
    const productCard = page.locator('.search-material-card').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    await expect(productCard.locator('.code-val')).toContainText('TS5502P');

    // Verify thumbnail wrapper has fixed aspect ratio and ProductImage is constrained
    const thumbWrap = productCard.locator('.search-card-thumb-wrap');
    await expect(thumbWrap).toBeVisible();
    const box = await thumbWrap.boundingBox();
    expect(box.width).toBeGreaterThan(50);
    expect(box.height).toBeGreaterThan(50);
    expect(Math.abs(box.width - box.height)).toBeLessThan(5); // 1:1 square aspect ratio

    // Click '+ 견적에 추가'
    const addBtn = productCard.locator('.btn-card-add');
    await expect(addBtn).toContainText('견적에 추가');
    await addBtn.click({ force: true });

    // Verify button switches to added state
    await expect(addBtn).toContainText('견적에 추가됨');

    // Close modal
    await page.locator('.btn-modal-done').click({ force: true });
    await expect(page.locator('.search-modal')).not.toBeVisible();

    // Verify item in STEP 3
    const inquiryItemCard = page.locator('.est-inquiry-item-card').first();
    await expect(inquiryItemCard).toBeVisible();
    await expect(inquiryItemCard.locator('.spec-tag:has-text("TS5502P")')).toBeVisible();

    // Verify quantity input is editable and not disabled
    const qtyInput = inquiryItemCard.locator('input[type="number"]');
    await expect(qtyInput).toBeEnabled();
    await expect(qtyInput).not.toBeDisabled();

    // Verify plus and minus buttons are enabled
    const minusBtn = inquiryItemCard.locator('button[aria-label="수량 감소"]');
    const plusBtn = inquiryItemCard.locator('button[aria-label="수량 증가"]');
    await expect(minusBtn).toBeEnabled();
    await expect(plusBtn).toBeEnabled();

    // Click plus button
    await plusBtn.click({ force: true });
    await expect(qtyInput).toHaveValue('2');

    // Click minus button
    await minusBtn.click({ force: true });
    await expect(qtyInput).toHaveValue('1');

    // Verify delete button
    const deleteBtn = inquiryItemCard.locator('.btn-delete-inquiry-item');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click({ force: true });

    // Verify empty guide card is shown again
    await expect(page.locator('.empty-cart-guide-card')).toBeVisible();
  });

  test('Material search modal filters and keywords work seamlessly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/estimate/request');

    // Dismiss cookie banner
    const cookieAcceptBtn = page.locator('button:has-text("모두 수락")');
    if (await cookieAcceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cookieAcceptBtn.click().catch(() => {});
    }
    await page.addStyleTag({ content: '.right-float-desktop, .scroll-reveal-menu { display: none !important; }' });

    // Navigate to step 3
    await page.fill('input[placeholder*="홍길동"]', '테스터');
    await page.fill('input[placeholder*="010"]', '010-9999-8888');
    await page.click('button:has-text("다음 단계")');
    await page.fill('input[placeholder*="기본 주소를 입력하세요"]', '서울시 송파구 잠실동');
    await page.click('button:has-text("다음 단계")');

    // Open modal
    await page.locator('button:has-text("자재 검색 및 추가")').click();
    await expect(page.locator('.search-modal')).toBeVisible();

    // Click popular keyword '디아망'
    await page.click('button.keyword-chip:has-text("디아망")');
    await page.waitForTimeout(600);
    const diamangCards = page.locator('.search-material-card');
    await expect(diamangCards.first()).toBeVisible();
    await expect(page.locator('.search-modal-input-wrap input')).toHaveValue('디아망');

    // Click '마루' category tab
    await page.click('.filter-tabs-row:has-text("카테고리") button:has-text("마루")');
    // Clear search text
    await page.click('.btn-clear-search');
    await page.waitForTimeout(600);

    // Click '한솔' brand tab
    const hansolTab = page.locator('.filter-tabs-row:has-text("브랜드") button:has-text("한솔")');
    await expect(hansolTab).toBeVisible();
    await hansolTab.click();
    await page.waitForTimeout(600);

    // Verify products from Hansol
    const hansolCards = page.locator('.search-material-card');
    await expect(hansolCards.first()).toBeVisible();
    await expect(hansolCards.first().locator('.brand-tag')).toContainText('한솔');
  });
});
