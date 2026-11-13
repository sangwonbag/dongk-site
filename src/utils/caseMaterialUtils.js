import { materials } from '../data/materials.db.js';

const KNOWN_BRANDS = [
  'KCC', 'LX하우시스', 'LX', '동신', '재영', '녹수', '현대', '우성', '동화', '구정', '스완', '이건'
];

// High-performance O(1) indices to eliminate repeated 4,300+ array scans
const materialById = new Map();
const materialByCode = new Map();

for (const m of materials) {
  if (m.id) {
    materialById.set(m.id.toLowerCase(), m);
  }
  if (m.code) {
    const norm = String(m.code).replace(/[-\s]/g, '').toUpperCase();
    if (!materialByCode.has(norm)) {
      materialByCode.set(norm, m);
    }
  }
}

// In-memory cache for resolved case material links
const caseLinksCache = new Map();

/**
 * Smart material matcher for construction case summary strings.
 * Scores matches using extracted codes, brands, and line names.
 */
export function matchMaterialFromText(text) {
  if (!text) return null;
  const clean = text.trim();

  // Identify brand hint
  const brandUpper = clean.toUpperCase();
  const matchedBrand = KNOWN_BRANDS.find(b => brandUpper.includes(b.toUpperCase()));

  // Extract candidate codes (e.g., PTT8698, TS5534M, TS 5534, AH 726, 726, 5551, 6740)
  const codeMatches = clean.match(/([A-Z]{2,5}[-\s]?[0-9]{3,5}[A-Z]?)|([0-9]{3,5})/gi) || [];

  // Fast O(1) exact match check
  for (const rawCode of codeMatches) {
    const normCode = rawCode.replace(/[-\s]/g, '').toUpperCase();
    if (normCode && materialByCode.has(normCode)) {
      const direct = materialByCode.get(normCode);
      if (!matchedBrand || String(direct.brand || '').toUpperCase().includes(matchedBrand.toUpperCase())) {
        return direct;
      }
    }
  }

  const candidates = [];

  for (const rawCode of codeMatches) {
    const normCode = rawCode.replace(/[-\s]/g, '').toUpperCase();
    if (!normCode) continue;

    for (const m of materials) {
      let score = 0;
      const mCodeNorm = String(m.code || '').replace(/[-\s]/g, '').toUpperCase();
      const mIdNorm = String(m.id || '').replace(/[-\s]/g, '').toUpperCase();
      const mBrandNorm = String(m.brand || '').toUpperCase();

      if (mCodeNorm === normCode) {
        score += 100;
      } else if (mCodeNorm.startsWith(normCode)) {
        score += 60;
      } else if (mIdNorm.includes(normCode)) {
        score += 50;
      }

      if (matchedBrand && mBrandNorm.includes(matchedBrand.toUpperCase())) {
        score += 40;
      }

      // Small bonus if product name is contained in the text
      if (m.name && m.name.trim().length >= 3 && clean.includes(m.name.trim())) {
        score += 30;
      }

      if (score > 50) {
        candidates.push({ material: m, score });
      }
    }
  }

  // Fallback: If no code matches, check if any product name (>= 4 chars) is included
  if (candidates.length === 0) {
    for (const m of materials) {
      if (m.name && m.name.trim().length >= 4 && clean.includes(m.name.trim())) {
        let score = 60;
        if (matchedBrand && String(m.brand || '').toUpperCase().includes(matchedBrand.toUpperCase())) {
          score += 40;
        }
        candidates.push({ material: m, score });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.length > 0 ? candidates[0].material : null;
}

/**
 * Resolves one or more clickable material links for a construction case item.
 * Adheres strictly to requirements:
 * 1. Checks joined product/product_id first.
 * 2. If valid direct product exists, links to /materials/:id
 * 3. If ID not determinable, links to /materials?search=CODE
 * 4. Supports multiple products cleanly.
 */
export function resolveCaseMaterialLinks(caseItem) {
  if (!caseItem) return [];

  const cacheKey = caseItem.id || caseItem.slug || caseItem.material_summary;
  if (cacheKey && caseLinksCache.has(cacheKey)) {
    return caseLinksCache.get(cacheKey);
  }

  const links = [];

  // Case A: Explicit products joined from Supabase
  if (caseItem.products && (caseItem.products.slug || caseItem.products.id)) {
    const p = caseItem.products;
    const directSlug = p.slug;

    // Fast O(1) indexed lookup in materials
    const matched = (directSlug && materialById.get(directSlug.toLowerCase())) ||
      (p.product_code && materialByCode.get(p.product_code.replace(/[-\s]/g, '').toUpperCase()));

    const targetId = matched ? matched.id : directSlug;
    links.push({
      label: caseItem.material_summary || p.name || p.product_code || '시공 자재 상세',
      path: targetId ? `/materials/${encodeURIComponent(targetId)}` : `/materials?search=${encodeURIComponent(p.product_code || '')}`,
      isDirectDetail: Boolean(targetId),
      code: p.product_code || matched?.code || ''
    });

    if (cacheKey) caseLinksCache.set(cacheKey, links);
    return links;
  }

  const summary = (caseItem.material_summary || '').trim();
  if (!summary) return links;

  // Split multiple products if comma-separated
  const chunks = summary.includes(',')
    ? summary.split(',').map(s => s.trim()).filter(Boolean)
    : [summary];

  chunks.forEach(chunk => {
    // Clean chunk for label display (remove trailing specs like · 3.0T if appropriate, but preserve context)
    const matched = matchMaterialFromText(chunk);

    if (matched) {
      links.push({
        label: chunk,
        path: `/materials/${encodeURIComponent(matched.id)}`,
        isDirectDetail: true,
        code: matched.code || ''
      });
    } else {
      // Extract code or fallback keyword for search
      const codeMatch = chunk.match(/([A-Z]{2,5}[-\s]?[0-9]{3,5}[A-Z]?)|([0-9]{3,5})/i);
      const code = codeMatch ? codeMatch[0].trim() : '';
      const fallbackSearch = code || chunk.split('·')[0].trim();

      links.push({
        label: chunk,
        path: `/materials?search=${encodeURIComponent(fallbackSearch)}`,
        isDirectDetail: false,
        code
      });
    }
  });

  if (cacheKey) caseLinksCache.set(cacheKey, links);
  return links;
}

/**
 * Finds matching numeric product ID from Supabase products table.
 * Used by admin when selecting products for construction cases.
 */
export async function findSupabaseProductId(supabaseClient, material) {
  if (!supabaseClient || !material) return null;
  try {
    const rawCode = (material.code || '').trim();
    const cleanCode = rawCode.replace(/\s+/g, '');

    // 1. Try exact product_code match
    if (cleanCode) {
      const { data } = await supabaseClient
        .from('products')
        .select('id, slug, product_code')
        .or(`product_code.eq.${cleanCode},product_code.eq.${rawCode}`)
        .limit(1)
        .maybeSingle();

      if (data?.id) return data.id;
    }

    // 2. Try slug match
    if (material.id) {
      const { data: slugData } = await supabaseClient
        .from('products')
        .select('id')
        .eq('slug', material.id)
        .limit(1)
        .maybeSingle();

      if (slugData?.id) return slugData.id;
    }

    // 3. Try ilike on code
    if (cleanCode && cleanCode.length >= 3) {
      const { data: ilikeData } = await supabaseClient
        .from('products')
        .select('id')
        .ilike('product_code', `%${cleanCode}%`)
        .limit(1)
        .maybeSingle();

      if (ilikeData?.id) return ilikeData.id;
    }
  } catch (err) {
    console.warn('[caseMaterialUtils] findSupabaseProductId failed:', err);
  }
  return null;
}

export function searchMaterialsForAdmin(query, limit = 15) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toUpperCase();
  const qNoSpace = q.replace(/\s+/g, '');

  const results = [];

  for (const m of materials) {
    const code = String(m.code || '').toUpperCase();
    const codeNoSpace = code.replace(/\s+/g, '');
    const name = String(m.name || '').toUpperCase();
    const brand = String(m.brand || '').toUpperCase();
    const id = String(m.id || '').toUpperCase();

    let score = 0;
    if (codeNoSpace === qNoSpace) score += 100;
    else if (codeNoSpace.startsWith(qNoSpace)) score += 80;
    else if (code.includes(q)) score += 60;
    else if (id.includes(qNoSpace)) score += 50;

    if (name.includes(q)) score += 40;
    if (brand.includes(q)) score += 20;

    if (score > 0) {
      results.push({ item: m, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map(r => r.item);
}
