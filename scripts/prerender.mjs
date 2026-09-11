import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const BASE_URL = 'https://dkfloor.co.kr';

function htmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Brand normalizer helper
function getBrandName(item) {
  let b = (item.brand || item.brandName || '').trim();
  if (!b && item.code) {
    const code = String(item.code).toUpperCase();
    if (code.startsWith('TS')) b = 'KCC';
    else if (code.startsWith('D') || code.startsWith('DS') || code.startsWith('CH')) b = '동신';
    else if (code.includes('LX') || code.startsWith('LX')) b = 'LX';
    else if (code.includes('LG') || code.startsWith('LG')) b = 'LG';
  }
  return b || '동경바닥재';
}

function generateSlug(item) {
  const cat = (item.category || '').trim();
  const brand = getBrandName(item);
  const line = (item.line || item.line_name || '').trim().replace(/\s+/g, '_');
  const code = (item.code || '').trim().replace(/\s+/g, '_');

  const parts = [];
  if (cat) parts.push(cat);
  if (brand) parts.push(brand);
  if (line) parts.push(line);
  if (code) parts.push(code);

  return parts.join('-').toLowerCase();
}

async function runPrerender() {
  console.log('[Prerender] Starting post-build SSG / Static Snapshot Generation...');

  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('[Prerender Error] dist/index.html does not exist. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexPath, 'utf8');

  // Load product dataset
  const materialsFilePath = path.join(rootDir, 'src', 'data', 'generatedMaterials.js');
  let materials = [];

  if (fs.existsSync(materialsFilePath)) {
    try {
      const mod = await import(`file://${materialsFilePath}`);
      materials = mod.generatedMaterials || mod.materials || [];
    } catch (e) {
      console.warn('[Prerender] Failed to load generatedMaterials.js:', e.message);
    }
  }

  if (materials.length === 0) {
    const dbFilePath = path.join(rootDir, 'src', 'data', 'materials.db.js');
    if (fs.existsSync(dbFilePath)) {
      try {
        const mod = await import(`file://${dbFilePath}`);
        materials = mod.materials || [];
      } catch (e) {
        console.warn('[Prerender] Failed to load materials.db.js:', e.message);
      }
    }
  }

  console.log(`[Prerender] Loaded ${materials.length} product materials.`);

  // 1. Static Pages Meta & snapshot generation
  const staticPages = [
    {
      route: '/',
      outPath: path.join(distDir, 'index.html'),
      title: '동경바닥재 | KCC·LX·동신 프리미엄 바닥재·데코타일·마루·장판 유통 전문',
      description: '동경바닥재 - 국내 주요 브랜드(KCC, LX, 동신, 재영, 이건 등) 데코타일, 마루, 장판, 벽지 전문 유통. 자재 조회, 샘플북, 시공사례 및 자동 견적 서비스를 제공합니다.',
      canonical: `${BASE_URL}/`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': '동경바닥재 (DK Floor)',
        'alternateName': 'DK Floor',
        'url': BASE_URL,
        'logo': `${BASE_URL}/dk-apple-touch-icon-transparent.png`,
        'image': `${BASE_URL}/dk-apple-touch-icon-transparent.png`,
        'description': '국내 주요 브랜드(KCC, LX, 동신, 재영, 이건 등) 데코타일, 마루, 장판, 벽지 등 프리미엄 바닥재 전문 유통 브랜드',
        'telephone': '1668-5244',
        'priceRange': '₩₩',
        'address': { '@type': 'PostalAddress', 'addressCountry': 'KR' }
      },
      contentHtml: `
        <header style="padding: 20px; text-align: center;">
          <h1>동경바닥재 - 프리미엄 바닥재 유통 전문</h1>
          <p>KCC, LX하우시스, 동신포리마, 이건마루, 재영 등 전 브랜드 정품 자재 공급</p>
        </header>
        <main style="padding: 20px; max-width: 1200px; margin: 0 auto;">
          <h2>주요 제품 카테고리</h2>
          <ul>
            <li><a href="/materials?category=데코타일">데코타일 (KCC 센스타일, 동신 아미스, LX 에코노)</a></li>
            <li><a href="/materials?category=장판">장판 (LX 지아자연애, KCC 숲, 현대 륨)</a></li>
            <li><a href="/materials?category=마루">마루 (이건마루, 구정마루, LX 강마루)</a></li>
            <li><a href="/materials?category=벽지">벽지 (LX 베스띠, 개나리, 서울벽지)</a></li>
          </ul>
        </main>
      `
    },
    {
      route: '/materials',
      outPath: path.join(distDir, 'materials', 'index.html'),
      title: '자재찾기 | 동경바닥재 - 데코타일, 장판, 마루, 벽지, 카페트타일 조회',
      description: '동경바닥재 자재찾기 - KCC, LX, 동신, 재영, 이건 등 국내 주요 바닥재 자재를 상품명, 제품코드, 규격별로 편리하게 검색하고 상세 정보를 확인하세요.',
      canonical: `${BASE_URL}/materials`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': '홈', 'item': `${BASE_URL}/` },
          { '@type': 'ListItem', 'position': 2, 'name': '자재찾기', 'item': `${BASE_URL}/materials` }
        ]
      },
      contentHtml: `
        <main style="padding: 20px; max-width: 1200px; margin: 0 auto;">
          <h1>자재찾기 - 동경바닥재</h1>
          <p>브랜드, 규격, 카테고리별 프리미엄 바닥재 자재 조회</p>
        </main>
      `
    },
    {
      route: '/samplebooks',
      outPath: path.join(distDir, 'samplebooks', 'index.html'),
      title: '샘플북 조회 | 동경바닥재 - 브랜드별 E-카탈로그 및 Sample Book',
      description: 'KCC, LX, 동신, 재영, 이건, 구정 등 바닥재 대표 제조사의 E-카탈로그 및 샘플북을 고해상도로 편리하게 조회하세요.',
      canonical: `${BASE_URL}/samplebooks`,
      contentHtml: `
        <main style="padding: 20px; max-width: 1200px; margin: 0 auto;">
          <h1>샘플북 및 E-카탈로그</h1>
          <p>KCC 센스타일, LX하우시스, 동신포리마, 이건마루 고해상도 샘플북</p>
        </main>
      `
    },
    {
      route: '/cases',
      outPath: path.join(distDir, 'cases', 'index.html'),
      title: '시공사례 | 동경바닥재 - 데코타일·마루·장판 실제 바닥 시공 포트폴리오',
      description: '동경바닥재의 실제 주거, 사무, 상업 공간 바닥재(데코타일, 마루, 장판, 카페트타일) 시공사례 포트폴리오를 확인하세요.',
      canonical: `${BASE_URL}/cases`,
      contentHtml: `
        <main style="padding: 20px; max-width: 1200px; margin: 0 auto;">
          <h1>실제 바닥 시공사례 포트폴리오</h1>
          <p>아파트, 오피스, 상가 건물 데코타일, 마루, 장판 시공사례</p>
        </main>
      `
    },
    {
      route: '/estimate',
      outPath: path.join(distDir, 'estimate', 'index.html'),
      title: '자동 견적 및 상담 문의 | 동경바닥재',
      description: '동경바닥재 자재 수량 계산기 및 자동 견적 시스템. 면적(㎡, 평) 입력 시 수량 및 예상 자재비를 실시간 계산하고 상담을 신청하세요.',
      canonical: `${BASE_URL}/estimate`,
      contentHtml: `
        <main style="padding: 20px; max-width: 1200px; margin: 0 auto;">
          <h1>실시간 자재 수량 계산기 & 자동 견적</h1>
          <p>시공 면적 입력 시 박스 수량 및 추정 자재비 계산</p>
        </main>
      `
    },
    {
      route: '/privacy-policy',
      outPath: path.join(distDir, 'privacy-policy', 'index.html'),
      title: '개인정보 처리방침 | 동경바닥재',
      description: '동경바닥재 개인정보 처리방침 안내',
      canonical: `${BASE_URL}/privacy-policy`
    },
    {
      route: '/terms-of-service',
      outPath: path.join(distDir, 'terms-of-service', 'index.html'),
      title: '서비스 이용약관 | 동경바닥재',
      description: '동경바닥재 서비스 이용약관 안내',
      canonical: `${BASE_URL}/terms-of-service`
    }
  ];

  function generatePageHtml(meta) {
    let html = baseHtml;

    if (meta.title) {
      html = html.replace(/<title>.*?<\/title>/i, `<title>${htmlEscape(meta.title)}<\/title>`);
    }

    let metaTags = '';
    metaTags += `\n    <meta name="description" content="${htmlEscape(meta.description || '')}" />`;
    metaTags += `\n    <meta name="robots" content="${meta.noindex ? 'noindex, nofollow' : 'index, follow'}" />`;
    if (meta.canonical) {
      metaTags += `\n    <link rel="canonical" href="${htmlEscape(meta.canonical)}" />`;
    }

    metaTags += `\n    <meta property="og:title" content="${htmlEscape(meta.title || '')}" />`;
    metaTags += `\n    <meta property="og:description" content="${htmlEscape(meta.description || '')}" />`;
    metaTags += `\n    <meta property="og:url" content="${htmlEscape(meta.canonical || BASE_URL)}" />`;
    metaTags += `\n    <meta property="og:image" content="${htmlEscape(meta.ogImage || `${BASE_URL}/dk-apple-touch-icon-transparent.png`)}" />`;
    metaTags += `\n    <meta property="og:type" content="${meta.ogType || 'website'}" />`;
    metaTags += `\n    <meta property="og:site_name" content="동경바닥재" />`;

    metaTags += `\n    <meta name="twitter:card" content="summary_large_image" />`;
    metaTags += `\n    <meta name="twitter:title" content="${htmlEscape(meta.title || '')}" />`;
    metaTags += `\n    <meta name="twitter:description" content="${htmlEscape(meta.description || '')}" />`;
    metaTags += `\n    <meta name="twitter:image" content="${htmlEscape(meta.ogImage || `${BASE_URL}/dk-apple-touch-icon-transparent.png`)}" />`;

    if (meta.jsonLd) {
      const jsonStr = JSON.stringify(meta.jsonLd);
      metaTags += `\n    <script type="application/ld+json" data-seo="json-ld">${jsonStr}</script>`;
    }

    html = html.replace(/<meta name="description"[^>]*>/gi, '');
    html = html.replace('</head>', `${metaTags}\n  </head>`);

    if (meta.contentHtml) {
      html = html.replace('<div id="root"></div>', `<div id="root">${meta.contentHtml}</div>`);
    }

    return html;
  }

  // Generate static pages
  for (const page of staticPages) {
    const dir = path.dirname(page.outPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const html = generatePageHtml(page);
    fs.writeFileSync(page.outPath, html, 'utf8');
    console.log(`[Prerender] Wrote static snapshot: ${page.route} -> ${page.outPath}`);
  }

  // 2. Generate Product Detail SSG snapshots for ALL candidate identifiers
  let prodCount = 0;
  const createdPaths = new Set();

  for (const item of materials) {
    const brand = getBrandName(item);
    const category = item.category || '바닥재';
    const line = item.line || '';
    const name = item.name || item.code || '';
    const code = item.code || '';

    // Collect all valid URL key aliases for this product
    const candidateKeys = new Set();

    if (item.id) candidateKeys.add(String(item.id));
    if (item.product_id) candidateKeys.add(String(item.product_id));
    if (item.slug) candidateKeys.add(String(item.slug));
    if (code) {
      candidateKeys.add(code);
      candidateKeys.add(code.replace(/\s+/g, '_'));
      candidateKeys.add(code.replace(/\s+/g, '-'));
    }
    const autoSlug = generateSlug(item);
    if (autoSlug) candidateKeys.add(autoSlug);

    const primaryKey = item.slug || String(item.id || code);

    const displayName = `${brand} ${line} ${name}`.replace(/\s+/g, ' ').trim();
    const pageTitle = `${brand} ${line ? `${line} ` : ''}${name} ${category} | 동경바닥재`.replace(/\s+/g, ' ').trim();

    const size = item.specs?.size || item.spec || item.size_text || '';
    const thickness = item.thickness || item.specs?.thickness || '';
    const packing = item.specs?.packing || item.unit || item.packing || '';
    const unit = item.unit || '박스';
    const adhesive = (category === '데코타일') ? '데코타일 본드' : (item.adhesive || '권장 전용 본드');

    const descParts = [];
    if (brand) descParts.push(`브랜드: ${brand}`);
    if (category) descParts.push(`카테고리: ${category}`);
    if (line) descParts.push(`라인업: ${line}`);
    if (code) descParts.push(`제품코드: ${code}`);
    if (thickness) descParts.push(`두께: ${thickness}`);
    if (size) descParts.push(`규격: ${size}`);
    if (packing) descParts.push(`포장: ${packing}`);
    if (unit) descParts.push(`판매단위: ${unit}`);
    if (adhesive) descParts.push(`권장접착제: ${adhesive}`);

    const pageDesc = `${displayName}. ${descParts.join(', ')}. 동경바닥재 정품 자재 정보 조회 및 견적 요청.`;
    const canonicalUrl = `${BASE_URL}/materials/${encodeURIComponent(primaryKey)}`;
    const imgUrl = item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${BASE_URL}${item.thumbnail}`) : `${BASE_URL}/dk-apple-touch-icon-transparent.png`;

    const numericPrice = typeof item.price === 'number' && item.price > 0 ? item.price : null;

    const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': displayName,
      'image': [imgUrl],
      'description': pageDesc,
      'sku': code || String(primaryKey),
      'brand': { '@type': 'Brand', 'name': brand },
      'url': canonicalUrl,
      ...(numericPrice ? {
        'offers': {
          '@type': 'Offer',
          'url': canonicalUrl,
          'priceCurrency': 'KRW',
          'price': numericPrice,
          'itemCondition': 'https://schema.org/NewCondition'
        }
      } : {})
    };

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': '홈', 'item': `${BASE_URL}/` },
        { '@type': 'ListItem', 'position': 2, 'name': '자재찾기', 'item': `${BASE_URL}/materials` },
        { '@type': 'ListItem', 'position': 3, 'name': category, 'item': `${BASE_URL}/materials?category=${encodeURIComponent(category)}` },
        { '@type': 'ListItem', 'position': 4, 'name': displayName, 'item': canonicalUrl }
      ]
    };

    const contentHtml = `
      <article style="max-width: 1000px; margin: 0 auto; padding: 20px; font-family: Pretendard, sans-serif;">
        <nav style="font-size: 14px; color: #666; margin-bottom: 20px;">
          <a href="/">홈</a> &gt; <a href="/materials">자재찾기</a> &gt; <a href="/materials?category=${encodeURIComponent(category)}">${htmlEscape(category)}</a> &gt; <span>${htmlEscape(displayName)}</span>
        </nav>
        <h1 style="font-size: 24px; font-weight: 700; color: #111; margin-bottom: 12px;">${htmlEscape(displayName)}</h1>
        <div style="display: flex; gap: 30px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 280px;">
            <img src="${htmlEscape(imgUrl)}" alt="${htmlEscape(displayName)}" style="width: 100%; border-radius: 8px; border: 1px solid #eee;" />
          </div>
          <div style="flex: 1.2; min-width: 300px;">
            <h2 style="font-size: 18px; margin-bottom: 16px; color: #333;">자재 상세 정보</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; border-top: 2px solid #333;">
              <tbody>
                <tr style="border-bottom: 1px solid #eee;"><th style="padding: 10px; background: #f9f9f9; text-align: left; width: 120px;">제조 브랜드</th><td style="padding: 10px;">${htmlEscape(brand)}</td></tr>
                <tr style="border-bottom: 1px solid #eee;"><th style="padding: 10px; background: #f9f9f9; text-align: left;">카테고리</th><td style="padding: 10px;">${htmlEscape(category)}</td></tr>
                ${line ? `<tr style="border-bottom: 1px solid #eee;"><th style="padding: 10px; background: #f9f9f9; text-align: left;">라인업</th><td style="padding: 10px;">${htmlEscape(line)}</td></tr>` : ''}
                ${code ? `<tr style="border-bottom: 1px solid #eee;"><th style="padding: 10px; background: #f9f9f9; text-align: left;">자재 식별 코드</th><td style="padding: 10px;">${htmlEscape(code)}</td></tr>` : ''}
                ${thickness ? `<tr style="border-bottom: 1px solid #eee;"><th style="padding: 10px; background: #f9f9f9; text-align: left;">두께 규격</th><td style="padding: 10px;">${htmlEscape(thickness)}</td></tr>` : ''}
                ${size ? `<tr style="border-bottom: 1px solid #eee;"><th style="padding: 10px; background: #f9f9f9; text-align: left;">제품 가로세로 규격</th><td style="padding: 10px;">${htmlEscape(size)}</td></tr>` : ''}
                ${packing ? `<tr style="border-bottom: 1px solid #eee;"><th style="padding: 10px; background: #f9f9f9; text-align: left;">포장 패킹 단위</th><td style="padding: 10px;">${htmlEscape(packing)}</td></tr>` : ''}
                <tr style="border-bottom: 1px solid #eee;"><th style="padding: 10px; background: #f9f9f9; text-align: left;">판매 단위</th><td style="padding: 10px;">${htmlEscape(unit)}</td></tr>
                <tr style="border-bottom: 1px solid #eee;"><th style="padding: 10px; background: #f9f9f9; text-align: left;">권장 접착 자재</th><td style="padding: 10px;">${htmlEscape(adhesive)}</td></tr>
                ${numericPrice ? `<tr style="border-bottom: 1px solid #eee;"><th style="padding: 10px; background: #f9f9f9; text-align: left;">판매 가격</th><td style="padding: 10px; font-weight: bold; color: #d9534f;">${numericPrice.toLocaleString()} 원 / ${htmlEscape(unit)}</td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    `;

    const html = generatePageHtml({
      title: pageTitle,
      description: pageDesc,
      canonical: canonicalUrl,
      ogImage: imgUrl,
      ogType: 'product',
      jsonLd: [productJsonLd, breadcrumbJsonLd],
      contentHtml
    });

    for (const key of candidateKeys) {
      if (!key) continue;
      const outPath = path.join(distDir, 'materials', key, 'index.html');
      if (createdPaths.has(outPath)) continue;
      createdPaths.add(outPath);

      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(outPath, html, 'utf8');
      prodCount++;
    }
  }

  console.log(`[Prerender] Successfully generated ${prodCount} product static SSG pages across all candidate identifiers in dist/materials/`);
}

runPrerender().catch(err => {
  console.error('[Prerender Error]:', err);
  process.exit(1);
});
