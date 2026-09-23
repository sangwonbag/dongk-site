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

async function run() {
  console.log('Starting preview server for production bundle test...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    cwd: process.cwd()
  });

  server.stdout.on('data', (d) => console.log('[Server]:', d.toString().trim()));
  server.stderr.on('data', (d) => console.error('[Server Err]:', d.toString().trim()));

  try {
    await waitForServer('http://localhost:4173');
    console.log('Preview server is up!');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const consoleLogs = [];
    const uncaughtErrors = [];

    page.on('console', (msg) => {
      consoleLogs.push(`[Console ${msg.type()}]: ${msg.text()}`);
    });

    page.on('pageerror', (err) => {
      uncaughtErrors.push(err);
      console.error('[PageError Caught]:', err.message, '\nStack:', err.stack);
    });

    const targetUrl = 'http://localhost:4173/materials/데코타일-kcc-kcc_wood-tw-5119g';
    console.log(`Navigating to target URL: ${targetUrl}`);

    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n=== CAPTURED CONSOLE LOGS ===');
    consoleLogs.forEach(l => console.log(l));

    console.log('\n=== UNCAUGHT ERRORS ===');
    if (uncaughtErrors.length === 0) {
      console.log('No uncaught page errors captured on page load.');
    } else {
      uncaughtErrors.forEach((e, idx) => {
        console.log(`Error #${idx + 1}: ${e.message}`);
        console.log(`Stack:\n${e.stack}`);
      });
    }

    // Check if ErrorBoundary screen is visible
    const content = await page.textContent('body');
    if (content.includes('페이지를 불러오는 도중 오류가 발생했습니다')) {
      console.log('\n[REPRODUCED SUCCESS] ErrorBoundary screen IS displayed on preview!');
    } else {
      console.log('\n[INFO] ErrorBoundary screen was NOT detected. Page rendered.');
    }

    await browser.close();
  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    server.kill();
    process.exit(0);
  }
}

run();
