import { test, expect } from '@playwright/test';

test.describe('KCC 데코타일 가격 노출 및 라인업(600각·우드·프로·센스레이) 클릭 전환 검증', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('1. KCC 데코타일 가격이 정상 노출되고 450각 외 600각/우드/프로/센스레이/전체 라인업이 모두 정상 클릭 전환됨', async ({ page }) => {
    await page.goto('/materials?category=데코타일&brand=KCC&line=trendy-450');
    await page.waitForLoadState('networkidle');

    // 1) KCC 센스타일 트랜디 450각 가격 노출 확인 (27,000원/BOX, 견적문의로 가려지지 않음)
    const firstCard = page.locator('.material-card').first();
    await expect(firstCard.locator('.card-price')).toContainText('27,000원');
    await expect(firstCard.locator('.card-price')).not.toContainText('견적문의');

    // 2) 센스타일 트랜디 600각 클릭 -> URL & 상품 목록 전환 확인
    await page.locator('.materials-lineup-filter button', { hasText: '센스타일 트랜디 600각' }).click();
    await expect(page).toHaveURL(/line=trendy-600/);
    await expect(page.locator('.results-info')).toContainText('총 7개 상품');
    await expect(page.locator('.material-card').first()).toContainText(/600\s*×\s*600mm/);
    await expect(page.locator('.material-card .card-price').first()).toContainText('27,000원');

    // 3) 센스타일 트랜디 우드 클릭 -> URL & 상품 목록 전환 확인
    await page.locator('.materials-lineup-filter button', { hasText: '센스타일 트랜디 우드' }).click();
    await expect(page).toHaveURL(/line=trendy-wood/);
    await expect(page.locator('.results-info')).toContainText('총 13개 상품');

    // 4) 센스타일 프로 600각 클릭 -> 35,000원 노출 및 목록 전환 확인
    await page.locator('.materials-lineup-filter button', { hasText: '센스타일 프로 600각' }).click();
    await expect(page).toHaveURL(/line=pro-600/);
    await expect(page.locator('.material-card .card-price').first()).toContainText('35,000원');

    // 5) 센스레이(내수) 클릭 -> 35,000원 노출 및 세부 형태 필터(라지 우드 등) 전환 확인
    await page.locator('.materials-lineup-filter button', { hasText: '센스레이(내수)' }).click();
    await expect(page).toHaveURL(/line=sensray/);
    await expect(page.locator('.material-card .card-price').first()).toContainText('35,000원');
    await expect(page.locator('.shape-filter-group button', { hasText: '라지 우드' })).toBeVisible();

    // 6) 전체 라인업 클릭 -> 형태 필터(450각, 600각 등) 전체 전환 가능 확인
    await page.locator('.materials-lineup-filter button', { hasText: '전체 라인업' }).click();
    await expect(page).toHaveURL(/line=all/);
    await expect(page.locator('.shape-filter-group button', { hasText: '600각' })).toBeVisible();
    await page.locator('.shape-filter-group button', { hasText: '600각' }).click();
    await expect(page).toHaveURL(/shape=600/);
  });
});

