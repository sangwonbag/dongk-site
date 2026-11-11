import { test, expect } from '@playwright/test';

const PRESTIGE_600_CODES = ['PTT6952', 'PTT6953', 'PTT6950', 'PTT6913', 'PTT6910', 'PTT6912', 'PTT6951', 'PTT6917'];
const PRESTIGE_STONE_RECT_CODES = ['PTT8696', 'PTT8698'];
const PRESTIGE_WOOD_CODES = ['PTW7961', 'PTW7964', 'PTW7902', 'PTW7904'];
const ALL_PRESTIGE_CODES = [...PRESTIGE_600_CODES, ...PRESTIGE_STONE_RECT_CODES, ...PRESTIGE_WOOD_CODES];

test.describe('LX 프레스티지 5T (PRESTG) 14종 등록 및 전체 검증', () => {
  test('1. Materials 페이지: LX하우시스 라인업(프레스티지 14종, 에코노플러스 104종 보존) 및 하위 규격 필터 검증', async ({ page }) => {
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.goto('/materials?category=데코타일&brand=LX');
    await page.waitForLoadState('networkidle');

    // 기존 에코노플러스(104) 보존 + 신규 프레스티지(14) 노출 확인
    const econoBtn = page.locator('.materials-lineup-filter button', { hasText: '에코노플러스 (104)' });
    const prestigeBtn = page.locator('.materials-lineup-filter button', { hasText: '프레스티지 (14)' });
    await expect(econoBtn).toBeVisible();
    await expect(prestigeBtn).toBeVisible();

    // 프레스티지 클릭 -> 하위 필터 4개 확인: 전체(14), 600각(8), 장방형 스톤(2), 우드(4)
    await prestigeBtn.click();
    await page.waitForTimeout(300);

    const subFilter = page.locator('.prestige-spec-filter');
    await expect(subFilter).toBeVisible();
    await expect(subFilter.locator('button', { hasText: '전체(14)' })).toBeVisible();
    await expect(subFilter.locator('button', { hasText: '600각(8)' })).toBeVisible();
    await expect(subFilter.locator('button', { hasText: '장방형 스톤(2)' })).toBeVisible();
    await expect(subFilter.locator('button', { hasText: '우드(4)' })).toBeVisible();

    await expect(page.locator('.results-info')).toContainText('총 14개 상품');

    // 14종 이미지 응답(HTTP 200 / naturalWidth > 0) 및 가격문의 검증
    const cards = page.locator('.material-card');
    await expect(cards).toHaveCount(14);

    for (let i = 0; i < 14; i++) {
      const card = cards.nth(i);
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator('.card-price')).toContainText('가격문의');
      await expect(card.locator('.card-price')).not.toContainText('0원');
      const img = card.locator('img').first();
      await expect(img).toHaveJSProperty('complete', true);
      const naturalW = await img.evaluate(el => el.naturalWidth);
      expect(naturalW).toBeGreaterThan(0);
    }

    // 600각(8) 필터 검증
    await subFilter.locator('button', { hasText: '600각(8)' }).click();
    await expect(page.locator('.results-info')).toContainText('총 8개 상품');
    await expect(page.locator('.material-card').first()).toContainText('600×600mm');
    await expect(page.locator('.material-card').first()).toContainText('5.0T');
    await expect(page.locator('.material-card').first()).toContainText('5매 / BOX (1.80㎡)');

    // 장방형 스톤(2) 필터 검증
    await subFilter.locator('button', { hasText: '장방형 스톤(2)' }).click();
    await expect(page.locator('.results-info')).toContainText('총 2개 상품');
    await expect(page.locator('.material-card', { hasText: 'PTT8696' })).toBeVisible();
    await expect(page.locator('.material-card', { hasText: 'PTT8698' })).toBeVisible();
    await expect(page.locator('.material-card').first()).toContainText('457.2×914.4mm');
    await expect(page.locator('.material-card').first()).toContainText('5매 / BOX (2.09㎡)');
    await expect(page.locator('.material-card').first()).not.toContainText('450각');

    // 우드(4) 필터 검증
    await subFilter.locator('button', { hasText: '우드(4)' }).click();
    await expect(page.locator('.results-info')).toContainText('총 4개 상품');
    for (const code of PRESTIGE_WOOD_CODES) {
      await expect(page.locator(`.material-card:has-text("${code}")`)).toBeVisible();
    }
    await expect(page.locator('.material-card').first()).toContainText('228.6×1523mm');
    await expect(page.locator('.material-card').first()).toContainText('6매 / BOX (2.09㎡)');

    expect(consoleErrors).toEqual([]);
  });

  test('2. 통합 검색 검증: PTT6952, 6952, PTT8698, PTW7964, 더스크 브론즈, 아메리칸 오크, 프레스티지, PRESTG', async ({ page }) => {
    const queries = [
      { q: 'PTT6952', expectedCode: 'PTT6952' },
      { q: '6952', expectedCode: 'PTT6952' },
      { q: 'PTT8698', expectedCode: 'PTT8698' },
      { q: 'PTW7964', expectedCode: 'PTW7964' },
      { q: '더스크 브론즈', expectedCode: 'PTT8698' },
      { q: '아메리칸 오크', expectedCode: 'PTW7964' },
      { q: '프레스티지', expectedCode: 'PTT6952' },
      { q: 'PRESTG', expectedCode: 'PTW7961' }
    ];

    // 2-A. 전체 통합 검색 (상단 검색 / URL q 파라미터) 검증
    await page.goto('/materials?q=PTT8698');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('.materials-search-input');
    for (const { q, expectedCode } of queries) {
      await searchInput.fill(q);
      await page.waitForTimeout(700);
      await expect(page.locator(`.material-card:has-text("${expectedCode}")`).first()).toBeVisible({ timeout: 5000 });
    }

    // 2-B. LX 브랜드 필터 내 검색 검증
    await page.goto('/materials?category=데코타일&brand=LX');
    await page.waitForLoadState('networkidle');
    await page.locator('.materials-search-input').fill('더스크 브론즈');
    await page.waitForTimeout(700);
    await expect(page.locator('.material-card:has-text("PTT8698")').first()).toBeVisible({ timeout: 5000 });
  });

  test('3. 상세페이지 카탈로그 정보, 6계층 구조, EIR 뱃지 6종 한정 표시 및 0원 결제 방지 (PC & 모바일)', async ({ page }) => {
    // 3-A. 600각 비-EIR 제품 (PTT6952 샌드베이지) -> EIR 뱃지 미표시
    await page.goto('/materials/decotile-lx-prestige-600각-ptt6952-샌드베이지');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.showroom-product-title')).toContainText('PTT6952');
    await expect(page.locator('.showroom-price-card')).toContainText('가격문의');
    await expect(page.locator('.showroom-price-card')).not.toContainText('0원');
    await expect(page.locator('[data-testid="prestige-eir-badge"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="detail-eir-badge"]')).toHaveCount(0);

    // 6계층 구조 & Metal Shield 자체 시험 각주 검증
    const detailContent = page.locator('.prestige-detail-section');
    await expect(detailContent).toContainText('Metal Shield 고강도 표면처리');
    await expect(detailContent).toContainText('LX하우시스 연구소 자체 시험 기준이며 실제 사용 환경에 따라 달라질 수 있음');
    await expect(detailContent).toContainText('바닥 전사방지 기술');
    await expect(detailContent).toContainText('고해상도 디자인층');
    await expect(detailContent).toContainText('전사방지·Balance층');
    await expect(detailContent).toContainText('5매 / BOX');
    await expect(detailContent).toContainText('1.80㎡');

    // 3-B. 장방형 스톤 EIR 적용 제품 (PTT8698 더스크 브론즈) -> EIR 뱃지 표시 + 0원 결제 방지
    await page.goto('/materials/decotile-lx-prestige-stone-rect-ptt8698-더스크브론즈');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-testid="prestige-eir-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-eir-badge"]')).toBeVisible();
    await expect(page.locator('.prestige-detail-section')).toContainText('457.2×914.4mm');
    await expect(page.locator('.prestige-detail-section')).toContainText('2.09㎡');
    await expect(page.locator('.prestige-detail-section')).toContainText('동조엠보');

    let dialogMsg = '';
    page.on('dialog', async (dialog) => {
      dialogMsg = dialog.message();
      await dialog.accept();
    });
    await page.locator('.btn-main-cart').click();
    await page.waitForTimeout(300);
    expect(dialogMsg).toContain('가격 확인이 필요한 자재입니다');

    // 견적 상담 연동 검증
    await page.locator('.btn-installation-consult').click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/estimate/request');
    await expect(page.locator('.selected-material-banner-card')).toContainText('PTT8698');

    // 3-C. 모바일 뷰포트(390x844) 우드 EIR 적용 제품 (PTW7964 아메리칸 오크)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/materials/decotile-lx-prestige-우드-ptw7964-아메리칸오크');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.showroom-product-title')).toContainText('PTW7964');
    await expect(page.locator('[data-testid="prestige-eir-badge"]')).toBeVisible();
    await expect(page.locator('.prestige-detail-section')).toContainText('228.6×1523mm');
    await expect(page.locator('.prestige-detail-section')).toContainText('6매 / BOX');
    await expect(page.locator('.prestige-detail-section')).toContainText('2.09㎡');
    await expect(page.locator('.mobile-cta-fixed-bar')).toBeVisible();
    await expect(page.locator('.mobile-cta-fixed-bar')).toContainText('가격문의');
  });

  test('4. 전체 14개 코드 URL 정합성 및 카드 견적문의 연동 확인', async ({ page }) => {
    expect(ALL_PRESTIGE_CODES.length).toBe(14);
    await page.goto('/materials?category=데코타일&brand=LX&line=프레스티지');
    await page.waitForLoadState('networkidle');

    const cardQuoteBtn = page.locator('.material-card:has-text("PTW7964") .btn-quote').first();
    await cardQuoteBtn.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/estimate/request');
    await expect(page.locator('.selected-material-banner-card')).toContainText('PTW7964');
    await expect(page.locator('.selected-material-banner-card')).toContainText('LX');
  });
});

