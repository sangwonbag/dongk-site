import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import http from 'http';

function waitForServer(url, timeout = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode < 500) resolve();
        else setTimeout(check, 300);
      }).on('error', () => {
        if (Date.now() - start > timeout) reject(new Error('Server timeout'));
        else setTimeout(check, 300);
      });
    };
    check();
  });
}

const targetRoutes = [
  { name: 'TW 5119G (slug)', url: 'http://localhost:4173/materials/데코타일-kcc-kcc_wood-tw-5119g' },
  { name: 'TW 5120G (slug)', url: 'http://localhost:4173/materials/데코타일-kcc-kcc_wood-tw-5120g' },
  { name: 'TS5552P', url: 'http://localhost:4173/materials/TS5552P' },
  { name: 'B3192J', url: 'http://localhost:4173/materials/B3192J' },
  { name: '장판 ZJ34371-11', url: 'http://localhost:4173/materials/ZJ34371-11' },
  { name: '장판 XCFW011', url: 'http://localhost:4173/materials/XCFW011' },
  { name: '마루 (소프트 카모마일)', url: 'http://localhost:4173/materials/101828' },
  { name: '벽지 (신한벽지)', url: 'http://localhost:4173/materials/104204' },
  { name: '카페트타일 (RF062)', url: 'http://localhost:4173/materials/104580' },
  { name: '부자재 (SUB-BOND-4KG)', url: 'http://localhost:4173/materials/104891' },
];

async function run() {
  console.log('=== MULTI-ROUTE PRODUCTION PREVIEW SMOKE TEST ===\n');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    cwd: process.cwd()
  });

  try {
    await waitForServer('http://localhost:4173');
    console.log('Preview server ready at http://localhost:4173\n');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    let totalPassed = 0;
    let totalFailed = 0;

    for (const route of targetRoutes) {
      const pageErrors = [];
      const consoleErrors = [];

      const pageErrorListener = (err) => pageErrors.push(err);
      const consoleListener = (msg) => {
        if (msg.type() === 'error' && !msg.text().includes('visitor_logs') && !msg.text().includes('404')) {
          consoleErrors.push(msg.text());
        }
      };

      page.on('pageerror', pageErrorListener);
      page.on('console', consoleListener);

      await page.goto(route.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const content = await page.textContent('body');
      const hasErrorBoundary = content.includes('페이지를 불러오는 도중 오류가 발생했습니다');
      const hasProductTitle = await page.locator('h1').count() > 0;

      page.off('pageerror', pageErrorListener);
      page.off('console', consoleListener);

      if (!hasErrorBoundary && pageErrors.length === 0 && consoleErrors.length === 0 && hasProductTitle) {
        console.log(`[PASS] ${route.name} -> Rendered cleanly (Title visible, ErrorBoundary=0, PageErrors=0)`);
        totalPassed++;
      } else {
        console.log(`[FAIL] ${route.name}`);
        console.log('  - ErrorBoundary visible:', hasErrorBoundary);
        console.log('  - PageErrors:', pageErrors.map(e => e.message));
        console.log('  - ConsoleErrors:', consoleErrors);
        totalFailed++;
      }
    }

    await browser.close();

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total Passed: ${totalPassed} / ${targetRoutes.length}`);
    console.log(`Total Failed: ${totalFailed} / ${targetRoutes.length}`);

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    server.kill();
    process.exit(0);
  }
}

run();
