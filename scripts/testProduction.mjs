import https from 'https';

const BASE_URL = 'https://dkfloor.co.kr';

const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const NORMAL_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fetchUrl(urlPath, userAgent) {
  return new Promise((resolve) => {
    const fullUrl = `${BASE_URL}${urlPath}`;
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
        const jsonLdMatch = data.includes('type="application/ld+json"');

        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          redirectUrl: res.headers.location || null,
          title: titleMatch ? titleMatch[1] : null,
          description: descMatch ? descMatch[1] : null,
          canonical: canonicalMatch ? canonicalMatch[1] : null,
          robots: robotsMatch ? robotsMatch[1] : null,
          h1: h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : null,
          hasRootContent,
          hasJsonLd: jsonLdMatch,
          bodySnippet: data.substring(0, 500),
          fullBody: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });

    req.end();
  });
}

async function runTests() {
  const paths = [
    '/',
    '/materials',
    '/materials/%EB%8D%B0%EC%BD%94%ED%83%80%EC%9D%BC-kcc-kcc_wood-tw-5120g',
    '/samplebooks',
    '/cases',
    '/estimate'
  ];

  console.log('=== PRODUCTION LIVE HTTP VERIFICATION ===\n');

  for (const path of paths) {
    console.log(`--- Testing Path: ${path} ---`);
    
    const botRes = await fetchUrl(path, GOOGLEBOT_UA);
    console.log('[Googlebot]');
    console.log(`  Status: ${botRes.status}`);
    console.log(`  Content-Type: ${botRes.contentType}`);
    console.log(`  Title: ${botRes.title}`);
    console.log(`  H1: ${botRes.h1}`);
    console.log(`  Has Pre-rendered Root Content: ${botRes.hasRootContent}`);
    console.log(`  Has JSON-LD: ${botRes.hasJsonLd}`);
    console.log(`  Canonical: ${botRes.canonical}`);
    console.log(`  Robots: ${botRes.robots}`);

    const userRes = await fetchUrl(path, NORMAL_UA);
    console.log('[Normal Browser]');
    console.log(`  Status: ${userRes.status}`);
    console.log(`  Title: ${userRes.title}`);
    console.log(`  Has Pre-rendered Root Content: ${userRes.hasRootContent}\n`);
  }
}

runTests();
