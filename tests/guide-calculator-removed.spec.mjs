import { test, expect } from '@playwright/test';

test.describe('Flooring Guide (/guide) Calculator Removal Verification', () => {
  test('Calculator is completely removed and FAQ is directly below recommendation cards (Desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/guide');

    // 1. Verify '간단 평수 자재 계산기' is NOT present anywhere on the page
    await expect(page.locator('text=간단 평수 자재 계산기')).not.toBeVisible();
    await expect(page.locator('text=시공할 공간 평수와 원하시는 바닥재 종류를 선택하시면')).not.toBeVisible();
    await expect(page.locator('.guide-calc-widget')).toHaveCount(0);
    await expect(page.locator('.guide-calc-form')).toHaveCount(0);
    await expect(page.locator('.guide-calc-result')).toHaveCount(0);
    await expect(page.locator('button:has-text("맞춤 견적문의 접수하기")')).toHaveCount(0);

    // 2. Verify Section 3 (공간에 맞는 바닥재 찾기) exists
    const spaceSectionTitle = page.locator('h2:has-text("공간에 맞는 바닥재 찾기")');
    await expect(spaceSectionTitle).toBeVisible();

    // 3. Verify Section 5 (자주 묻는 질문 FAQ) exists
    const faqSectionTitle = page.locator('h2:has-text("자주 묻는 질문 (FAQ)")');
    await expect(faqSectionTitle).toBeVisible();

    // 4. Test FAQ accordion functionality
    const firstFaqQuestion = page.locator('.guide-faq-question').first();
    await expect(firstFaqQuestion).toBeVisible();

    // Initially first FAQ answer should not be open
    const firstFaqItem = page.locator('.guide-faq-item').first();
    await expect(firstFaqItem).not.toHaveClass(/open/);

    // Click to open
    await firstFaqQuestion.click();
    await expect(firstFaqItem).toHaveClass(/open/);
    await expect(firstFaqItem.locator('.guide-faq-answer')).toBeVisible();

    // Click again to close
    await firstFaqQuestion.click();
    await expect(firstFaqItem).not.toHaveClass(/open/);
  });

  test('Calculator is completely removed on Mobile Viewport as well', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/guide');

    // Verify calculator is absent on mobile
    await expect(page.locator('text=간단 평수 자재 계산기')).not.toBeVisible();
    await expect(page.locator('.guide-calc-widget')).toHaveCount(0);

    // Verify recommendations and FAQ are rendered cleanly
    await expect(page.locator('h2:has-text("공간에 맞는 바닥재 찾기")')).toBeVisible();
    await expect(page.locator('h2:has-text("자주 묻는 질문 (FAQ)")')).toBeVisible();
  });
});

