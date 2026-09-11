import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://dkfloor.co.kr';
const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const NORMAL_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fetchUrl(urlPath, userAgent) {
  return new Promise((resolve) => {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`;
    const urlObj = new URL(fullUrl);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>(.*?)<\/title>/i);
        const descMatch = data.match(/<meta\s+name="description"\s+content="(.*?)"/i);
        const canonicalMatch = data.match(/<link\s+rel="canonical"\s+href="(.*?)"/i);
        const robotsMatch = data.match(/<meta\s+name="robots"\s+content="(.*?)"/i);
        const h1Match = data.match(/<h1[^>]*>(.*?)<\/h1>/i);
        const hasRootContent = data.includes('<div id="root">') && !data.includes('<div id="root"></div>');
        
        let jsonLd = null;
        const jsonLdMatch = data.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
        if (jsonLdMatch) {
          try {
            jsonLd = JSON.parse(jsonLdMatch[1]);
          } catch (e) {
            jsonLd = { parseError: e.message };
          }
        }

        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'] || '',
          redirectUrl: res.headers.location || null,
          title: titleMatch ? titleMatch[1] : null,
          description: descMatch ? descMatch[1] : null,
          canonical: canonicalMatch ? canonicalMatch[1] : null,
          robots: robotsMatch ? robotsMatch[1] : null,
          h1: h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : null,
          hasRootContent,
          jsonLd,
          fullBody: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 500, error: err.message, fullBody: '' });
    });

    req.end();
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('   PRODUCTION SEO & SSG FULL SUITE AUDIT REPORT   ');
  console.log('====================================================\n');

  // 1. Mandatory URLs Inspection
  const testPaths = [
    '/',
    '/materials',
    '/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5120g',
    '/materials/100938',
    '/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-%EB%8F%99%EC%8B%A0-%EB%8F%99%EC%8B%A0_wood-ab-6211',
    '/materials/%EC%9E%A5%ED%8C%90-kcc-kcc_forest-np-20-2211',
    '/materials/%EB%A7%88%EB%A3%A4-%EC%9D%B4%EA%B1%B4-%EC%9D%B4%EA%B1%B4_hard-%EA%B0%95%EB%A7%88%EB%A3%A4-%ED%97%A4%EB%A7%81%EB%B3%B8-%EC%98%A4%ED%81%AC',
    '/samplebooks',
    '/cases',
    '/estimate'
  ];

  console.log('1. MANDATORY PATHS INSPECTION (Googlebot vs Normal UA)\n');

  for (const path of testPaths) {
    console.log(`>>> PATH: ${path}`);
    
    const botRes = await fetchUrl(path, GOOGLEBOT_UA);
    console.log(`  [Googlebot UA]`);
    console.log(`    HTTP Status: ${botRes.status}`);
    console.log(`    Content-Type: ${botRes.contentType}`);
    console.log(`    Redirect URL: ${botRes.redirectUrl}`);
    console.log(`    Title: ${botRes.title}`);
    console.log(`    Meta Description: ${botRes.description}`);
    console.log(`    Canonical: ${botRes.canonical}`);
    console.log(`    Robots Meta: ${botRes.robots}`);
    console.log(`    H1 Tag: ${botRes.h1}`);
    console.log(`    Pre-rendered HTML inside #root: ${botRes.hasRootContent ? 'YES (Valid SSG)' : 'NO'}`);
    console.log(`    JSON-LD Present: ${botRes.jsonLd ? 'YES' : 'NO'}`);

    const userRes = await fetchUrl(path, NORMAL_UA);
    console.log(`  [Normal Browser UA]`);
    console.log(`    HTTP Status: ${userRes.status}`);
    console.log(`    Title: ${userRes.title}`);
    console.log(`    Pre-rendered HTML inside #root: ${userRes.hasRootContent ? 'YES' : 'NO'}\n`);
  }

  // 2. Specific Verification for TW 5120G Prerender Content
  console.log('\n2. TW 5120G RAW HTML PRERENDER TEXT VERIFICATION\n');
  const twRes = await fetchUrl('/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5120g', GOOGLEBOT_UA);
  const requiredSnippets = [
    'KCC 센스타일 트랜디 TW 5120G',
    '3.0mm(T)',
    '184mm(W) × 950mm(L)',
    '19pcs/box',
    '3.32㎡',
    '데코타일 본드'
  ];

  for (const snippet of requiredSnippets) {
    const exists = twRes.fullBody.includes(snippet);
    console.log(`  - Text "${snippet}": ${exists ? 'FOUND IN INITIAL HTML ✅' : 'MISSING ❌'}`);
  }

  // 3. Sitemap XML Inspection
  console.log('\n3. PRODUCTION SITEMAP.XML AUDIT\n');
  const sitemapRes = await fetchUrl('/sitemap.xml', GOOGLEBOT_UA);
  console.log(`  HTTP Status: ${sitemapRes.status}`);
  console.log(`  Content-Type: ${sitemapRes.contentType}`);
  
  const urlMatches = sitemapRes.fullBody.match(/<loc>(.*?)<\/loc>/g) || [];
  const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, ''));
  console.log(`  Total URLs in sitemap.xml: ${urls.length}`);

  const uniqueUrls = new Set(urls);
  console.log(`  Unique URLs: ${uniqueUrls.size}`);
  console.log(`  Duplicate URLs count: ${urls.length - uniqueUrls.size}`);

  const nonDomainUrls = urls.filter(u => !u.startsWith(BASE_URL));
  console.log(`  Non-${BASE_URL} URLs: ${nonDomainUrls.length}`);

  const noindexPrivatePaths = ['/login', '/signup', '/cart', '/checkout', '/orders', '/mypage', '/admin'];
  const invalidInSitemap = urls.filter(u => noindexPrivatePaths.some(p => u.includes(p)));
  console.log(`  noindex Private URLs included in sitemap: ${invalidInSitemap.length}`);

  // Sampling 20 URLs from sitemap
  console.log(`\n  Sampling 20 URLs from sitemap.xml for HTTP 200 verification...`);
  const sampleUrls = urls.slice(0, 20);
  let failCount = 0;
  for (const u of sampleUrls) {
    const r = await fetchUrl(u, GOOGLEBOT_UA);
    if (r.status !== 200) {
      console.log(`    ❌ [FAIL] ${u} -> Status ${r.status}`);
      failCount++;
    }
  }
  if (failCount === 0) {
    console.log(`  ✅ All 20 sampled sitemap URLs returned HTTP 200 OK!`);
  }

  // 4. Robots.txt Inspection
  console.log('\n4. PRODUCTION ROBOTS.TXT AUDIT\n');
  const robotsRes = await fetchUrl('/robots.txt', GOOGLEBOT_UA);
  console.log(`  HTTP Status: ${robotsRes.status}`);
  console.log(`  Content-Type: ${robotsRes.contentType}`);
  console.log(`  Robots.txt Content:\n${robotsRes.fullBody}\n`);

  // 5. Product JSON-LD Inspection (10 sampled products)
  console.log('\n5. PRODUCT JSON-LD SAMPLING AUDIT (10 Products)\n');
  const sampleProductPaths = [
    '/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5120g',
    '/materials/100938',
    '/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-%EB%8F%99%EC%8B%A0-%EB%8F%99%EC%8B%A0_wood-ab-6211',
    '/materials/%EC%9E%A5%ED%8C%90-kcc-kcc_forest-np-20-2211',
    '/materials/%EB%A7%88%EB%A3%A4-%EC%9D%B4%EA%B1%B4-%EC%9D%B4%EA%B1%B4_hard-%EA%B0%95%EB%A7%88%EB%A3%A4-%ED%97%A4%EB%A7%81%EB%B3%B8-%EC%98%A4%ED%81%AC',
    '/materials/100001',
    '/materials/100002',
    '/materials/100003',
    '/materials/100004',
    '/materials/100005'
  ];

  for (const path of sampleProductPaths) {
    const res = await fetchUrl(path, GOOGLEBOT_UA);
    if (!res.jsonLd) {
      console.log(`  ❌ ${path} -> NO JSON-LD`);
      continue;
    }

    const prodObj = Array.isArray(res.jsonLd) ? res.jsonLd.find(o => o['@type'] === 'Product') : (res.jsonLd['@type'] === 'Product' ? res.jsonLd : null);
    
    if (prodObj) {
      console.log(`  ✅ [JSON-LD OK] ${path}`);
      console.log(`     - Name: ${prodObj.name}`);
      console.log(`     - Brand: ${prodObj.brand?.name}`);
      console.log(`     - SKU: ${prodObj.sku}`);
      console.log(`     - Image: ${prodObj.image ? prodObj.image[0] : 'None'}`);
      console.log(`     - Offer Price: ${prodObj.offers?.price} ${prodObj.offers?.priceCurrency || ''}`);
    } else {
      console.log(`  ⚠️ ${path} -> JSON-LD present but @type Product not found`);
    }
  }
}

runAudit();
