import { test, expect } from '@playwright/test';

test('첫 접속 시 홈 화면이 오류 없이 열린다', async ({ page }) => {
  const errors = [];

  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.goto('/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await expect(page.locator('body')).not.toContainText(
    '페이지를 불러오는 도중 오류가 발생했습니다'
  );

  expect(errors).toEqual([]);
});

test('모바일 Viewport 첫 접속 시 오류 없이 열린다', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  const errors = [];

  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.goto('/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await expect(page.locator('body')).not.toContainText(
    '페이지를 불러오는 도중 오류가 발생했습니다'
  );

  expect(errors).toEqual([]);
});

test('주요 메뉴 직접 URL 접속 시 오류 없이 열린다', async ({ page }) => {
  const routes = ['/materials', '/cases', '/samplebooks', '/estimate/request'];
  for (const route of routes) {
    const errors = [];

    page.on('console', message => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto(route, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await expect(page.locator('body')).not.toContainText(
      '페이지를 불러오는 도중 오류가 발생했습니다'
    );

    expect(errors).toEqual([]);
  }
});
