import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('홈페이지 최초 접속 시 구형 HTML 화면 완전 제거 검증', () => {
  const rootDir = process.cwd();
  const distIndexPath = path.join(rootDir, 'dist', 'index.html');
  const swPath = path.join(rootDir, 'public', 'sw.js');

  test('1. dist/index.html 정적 파일에 구형 unstyled HTML이 완전히 존재하지 않아야 함', async () => {
    expect(fs.existsSync(distIndexPath)).toBe(true);
    const htmlContent = fs.readFileSync(distIndexPath, 'utf-8');

    // 비정상 구형 HTML 텍스트가 단 한 줄도 없어야 함
    expect(htmlContent).not.toContain('동경바닥재 - 프리미엄 바닥재 유통 전문');
    expect(htmlContent).not.toContain('KCC, LX하우시스, 동신포리마, 이건마루, 재영 등 전 브랜드 정품 자재 공급');
    expect(htmlContent).not.toContain('주요 제품 카테고리');

    // #root 내부가 깔끔해야 함
    expect(htmlContent).toContain('<div id="root"></div>');

    // 검색엔진 SEO 메타태그 및 JSON-LD는 온전히 유지되어야 함
    expect(htmlContent).toContain('<title>동경바닥재 | KCC·LX·동신 프리미엄 바닥재·데코타일·마루·장판 유통 전문</title>');
    expect(htmlContent).toContain('<meta name="description"');
    expect(htmlContent).toContain('<meta property="og:title"');
    expect(htmlContent).toContain('application/ld+json');
  });

  test('2. 서비스 워커(sw.js) 캐시 버전이 업그레이드되어 구버전 캐시 즉시 무효화', async () => {
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain("const CACHE_NAME = 'dk-floor-v5';");
  });

  test('3. 홈페이지 렌더링 시 최신 동경바닥재 쇼룸 및 히어로가 정상 표시됨', async ({ page }) => {
    await page.goto('/');

    // 페이지 제목 검증
    await expect(page).toHaveTitle(/동경바닥재/);

    // 정상 히어로 텍스트가 표시되는지 확인
    const heroTitle = page.locator('.hero-main-title');
    await expect(heroTitle).toBeVisible({ timeout: 10000 });
    await expect(heroTitle).toHaveText('공간의 가치를 완성하는 바닥재');

    // 자재찾기 및 견적문의 CTA 버튼 표시 확인
    const materialsBtn = page.getByRole('link', { name: '자재 찾기' }).first();
    await expect(materialsBtn).toBeVisible();

    // 구형 텍스트가 페이지 DOM 어디에도 없음을 확인
    const legacyHeading = page.locator('h1', { hasText: '동경바닥재 - 프리미엄 바닥재 유통 전문' });
    await expect(legacyHeading).toHaveCount(0);
  });
});

