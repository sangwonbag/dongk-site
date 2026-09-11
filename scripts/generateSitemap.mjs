import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://dkfloor.co.kr';

function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function run() {
  console.log('[Sitemap] Generating automated sitemap.xml...');

  const today = new Date().toISOString().split('T')[0];

  // Static Public Routes
  const staticRoutes = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/materials', priority: '0.9', changefreq: 'daily' },
    { url: '/samplebooks', priority: '0.9', changefreq: 'weekly' },
    { url: '/cases', priority: '0.8', changefreq: 'weekly' },
    { url: '/estimate', priority: '0.8', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
    { url: '/terms-of-service', priority: '0.5', changefreq: 'yearly' },
  ];

  // Load generated materials dataset
  const materialsFilePath = path.join(rootDir, 'src', 'data', 'generatedMaterials.js');
  let materials = [];

  if (fs.existsSync(materialsFilePath)) {
    try {
      const mod = await import(`file://${materialsFilePath}`);
      materials = mod.generatedMaterials || mod.materials || [];
    } catch (e) {
      console.warn('[Sitemap] Failed to import generatedMaterials.js:', e.message);
    }
  }

  // Fallback to materials.db.js if empty
  if (materials.length === 0) {
    const dbFilePath = path.join(rootDir, 'src', 'data', 'materials.db.js');
    if (fs.existsSync(dbFilePath)) {
      try {
        const mod = await import(`file://${dbFilePath}`);
        materials = mod.materials || [];
      } catch (e) {
        console.warn('[Sitemap] Failed to import materials.db.js:', e.message);
      }
    }
  }

  console.log(`[Sitemap] Found ${materials.length} product materials.`);

  const materialUrls = [];
  const seenIds = new Set();

  for (const item of materials) {
    const rawId = item.id || item.code;
    if (!rawId || seenIds.has(String(rawId))) continue;
    seenIds.add(String(rawId));

    const itemLastMod = item.updated_at
      ? new Date(item.updated_at).toISOString().split('T')[0]
      : today;

    const encodedId = encodeURIComponent(String(rawId));
    materialUrls.push({
      url: `/materials/${encodedId}`,
      lastmod: itemLastMod,
      priority: '0.7',
      changefreq: 'weekly'
    });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static URLs
  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${xmlEscape(BASE_URL + route.url)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Material Detail URLs
  for (const route of materialUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${xmlEscape(BASE_URL + route.url)}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');

  console.log(`[Sitemap] Successfully wrote ${staticRoutes.length + materialUrls.length} URLs to public/sitemap.xml`);
}

run().catch(err => {
  console.error('[Sitemap Error]:', err);
  process.exit(1);
});
