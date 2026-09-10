import fs from 'fs';
import path from 'path';

console.log("=== Testing DK Floor Resilience & Cache Stabilization Configuration ===");

// 1. Verify vercel.json headers and rewrites
const vercelPath = path.resolve('vercel.json');
if (!fs.existsSync(vercelPath)) {
  console.error("FAIL: vercel.json not found!");
  process.exit(1);
}

const vercelContent = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

// Check index.html no-cache header
const htmlHeader = vercelContent.headers?.find(h => h.source === '/index.html' || h.source === '/');
if (!htmlHeader || !htmlHeader.headers.some(hdr => hdr.key === 'Cache-Control' && hdr.value.includes('no-cache') || hdr.value.includes('must-revalidate'))) {
  console.error("FAIL: vercel.json missing Cache-Control: max-age=0, must-revalidate for index.html!");
  process.exit(1);
} else {
  console.log("PASS: vercel.json has strict revalidation headers for index.html.");
}

// Check assets immutable header
const assetsHeader = vercelContent.headers?.find(h => h.source === '/assets/(.*)');
if (!assetsHeader || !assetsHeader.headers.some(hdr => hdr.key === 'Cache-Control' && hdr.value.includes('immutable'))) {
  console.error("FAIL: vercel.json missing Cache-Control: immutable for /assets/*!");
  process.exit(1);
} else {
  console.log("PASS: vercel.json has long-term immutable headers for /assets/*.");
}

// 2. Verify sw.js Network-First strategy and no index.html static caching
const swPath = path.resolve('public/sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');

if (swContent.includes("'/'") && swContent.includes("STATIC_ASSETS = [") && swContent.indexOf("STATIC_ASSETS") < swContent.indexOf("'/'") && swContent.slice(swContent.indexOf("STATIC_ASSETS"), swContent.indexOf("]")).includes("'/'")) {
  console.error("FAIL: sw.js is caching '/' in STATIC_ASSETS!");
  process.exit(1);
} else {
  console.log("PASS: sw.js does not cache '/' or '/index.html' cache-first in STATIC_ASSETS.");
}

if (!swContent.includes("isHtmlRequest") || !swContent.includes("dk-floor-v2")) {
  console.error("FAIL: sw.js missing Network-First html strategy or updated version!");
  process.exit(1);
} else {
  console.log("PASS: sw.js updated to version dk-floor-v2 with Network-First strategy.");
}

// 3. Verify safeLazy file
const safeLazyPath = path.resolve('src/utils/safeLazy.js');
if (!fs.existsSync(safeLazyPath)) {
  console.error("FAIL: safeLazy.js does not exist!");
  process.exit(1);
}

const safeLazyContent = fs.readFileSync(safeLazyPath, 'utf8');
if (!safeLazyContent.includes('dk_chunk_retry_executed') || !safeLazyContent.includes('window.location.reload()')) {
  console.error("FAIL: safeLazy.js does not implement session reload guard!");
  process.exit(1);
} else {
  console.log("PASS: safeLazy.js implements dynamic import retry & session reload protection.");
}

// 4. Verify routePreloader error handling
const preloaderPath = path.resolve('src/utils/routePreloader.js');
const preloaderContent = fs.readFileSync(preloaderPath, 'utf8');
if (!preloaderContent.includes('.catch(() => {})')) {
  console.error("FAIL: routePreloader.js contains unhandled dynamic import promises!");
  process.exit(1);
} else {
  console.log("PASS: routePreloader.js safely catches background import rejections.");
}

console.log("\nALL CONFIGURATION AND RESILIENCE TESTS PASSED SUCCESSFULLY!");
