import https from 'https';

const BASE_URL = 'https://dkfloor.co.kr';
const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

function fetchUrl(urlPath) {
  return new Promise((resolve) => {
    const fullUrl = `${BASE_URL}${urlPath}`;
    const urlObj = new URL(fullUrl);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': GOOGLEBOT_UA
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const robotsMatch = data.match(/<meta\s+name="robots"\s+content="(.*?)"/i);
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          robots: robotsMatch ? robotsMatch[1] : null,
          hasBody: data.length > 500
        });
      });
    });

    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    req.end();
  });
}

async function runRegression() {
  console.log('=== REGRESSION & NOINDEX CHECK ===\n');

  const privatePaths = [
    '/login',
    '/signup',
    '/cart',
    '/checkout',
    '/orders',
    '/mypage',
    '/admin'
  ];

  for (const p of privatePaths) {
    const res = await fetchUrl(p);
    console.log(`Path ${p}:`);
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Robots Meta: ${res.robots}`);
    console.log(`  Contains noindex: ${res.robots?.includes('noindex') ? 'YES ✅' : 'NO ❌'}`);
  }
}

runRegression();
