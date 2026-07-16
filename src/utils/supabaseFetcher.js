import { supabase } from '../lib/supabaseClient';
import { materials } from '../data/materials.db'; // Local fallback data
import { dongshinPolymer2026 } from '../data/dongshinPolymer2026.js';
import { normalizeProductDetails } from './brandUtils';

const normalizeText = (value = "") =>
  String(value).replace(/\s+/g, "").toLowerCase().trim();

const getMaterialMatchKey = (item) => {
  if (!item) return "";
  const brand = normalizeText(item.brand);
  const category = normalizeText(item.category);
  const line = normalizeText(item.line);
  const name = normalizeText(item.name || item.productName);

  // 제품코드가 있는 브랜드는 code 기준
  if (item.code) {
    return `${brand}_${category}_${normalizeText(item.code)}`;
  }

  // 이건마루처럼 code가 없는 제품은 line + name 기준
  return `${brand}_${category}_${line}_${name}`;
};

let cachedProducts = null;
const filteredProductsCache = new Map();

export async function fetchAllProducts(forceRefresh = false) {
  if (cachedProducts && !forceRefresh) {
    return cachedProducts;
  }

  let data = null;
  let fetchError = null;

  if (supabase) {
    console.log("Fetching all products from Supabase DB with pagination...");
    try {
      let allProducts = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: chunk, error } = await supabase
          .from('products')
          .select(`
            *,
            categories ( id, name ),
            brands ( id, name )
          `)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          fetchError = error;
          break;
        }

        if (!chunk || chunk.length === 0) {
          hasMore = false;
        } else {
          allProducts = allProducts.concat(chunk);
          if (chunk.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      if (!fetchError) {
        data = allProducts;
      }
    } catch (e) {
      console.error("Supabase fetch failed with exception:", e);
      fetchError = e;
    }
  } else {
    console.warn("Supabase client is not initialized. Using local fallback data.");
  }

  if (fetchError || !data || data.length === 0) {
    console.warn("Supabase load failed or returned no data. Falling back to local materials database...", fetchError);
    
    // Map local materials to the frontend product structure
    cachedProducts = (materials || []).map(m => {
      const mapped = {
        id: m.id || m.code,
        code: m.code || "",
        name: m.name || "",
        brand: m.brand || "",
        category: m.category || "",
        price: m.price || 0,
        thickness: m.thickness || "",
        specs: m.specs || {
          thickness: m.thickness || "",
          size: "",
          packing: ""
        },
        thumbnail: m.thumbnail || null,
        images: m.images || [],
        line: m.line || "",
        type: m.type || "",
        active: m.active ?? true
      };

      if (m.collection) mapped.collection = m.collection;
      if (m.series) mapped.series = m.series;
      if (m.subCategory) mapped.subCategory = m.subCategory;
      if (m.catalog) mapped.catalog = m.catalog;
      if (m.productName) mapped.productName = m.productName;
      if (m.shape) mapped.shape = m.shape;
      if (m.pattern) mapped.pattern = m.pattern;
      if (m.specs && m.specs.area) {
        if (!mapped.specs) mapped.specs = {};
        mapped.specs.area = m.specs.area;
      }

      return normalizeProductDetails(mapped);
    });

    console.log("Successfully loaded local fallback materials:", cachedProducts.length);
    return cachedProducts;
  }

  console.log("Supabase response raw rows count:", data.length);

  // Map database columns to the frontend object structure safely
  cachedProducts = deduplicateProducts(data.map(mapProductRow));

  console.log("Successfully loaded and mapped products from Supabase (deduplicated):", cachedProducts.length);
  return cachedProducts;
}

export function mapProductRow(p) {
  const code = p.product_code || "";
  const brandName = p.brands?.name || "";
  const categoryName = p.categories?.name || "";

  // Find matching Dongshin PDF product to enrich properties
  const dongshinMatch = (brandName === '동신' && categoryName === '데코타일')
    ? dongshinPolymer2026.find(d => d.code.toUpperCase() === code.toUpperCase())
    : null;

  const dbItem = {
    brand: brandName,
    category: categoryName,
    line: p.description || "",
    name: p.name || "",
    code: p.product_code || null
  };
  const dbKey = getMaterialMatchKey(dbItem);
  const localMatch = materials.find(m => getMaterialMatchKey(m) === dbKey);

  const mapped = {
    id: p.slug || String(p.id),
    code: code,
    name: p.name || "",
    brand: brandName,
    category: categoryName,
    price: p.price || 0,
    thickness: p.thickness || "",
    specs: {
      thickness: p.thickness || "",
      size: p.size_text || "",
      packing: p.unit || ""
    },
    thumbnail: p.image_url || null,
    image: p.image_url || null,
    line: p.description || "",
    description: p.description || "",
    featured: p.is_featured || false,
    active: p.is_active ?? true
  };

  if (dongshinMatch) {
    mapped.collection = dongshinMatch.collection;
    mapped.series = dongshinMatch.series;
    mapped.catalog = dongshinMatch.catalog;
    mapped.productName = dongshinMatch.productName;
    // Overwrite name to match code
    mapped.name = dongshinMatch.code;
  }

  if (localMatch) {
    mapped.collection = localMatch.collection;
    mapped.series = localMatch.series;
    mapped.note = localMatch.note;
    mapped.catalog = localMatch.catalog;
    mapped.productName = localMatch.productName;
    if (localMatch.subCategory) {
      mapped.subCategory = localMatch.subCategory;
    }
    if (localMatch.sizeOptions) {
      mapped.sizeOptions = localMatch.sizeOptions;
    }
    if (localMatch.shape) {
      mapped.shape = localMatch.shape;
    }
    if (localMatch.pattern) {
      mapped.pattern = localMatch.pattern;
    }
    if (localMatch.specs && localMatch.specs.area) {
      if (!mapped.specs) mapped.specs = {};
      mapped.specs.area = localMatch.specs.area;
    }
  }

  return normalizeProductDetails(mapped);
}

export function deduplicateProducts(productList) {
  const seenProducts = new Map();
  const deduplicatedProducts = [];

  for (const m of productList) {
    const brand = normalizeText(m.brand);
    const category = normalizeText(m.category);
    const line = normalizeText(m.line);
    const name = normalizeText(m.name || m.productName);
    const key = `${brand}_${category}_${line}_${name}`;

    if (seenProducts.has(key)) {
      const existing = seenProducts.get(key);
      if (m.sizeOptions && m.sizeOptions.length > 0) {
        if (!existing.sizeOptions || existing.sizeOptions.length < m.sizeOptions.length) {
          existing.sizeOptions = m.sizeOptions;
        }
      }
    } else {
      seenProducts.set(key, m);
      deduplicatedProducts.push(m);
    }
  }

  return deduplicatedProducts;
}

export async function fetchFilteredProducts({ category, brand, searchText }) {
  if (!supabase) {
    console.warn("Supabase client is not initialized. Using local fallback filtering.");
    const all = await fetchAllProducts();
    return filterLocalProducts(all, { category, brand, searchText });
  }

  const cacheKey = `${category || 'all'}:${brand || 'all'}:${searchText || ''}`;
  if (filteredProductsCache.has(cacheKey)) {
    return filteredProductsCache.get(cacheKey);
  }

  let query = supabase
    .from('products')
    .select(`
      id, slug, name, product_code, price, thickness, size_text, unit, image_url, description, is_featured, is_active, sort_order,
      categories!inner ( id, name ),
      brands!inner ( id, name )
    `)
    .eq('is_active', true);

  if (searchText) {
    const s = searchText.trim();
    query = query.or(`name.ilike.%${s}%,product_code.ilike.%${s}%,description.ilike.%${s}%`);
  } else {
    if (category && category !== 'all') {
      query = query.eq('categories.name', category);
    }
    if (brand && brand !== 'all') {
      const b = brand.toUpperCase();
      if (b === 'LX') {
        query = query.or('name.ilike.%LX%,name.ilike.%LG%', { foreignTable: 'brands' });
      } else if (b === 'DID') {
        query = query.or('name.ilike.%DID%,name.ilike.%디아이디%', { foreignTable: 'brands' });
      } else if (b === '신한') {
        query = query.like('brands.name', '%신한%');
      } else if (b === '현대' || b === '현대벽지') {
        query = query.like('brands.name', '%현대%');
      } else if (b === '어반') {
        query = query.or('name.ilike.%어반%,name.ilike.%URBAN%', { foreignTable: 'brands' });
      } else {
        query = query.ilike('brands.name', `%${brand}%`);
      }
    }
  }

  query = query.order('sort_order', { ascending: true }).order('id', { ascending: false });

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const mapped = deduplicateProducts((data || []).map(mapProductRow));
  filteredProductsCache.set(cacheKey, mapped);
  return mapped;
}

function filterLocalProducts(list, { category, brand, searchText }) {
  if (searchText) {
    const s = searchText.trim().toLowerCase();
    return list.filter(m => 
      String(m.name).toLowerCase().includes(s) || 
      String(m.code).toLowerCase().includes(s) || 
      String(m.brand).toLowerCase().includes(s) ||
      String(m.line).toLowerCase().includes(s)
    );
  }
  return list.filter(m => {
    const catOk = !category || category === 'all' || m.category === category;
    let brandOk = false;
    if (!brand || brand === 'all') {
      brandOk = true;
    } else {
      const b = brand.toUpperCase();
      const itemBrand = (m.brand || "").toUpperCase();
      const compBrand = (m.computedBrand || "").toUpperCase();
      if (b === 'LX') {
        brandOk = itemBrand.includes("LX") || itemBrand.includes("LG") || compBrand.includes("LX");
      } else if (b === 'DID') {
        brandOk = itemBrand.includes("DID") || itemBrand.includes("디아이디");
      } else if (b === '신한') {
        brandOk = itemBrand.includes("신한");
      } else if (b === '현대' || b === '현대벽지') {
        brandOk = itemBrand.includes("현대");
      } else if (b === '어반') {
        brandOk = itemBrand.includes("어반") || itemBrand.includes("URBAN");
      } else {
        brandOk = itemBrand.includes(b) || compBrand.includes(b);
      }
    }
    return catOk && brandOk;
  });
}

export function clearProductCache() {
  cachedProducts = null;
  filteredProductsCache.clear();
}

let cachedBrands = [];
export async function fetchBrands() {
  if (cachedBrands.length > 0) return cachedBrands;
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('brands').select('id, name').eq('is_active', true);
    if (error) {
      console.error('[fetchBrands Error]:', error);
      return [];
    }
    cachedBrands = data || [];
    return cachedBrands;
  } catch (err) {
    console.error('[fetchBrands Exception]:', err);
    return [];
  }
}

export async function searchProductsServer(queryText, signal) {
  if (!supabase) {
    console.warn("Supabase client not initialized. Falling back to local search.");
    const all = await fetchAllProducts();
    const s = queryText.toLowerCase().trim();
    if (!s) return [];
    return all.filter(m => 
      String(m.name).toLowerCase().includes(s) || 
      String(m.code).toLowerCase().includes(s) || 
      String(m.brand).toLowerCase().includes(s) ||
      String(m.description || m.line).toLowerCase().includes(s)
    );
  }

  const s = queryText.trim();
  if (!s) return [];

  try {
    const brandsList = await fetchBrands();
    const tokens = s.toLowerCase().split(/[\s\-_()]+/).filter(Boolean);

    let matchedBrand = null;
    const remainingTokens = [];

    for (const token of tokens) {
      const found = brandsList.find(b => 
        b.name.toLowerCase() === token || 
        (token === 'lg' && b.name.toLowerCase() === 'lx') ||
        (token === '엘지' && b.name.toLowerCase() === 'lx')
      );
      if (found && !matchedBrand) {
        matchedBrand = found;
      } else {
        remainingTokens.push(token);
      }
    }

    const searchVal = remainingTokens.join(' ').trim();
    const queries = [];

    // Prioritized sub-queries to prevent truncation of exact/prefix matches:
    
    // Query 1: Exact matches on product code or name (highest priority)
    let q1 = supabase
      .from('products')
      .select(`
        id, slug, name, product_code, price, thickness, size_text, unit, image_url, description, is_active,
        categories ( id, name ),
        brands ( id, name )
      `)
      .eq('is_active', true);
    if (matchedBrand) q1 = q1.eq('brand_id', matchedBrand.id);
    if (searchVal) q1 = q1.or(`product_code.eq.${searchVal},name.eq.${searchVal}`);
    if (signal) q1 = q1.abortSignal(signal);
    queries.push(q1.limit(20));

    if (searchVal) {
      // Query 2: Product code prefix match
      let q2 = supabase
        .from('products')
        .select(`
          id, slug, name, product_code, price, thickness, size_text, unit, image_url, description, is_active,
          categories ( id, name ),
          brands ( id, name )
        `)
        .eq('is_active', true);
      if (matchedBrand) q2 = q2.eq('brand_id', matchedBrand.id);
      q2 = q2.ilike('product_code', `${searchVal}%`);
      if (signal) q2 = q2.abortSignal(signal);
      queries.push(q2.limit(20));

      // Query 3: Product name prefix match
      let q3 = supabase
        .from('products')
        .select(`
          id, slug, name, product_code, price, thickness, size_text, unit, image_url, description, is_active,
          categories ( id, name ),
          brands ( id, name )
        `)
        .eq('is_active', true);
      if (matchedBrand) q3 = q3.eq('brand_id', matchedBrand.id);
      q3 = q3.ilike('name', `${searchVal}%`);
      if (signal) q3 = q3.abortSignal(signal);
      queries.push(q3.limit(20));

      // Query 4: Contains matches on product code, name, or description
      let q4 = supabase
        .from('products')
        .select(`
          id, slug, name, product_code, price, thickness, size_text, unit, image_url, description, is_active,
          categories ( id, name ),
          brands ( id, name )
        `)
        .eq('is_active', true);
      if (matchedBrand) q4 = q4.eq('brand_id', matchedBrand.id);
      q4 = q4.or(`product_code.ilike.%${searchVal}%,name.ilike.%${searchVal}%,description.ilike.%${searchVal}%`);
      if (signal) q4 = q4.abortSignal(signal);
      queries.push(q4.limit(20));
    }

    const results = await Promise.all(queries);
    const merged = [];
    const seenIds = new Set();

    for (const res of results) {
      if (res.error) {
        if (res.error.message && res.error.message.includes('aborted')) {
          const abortErr = new Error('aborted');
          abortErr.name = 'AbortError';
          throw abortErr;
        }
        console.error('[searchProductsServer Subquery Error]:', res.error);
        continue;
      }
      if (res.data) {
        for (const rawItem of res.data) {
          const item = mapProductRow(rawItem);
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            merged.push(item);
          }
        }
      }
    }

    const deduplicated = deduplicateProducts(merged);

    const getMatchTier = (item, queryStr) => {
      const code = (item.code || "").toLowerCase().trim();
      const name = (item.name || "").toLowerCase().trim();
      const brand = (item.brand || "").toLowerCase().trim();
      const q = queryStr.toLowerCase().trim();
      const qClean = q.replace(/[\s\-_()]/g, "");
      const codeClean = code.replace(/[\s\-_()]/g, "");
      const nameClean = name.replace(/[\s\-_()]/g, "");

      // 1. 상품코드 완전 일치
      if (code === q) return 1;
      // 2. 상품코드 공백·하이픈 제거 후 완전 일치
      if (codeClean === qClean) return 2;
      // 3. 상품코드 시작 일치
      if (code.startsWith(q) || codeClean.startsWith(qClean)) return 3;
      // 4. 상품명 완전 일치
      if (name === q || nameClean === qClean) return 4;
      // 5. 상품명 시작 일치
      if (name.startsWith(q) || nameClean.startsWith(qClean)) return 5;
      // 6. 상품코드 포함
      if (code.includes(q) || codeClean.includes(qClean)) return 6;
      // 7. 상품명 포함
      if (name.includes(q) || nameClean.includes(qClean)) return 7;
      // 8. 브랜드 일치
      if (brand === q) return 8;
      
      return 9; // 기타
    };

    return deduplicated
      .sort((a, b) => {
        const tierA = getMatchTier(a, s);
        const tierB = getMatchTier(b, s);
        if (tierA !== tierB) {
          return tierA - tierB;
        }
        return (a.code || "").localeCompare(b.code || "", 'ko');
      })
      .slice(0, 20);

  } catch (err) {
    if (err.name === 'AbortError' || err.message === 'aborted') {
      console.log('Search query aborted securely');
      throw err;
    }
    console.error('[searchProductsServer Exception]:', err);
    return [];
  }
}

