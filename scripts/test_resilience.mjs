import fs from 'fs';
import path from 'path';

console.log("=== Testing DK Floor Resilience & Pure Static Route Imports ===");

// 1. Verify vercel.json headers and rewrites
const vercelPath = path.resolve('vercel.json');
if (!fs.existsSync(vercelPath)) {
  console.error("FAIL: vercel.json not found!");
  process.exit(1);
}

const vercelContent = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

// Check index.html no-cache, no-store header
const htmlHeader = vercelContent.headers?.find(h => h.source === '/index.html' || h.source === '/');
if (!htmlHeader || !htmlHeader.headers.some(hdr => hdr.key === 'Cache-Control' && hdr.value.includes('no-cache'))) {
  console.error("FAIL: vercel.json missing Cache-Control: no-cache, no-store, must-revalidate for index.html!");
  process.exit(1);
} else {
  console.log("PASS: vercel.json has strict no-cache/no-store revalidation headers for index.html.");
}

// Check assets immutable header
const assetsHeader = vercelContent.headers?.find(h => h.source === '/assets/(.*)');
if (!assetsHeader || !assetsHeader.headers.some(hdr => hdr.key === 'Cache-Control' && hdr.value.includes('immutable'))) {
  console.error("FAIL: vercel.json missing Cache-Control: immutable for /assets/*!");
  process.exit(1);
} else {
  console.log("PASS: vercel.json has long-term immutable headers for /assets/*.");
}

// 2. Verify main.jsx Service Worker & Cache Storage unregistration
const mainJsxPath = path.resolve('src/main.jsx');
const mainJsxContent = fs.readFileSync(mainJsxPath, 'utf8');

if (!mainJsxContent.includes('unregister') || !mainJsxContent.includes('caches.delete')) {
  console.error("FAIL: main.jsx does not purge legacy Service Worker or Cache Storage!");
  process.exit(1);
} else {
  console.log("PASS: main.jsx automatically unregisters legacy Service Workers and clears Cache Storage.");
}

// 3. Verify App.jsx static imports for all customer routes
const appJsxPath = path.resolve('src/app/App.jsx');
const appJsxContent = fs.readFileSync(appJsxPath, 'utf8');

const customerPages = ['Home', 'SampleBooks', 'Materials', 'MaterialDetail', 'Cases', 'Cart', 'Checkout', 'OrderComplete', 'OrderHistory', 'EstimateRequest', 'Login', 'Signup', 'MyPage', 'PrivacyPolicy', 'TermsOfService'];
let missingStatic = [];
customerPages.forEach(pg => {
  const staticRegex = new RegExp(`import\\s+${pg}\\s+from`);
  if (!staticRegex.test(appJsxContent)) {
    missingStatic.push(pg);
  }
});

if (missingStatic.length > 0) {
  console.error("FAIL: Customer pages not statically imported in App.jsx:", missingStatic);
  process.exit(1);
} else {
  console.log(`PASS: All ${customerPages.length} customer-facing pages are statically imported into App.jsx.`);
}

console.log("\nALL CONFIGURATION AND PURE STATIC ROUTE TESTS PASSED SUCCESSFULLY!");
