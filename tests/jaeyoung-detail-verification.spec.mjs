import { test, expect } from '@playwright/test';

test.describe('Jaeyoung Jflor Decotile Detail Page Verification', () => {
  test('T2302 (Square 457.2) detail page renders full KCC-standard layout and Jaeyoung specs', async ({ page }) => {
    await page.goto('/materials/데코타일-재영-사각_457-2각_그래니트-t2302');
    await page.waitForLoadState('domcontentloaded');

    // 1. Title & Header
    await expect(page.locator('.showroom-product-title')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.showroom-product-title')).toContainText('T2302');
    await expect(page.locator('.showroom-product-code')).toContainText('T2302');

    // 2. Section 01: Product Spec Table & Lineup Comparison Table
    await expect(page.locator('text=상품 상세 규격')).toBeVisible();
    await expect(page.locator('text=재영 Jflor 데코타일 제품군 규격 안내')).toBeVisible();
    await expect(page.locator('text=Square (457.2각)').first()).toBeVisible();
    await expect(page.locator('text=600 Square (600각)').first()).toBeVisible();
    await expect(page.locator('text=Home Wood (홈우드)').first()).toBeVisible();
    await expect(page.locator('text=Wood (우드)').first()).toBeVisible();

    // Catalog disclaimer note
    await expect(page.locator('text=위 규격은 재영 Jflor 2019 카탈로그 기준이며')).toBeVisible();

    // 3. Section 02: Features (4 cards)
    await expect(page.locator('text=제품 특장점')).toBeVisible();
    await expect(page.locator('text=다양한 자연 질감 디자인')).toBeVisible();
    await expect(page.locator('text=표면 관리 편의성')).toBeVisible();

    // 4. Section 03: Product Structure
    await expect(page.getByRole('heading', { name: '제품 구조' })).toBeVisible();
    await expect(page.locator('text=특수 표면 처리 코팅층')).toBeVisible();

    // 5. Section 04: Space Examples
    await expect(page.locator('text=이 자재가 적용된 공간 예시')).toBeVisible();

    // 6. Section 05: Precautions (7 numbered items)
    await expect(page.locator('text=시공 전 유의사항')).toBeVisible();
    await expect(page.locator('text=제품 및 시공 방식 확인')).toBeVisible();
    await expect(page.locator('text=온돌 및 바닥 난방 환경 확인')).toBeVisible();

    // 7. Right floating action card / summary
    await expect(page.locator('text=DK FLOOR SHOWROOM').first()).toBeVisible();
    await expect(page.locator('text=견적문의 접수하기').first()).toBeVisible();

    // 8. Related materials section at the bottom
    await expect(page.locator('text=함께 보면 좋은 추천 자재')).toBeVisible();
  });

  test('P3064 (Home Wood) detail page highlights home wood and ondol features', async ({ page }) => {
    await page.goto('/materials/데코타일-재영-홈우드-p3064');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('text=P3064').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Home Wood (홈우드)').first()).toBeVisible();
    await expect(page.locator('text=치수 안정 보강 코어층')).toBeVisible();
  });
});

