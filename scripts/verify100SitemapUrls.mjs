import https from 'https';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://dkfloor.co.kr';

function fetchUrl(fullUrl) {
  return new Promise((resolve) => {
    https.get(fullUrl, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve(500));
  });
}

async function test100() {
  console.log('=== SITEMAP 100 RANDOM SAMPLING HTTP STATUS AUDIT ===\n');

  const sitemapXml = await new Promise((resolve) => {
    https.get(`${BASE_URL}/sitemap.xml`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
  });

  const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  console.log(`Total URLs in sitemap.xml: ${urls.length}`);

  // Shuffle and take 100
  const shuffled = [...urls].sort(() => 0.5 - Math.random());
  const sample100 = shuffled.slice(0, 100);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < sample100.length; i++) {
    const url = sample100[i];
    const status = await fetchUrl(url);
    if (status === 200) {
      successCount++;
    } else {
      failCount++;
      console.log(`  ❌ [FAIL ${status}] ${url}`);
    }
  }

  console.log(`\nAudit Complete: ${successCount}/100 URLs returned HTTP 200 OK! Failures: ${failCount}`);
}

test100();
