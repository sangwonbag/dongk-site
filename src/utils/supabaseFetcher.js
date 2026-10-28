import { getSearchScore, isProductNumberQuery, normalizeSearchText } from './searchUtils.js';
import { parseSearchQuery, scoreProduct } from './materialSearchEngine.js';
import { supabase } from '../lib/supabaseClient.js';
import { dongshinPolymer2026 } from '../data/dongshinPolymer2026.js';
import { normalizeProductDetails, isSentenceDescription, getKccLineup } from './brandUtils.js';
import { HIDE_SUB_MATERIALS, isSubMaterialCategory } from '../config/categoryConfig.js';

let localMaterialsCache = null;
async function getLocalMaterials() {
  if (localMaterialsCache) return localMaterialsCache;
  try {
    const mod = await import('../data/materials.db.js');
    localMaterialsCache = mod.materials || [];
  } catch (e) {
    console.error("Failed to dynamically import local materials db:", e);
    localMaterialsCache = [];
  }
  return localMaterialsCache;
}

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
let cachedHomeProducts = null;
const filteredProductsCache = new Map();

// Product Detail In-Memory Cache (TTL: 10 minutes) & In-flight request deduplication
export const productDetailMemoryCache = new Map();
const productDetailInflightRequests = new Map();
const PRODUCT_CACHE_TTL_MS = 10 * 60 * 1000;

export function setCachedProduct(item) {
  if (!item) return;
  const entry = { data: item, timestamp: Date.now() };
  if (item.id != null) {
    productDetailMemoryCache.set(String(item.id).trim().toLowerCase(), entry);
  }
  if (item.product_id != null) {
    productDetailMemoryCache.set(String(item.product_id).trim().toLowerCase(), entry);
  }
  if (item.slug) {
    productDetailMemoryCache.set(String(item.slug).trim().toLowerCase(), entry);
  }
  if (item.code) {
    productDetailMemoryCache.set(String(item.code).trim().toLowerCase(), entry);
    const norm = String(item.code).replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
    if (norm) productDetailMemoryCache.set(norm, entry);
  }
}

export function getCachedProduct(key) {
  if (!key) return null;
  const cleanKey = String(key).trim().toLowerCase();
  const entry = productDetailMemoryCache.get(cleanKey);
  if (entry) {
    return entry.data;
  }
  const norm = cleanKey.replace(/[^a-zA-Z0-9가-힣]/g, '');
  if (norm) {
    const normEntry = productDetailMemoryCache.get(norm);
    if (normEntry) return normEntry.data;
  }
  return null;
}

export function prefetchProductDetail(routeParam) {
  if (!routeParam) return;
  const cleanKey = String(routeParam).trim().toLowerCase();
  if (productDetailMemoryCache.has(cleanKey)) return;
  fetchProductDetailBySlugOrId(routeParam).catch(() => {});
}

/**
 * Fast home page product fetcher (returns top 20 active products for initial render)
 * Soft-races Supabase against local materials DB to guarantee sub-second rendering without timeouts
 */
export async function fetchHomeProducts(limit = 20) {
  if (cachedHomeProducts && cachedHomeProducts.length >= Math.min(limit, 8)) {
    return cachedHomeProducts;
  }

  if (supabase) {
    try {
      const queryPromise = supabase
        .from('products')
        .select(`
          id, slug, name, product_code, price, thickness, unit, image_url, description, is_featured, is_active, sort_order,
          categories ( id, name ),
          brands ( id, name )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(limit);

      // Soft race: Wait up to 2 seconds for live Supabase DB response
      const softTimer = new Promise(resolve => setTimeout(() => resolve({ timeout: true }), 2000));
      const res = await Promise.race([queryPromise, softTimer]);

      if (res && !res.timeout && !res.error && res.data && res.data.length > 0) {
        let mapped = deduplicateProducts(res.data.map(mapProductRow));
        if (HIDE_SUB_MATERIALS) {
          mapped = mapped.filter(m => !isSubMaterialCategory(m));
        }
        cachedHomeProducts = mapped.slice(0, limit);
        return cachedHomeProducts;
      }

      if (res && res.timeout) {
        console.warn("[fetchHomeProducts] Supabase API response > 2s. Seamlessly serving local fallback data for instant render.");
      }
    } catch (e) {
      console.warn("[fetchHomeProducts] Supabase fetch exception (serving local fallback data):", e);
    }
  }

  // Instant local fallback - guaranteed never to throw an exception
  const all = await fetchAllProducts();
  let filteredAll = all;
  if (HIDE_SUB_MATERIALS) {
    filteredAll = all.filter(m => !isSubMaterialCategory(m));
  }
  cachedHomeProducts = filteredAll.slice(0, limit);
  return cachedHomeProducts;
}

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
    
    const rawLocalMaterials = await getLocalMaterials();
    // Map local materials to the frontend product structure
    cachedProducts = deduplicateProducts((rawLocalMaterials || []).map(m => {
      const rawLine = m.line || "";
      const validLine = (rawLine && !isSentenceDescription(rawLine)) ? rawLine : "";
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
        line: validLine,
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
    }));

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
  const rawBrand = p.brands?.name || "";
  const brandName = (rawBrand === '이건' || rawBrand === '이건마루') ? '이건마루' : rawBrand;
  const categoryName = p.categories?.name || "";

  // Find matching Dongshin PDF product to enrich properties
  const dongshinMatch = (brandName === '동신' && categoryName === '데코타일')
    ? dongshinPolymer2026.find(d => d.code.toUpperCase() === code.toUpperCase())
    : null;

  const dbItem = {
    brand: brandName,
    category: categoryName,
    line: p.line || "",
    name: p.name || "",
    code: p.product_code || null
  };
  const dbKey = getMaterialMatchKey(dbItem);
  const localMatch = localMaterialsCache ? localMaterialsCache.find(m => getMaterialMatchKey(m) === dbKey) : null;

  const isSenseRay = code.startsWith('B') || (p.name || '').startsWith('KCC 센스레이') || p.line === '센스레이';

  let rawImg = p.image_url || null;
  if (isSenseRay && rawImg && (rawImg.includes('/KCC_pro/') || rawImg.includes('KCC_pro') || rawImg.includes('센스타일') || rawImg.includes('TS55'))) {
    rawImg = null;
  }

  const rawLineCandidate = p.line || (localMatch && localMatch.line) || "";
  const validLine = (rawLineCandidate && !isSentenceDescription(rawLineCandidate)) ? rawLineCandidate : "";

  const rawDesc = String(p.description || "").trim();
  const rawSlug = String(p.slug || "").trim();
  const rawImgPath = String(p.image_url || "").trim();
  const rawName = String(p.name || "").trim();
  const cleanName = rawName || code;

  // Accurately determine line, series, and collection
  let resolvedLine = validLine;
  let resolvedSeries = p.series || (localMatch && localMatch.series) || "";
  let resolvedCollection = p.collection || (localMatch && localMatch.collection) || "";

  if (categoryName === '벽지') {
    const combinedWallText = `${rawDesc} ${rawSlug} ${rawImgPath} ${cleanName}`;
    if (combinedWallText.includes('디아망')) {
      resolvedLine = '디아망';
      resolvedSeries = '디아망';
      resolvedCollection = '디아망';
    } else if (combinedWallText.includes('베스트') || combinedWallText.includes('베스띠')) {
      resolvedLine = '베스띠';
      resolvedSeries = '베스띠';
      resolvedCollection = '베스띠';
    } else if (combinedWallText.includes('테라피')) {
      resolvedLine = '테라피';
      resolvedSeries = '테라피';
      resolvedCollection = '테라피';
    } else if (combinedWallText.includes('휘앙세')) {
      resolvedLine = '휘앙세';
      resolvedSeries = '휘앙세';
      resolvedCollection = '휘앙세';
    }
  }

  const mapped = {
    id: p.slug || String(p.id),
    product_id: p.id,
    sort_order: p.sort_order || 0,
    code: code,
    name: cleanName,
    brand: brandName,
    category: categoryName,
    price: p.price || 0,
    thickness: p.thickness || "",
    specs: {
      thickness: p.thickness || "",
      size: p.size_text || "",
      packing: p.unit || ""
    },
    thumbnail: rawImg,
    image: rawImg,
    line: resolvedLine,
    series: resolvedSeries,
    collection: resolvedCollection,
    description: p.description || "",
    featured: p.is_featured || false,
    active: p.is_active ?? true
  };

  if (dongshinMatch) {
    mapped.collection = dongshinMatch.collection;
    mapped.series = dongshinMatch.series;
    mapped.catalog = dongshinMatch.catalog;
    mapped.productName = dongshinMatch.productName;
    mapped.name = dongshinMatch.code;
  }

  if (localMatch) {
    mapped.collection = mapped.collection || localMatch.collection;
    mapped.series = mapped.series || localMatch.series;
    mapped.note = localMatch.note;
    mapped.catalog = localMatch.catalog;
    mapped.productName = localMatch.productName;
    if (localMatch.line && !isSentenceDescription(localMatch.line) && !mapped.line) {
      mapped.line = localMatch.line;
    }
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

  if (mapped.category === '데코타일' && (mapped.brand === 'KCC' || (mapped.brand || '').includes('KCC'))) {
    mapped.line = getKccLineup(mapped);
    if (mapped.line.includes('프로')) {
      mapped.series = '센스타일 프로';
      mapped.collection = '센스타일';
    } else if (mapped.line.includes('트랜디')) {
      mapped.series = '센스타일 트랜디';
      mapped.collection = '센스타일';
    } else if (mapped.line.includes('센스레이')) {
      mapped.series = '센스레이';
      mapped.collection = '센스레이';
    } else {
      mapped.series = '센스타일';
      mapped.collection = '센스타일';
    }
  }

  return normalizeProductDetails(mapped);
}

// Product data can contain both a swatch thumbnail entry and an interior/detail
// photo entry for the same code. Keep only one listing card, preferring the swatch.
const listingImagePriority = (product) => {
  const url = String(
    product?.thumbnail_url || product?.thumbnail || product?.image_url || product?.image || ''
  );
  if (/(?:thumbnail[_/-]?image|(?:^|[/_-])thumb(?:nail)?(?:[/_-]|$))/i.test(url)) return 2;
  if (/(?:detail[_/-]?image|(?:^|[/_-])detail(?:[/_-]|$))/i.test(url)) return 0;
  return 1;
};

export function deduplicateProducts(productList) {
  if (!Array.isArray(productList)) return [];
  const seenProducts = new Map();
  const deduplicatedProducts = [];

  for (const m of productList) {
    if (!m) continue;
    const brand = normalizeText(m.brand);
    const category = normalizeText(m.category);
    const line = normalizeText(m.line);
    const name = normalizeText(m.name || m.productName);
    const code = normalizeText(m.code || m.product_code)
      .replace(/\(\d+(?:\.\d+)?t\)$/i, "");
    const id = m.id || m.product_id;

    let key = "";
    if (code) {
      key = brand + "_" + category + "_" + code;
    } else if (name) {
      key = brand + "_" + category + "_" + line + "_" + name;
    } else {
      key = brand + "_" + category + "_id_" + id;
    }

    if (seenProducts.has(key)) {
      const index = seenProducts.get(key);
      const existing = deduplicatedProducts[index];
      const incomingPreferred = listingImagePriority(m) > listingImagePriority(existing);
      const preferred = incomingPreferred ? m : existing;
      const other = incomingPreferred ? existing : m;
      const merged = { ...preferred };

      // Retain details and option lists from the other entry where necessary.
      if (other.sizeOptions?.length > (merged.sizeOptions?.length || 0)) {
        merged.sizeOptions = other.sizeOptions;
      }
      for (const field of ['price', 'specs', 'line', 'collection', 'series', 'catalog',
        'productName', 'shape', 'pattern', 'description']) {
        if ((merged[field] == null || merged[field] === '' ||
             (field === 'price' && merged[field] === 0)) && other[field] != null) {
          merged[field] = other[field];
        }
      }
      deduplicatedProducts[index] = merged;
    } else {
      seenProducts.set(key, deduplicatedProducts.length);
      deduplicatedProducts.push(m);
    }
  }

  return deduplicatedProducts;
}

export function withTimeout(promise, ms = 12000) {
  let timer = null;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error('REQUEST_TIMEOUT');
      err.name = 'TimeoutError';
      reject(err);
    }, ms);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function fetchFilteredProducts({ category, brand, thickness, searchText, page = 0, pageSize = 2000, signal }) {
  const safePage = Math.max(0, Number(page) || 0);
  const safePageSize = Math.max(1, Number(pageSize) || 2000);

  const cacheKey = `${category || 'all'}:${brand || 'all'}:${thickness || 'all'}:${searchText || ''}:${safePage}:${safePageSize}`;
  if (filteredProductsCache.has(cacheKey)) {
    return filteredProductsCache.get(cacheKey);
  }

  const getLocalFallbackResult = async () => {
    const rawLocalMaterials = await getLocalMaterials();
    const mappedLocal = (rawLocalMaterials || []).map(m => {
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
        image: m.thumbnail || m.image || null,
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
      if (m.shape_kr) mapped.shape_kr = m.shape_kr;
      if (m.family) mapped.family = m.family;
      if (m.common_intro) mapped.common_intro = m.common_intro;
      if (m.shape_intro) mapped.shape_intro = m.shape_intro;
      if (m.pattern) mapped.pattern = m.pattern;
      if (m.specs && m.specs.area) {
        if (!mapped.specs) mapped.specs = {};
        mapped.specs.area = m.specs.area;
      }

      return normalizeProductDetails(mapped);
    });

    const filtered = filterLocalProducts(deduplicateProducts(mappedLocal), { category, brand, thickness, searchText });
    const from = safePage * safePageSize;
    const paged = filtered.slice(from, from + safePageSize);
    const result = [...paged];
    result.items = paged;
    result.totalCount = filtered.length;
    result.hasMore = from + paged.length < filtered.length;
    return result;
  };

  if (!supabase) {
    const result = await getLocalFallbackResult();
    filteredProductsCache.set(cacheKey, result);
    return result;
  }

  if (!signal && filteredProductsCache.has(`inflight:${cacheKey}`)) {
    return filteredProductsCache.get(`inflight:${cacheKey}`);
  }

  const fetchPromise = (async () => {
    try {
      const from = safePage * safePageSize;
      const to = from + safePageSize - 1;

      let query = supabase
        .from('products')
        .select(`
          id, slug, name, product_code, price, thickness, size_text, unit, image_url, description, is_featured, is_active, sort_order,
          categories!inner ( id, name ),
          brands!inner ( id, name )
        `, { count: 'exact' })
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
          } else if (b.includes('이건')) {
            query = query.or('name.ilike.%이건%,name.ilike.%이건마루%', { foreignTable: 'brands' });
          } else {
            query = query.ilike('brands.name', `%${brand}%`);
          }
        }
        if (category === '장판' && thickness && thickness !== 'all') {
          query = query.eq('thickness', thickness);
        }
      }

      if (signal) {
        query = query.abortSignal(signal);
      }

      query = query.order('sort_order', { ascending: true }).order('id', { ascending: false });
      query = query.range(from, to);

      // Soft race: wait 1500ms max for live Supabase DB response
      const softTimer = new Promise(resolve => setTimeout(() => resolve({ timeout: true }), 1500));
      const res = await Promise.race([query, softTimer]);

      if (res && !res.timeout && !res.error && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = deduplicateProducts(res.data.map(mapProductRow));
        const totalCount = res.count ?? mapped.length;
        const hasMore = from + res.data.length < totalCount;

        const result = [...mapped];
        result.items = mapped;
        result.totalCount = totalCount;
        result.hasMore = hasMore;

        // Pre-populate individual product cache so navigating to detail page is instantaneous
        mapped.forEach(item => setCachedProduct(item));

        filteredProductsCache.set(cacheKey, result);
        return result;
      }

      if (res && res.error && (res.error.name === 'AbortError' || res.error.message?.includes('aborted'))) {
        const abortErr = new Error('aborted');
        abortErr.name = 'AbortError';
        throw abortErr;
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'aborted') {
        filteredProductsCache.delete(`inflight:${cacheKey}`);
        throw err;
      }
      console.warn('[fetchFilteredProducts] Supabase fetch exception or soft timeout, serving instant local fallback:', err);
    }

    // Instant local fallback when Supabase is slow or errors out
    const fallbackResult = await getLocalFallbackResult();
    if (fallbackResult.length > 0) {
      filteredProductsCache.set(cacheKey, fallbackResult);
    }
    return fallbackResult;
  })();

  if (!signal) {
    filteredProductsCache.set(`inflight:${cacheKey}`, fetchPromise);
  }

  try {
    const res = await fetchPromise;
    return res;
  } finally {
    filteredProductsCache.delete(`inflight:${cacheKey}`);
  }
}

function filterLocalProducts(list, { category, brand, thickness, searchText }) {
  let workingList = list;
  if (HIDE_SUB_MATERIALS) {
    workingList = workingList.filter(m => !isSubMaterialCategory(m));
  }
  if (searchText) {
    const s = searchText.trim().toLowerCase();
    return workingList.filter(m => 
      String(m.name).toLowerCase().includes(s) || 
      String(m.code).toLowerCase().includes(s) || 
      String(m.brand).toLowerCase().includes(s) ||
      String(m.line).toLowerCase().includes(s)
    );
  }
  return workingList.filter(m => {
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
      } else if (b.includes('이건')) {
        brandOk = itemBrand.includes("이건") || compBrand.includes("이건");
      } else {
        brandOk = itemBrand.includes(b) || compBrand.includes(b);
      }
    }
    let thicknessOk = true;
    if (category === '장판' && thickness && thickness !== 'all') {
      thicknessOk = (m.thickness === thickness);
    }
    return catOk && brandOk && thicknessOk;
  });
}

export function clearProductCache() {
  cachedProducts = null;
  filteredProductsCache.clear();
  productDetailMemoryCache.clear();
  productDetailInflightRequests.clear();
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

    const results = await Promise.allSettled(queries);
    const merged = [];
    const seenIds = new Set();

    for (const res of results) {
      if (res.status === 'rejected') {
        if (res.reason?.name === 'AbortError' || res.reason?.message === 'aborted') {
          const abortErr = new Error('aborted');
          abortErr.name = 'AbortError';
          throw abortErr;
        }
        console.warn('[searchProductsServer Subquery Rejected]:', res.reason);
        continue;
      }
      const queryRes = res.value;
      if (queryRes.error) {
        if (queryRes.error.message && queryRes.error.message.includes('aborted')) {
          const abortErr = new Error('aborted');
          abortErr.name = 'AbortError';
          throw abortErr;
        }
        console.error('[searchProductsServer Subquery Error]:', queryRes.error);
        continue;
      }
      if (queryRes.data) {
        for (const rawItem of queryRes.data) {
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

/**
 * Helper to extract clean product code candidate from slug/param
 */
export function extractProductCodeFromParam(param) {
  if (!param) return '';
  let decoded = String(param).trim();
  try {
    decoded = decodeURIComponent(param).trim();
  } catch {
    // fallback
  }
  if (/^\d+$/.test(decoded)) return '';
  const match = decoded.match(/([a-zA-Z]{1,5}[-_\s]?\d{3,5}[a-zA-Z]*)/);
  if (match) return match[1].replace(/[-_\s]/g, '');
  const numMatch = decoded.match(/(\d{3,6}(-\d+)?)/);
  if (numMatch) return numMatch[1];
  return decoded.replace(/[-_\s]/g, '');
}

/**
 * High-performance single product detail fetcher with:
 * 1. In-memory client cache
 * 2. In-flight request deduplication
 * 3. Priority single-query lookup (direct ID query first if numeric, slug if string)
 * 4. Stale-while-revalidate support
 */
export async function fetchProductDetailBySlugOrId(routeParam, signal = null, options = {}) {
  const { forceRefresh = false } = options;
  if (!routeParam) return null;
  let slug = String(routeParam).trim();
  try { slug = decodeURIComponent(slug).trim(); }
  catch (error) { console.warn('[product-detail] malformed URL:', error); }
  if (!slug) return null;

  const abortError = () => Object.assign(new Error('aborted'), { name: 'AbortError' });
  const checkAbort = () => { if (signal?.aborted) throw abortError(); };
  checkAbort();

  const cleanKey = slug.toLowerCase();

  // Return cached product immediately if available and not forceRefresh
  if (!forceRefresh) {
    const cached = getCachedProduct(cleanKey);
    if (cached) return cached;
  }

  // Deduplicate concurrent in-flight requests for same key
  if (!signal && productDetailInflightRequests.has(cleanKey)) {
    return productDetailInflightRequests.get(cleanKey);
  }

  const fetchPromise = (async () => {
    const normalizeCode = value => String(value || '').replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
    const trailingCode = slug.match(/(?:^|[-_])([A-Za-z]{0,4}[-_ ]?\d{3,7}[A-Za-z]{0,4}(?:-\d{1,3})?)$/)?.[1] || '';
    const codeCandidates = [slug, trailingCode, extractProductCodeFromParam(slug)]
      .filter(value => value && value.length <= 48 && /\d/.test(value))
      .filter((value, index, all) => all.findIndex(other => normalizeCode(other) === normalizeCode(value)) === index);
    const brandHint = ['kcc', 'lx', '현대', '동신', '재영', '우성', '녹수', '이건', '동화', '구정']
      .find(brand => slug.toLowerCase().split(/[-_]/).includes(brand));
    let failureReason = 'network';

    if (supabase) {
      const controller = new AbortController();
      const onAbort = () => controller.abort();
      signal?.addEventListener('abort', onAbort, { once: true });
      let networkTimer;

      const queryFields = `
        id, slug, name, product_code, price, thickness, size_text, unit, image_url, description, is_featured, is_active, sort_order,
        categories ( id, name ),
        brands ( id, name )
      `;

      const queryServer = async () => {
        checkAbort();
        // Priority 1: Numeric ID (most common from list click /materials/123)
        if (/^\d+$/.test(slug)) {
          const { data, error } = await supabase
            .from('products')
            .select(queryFields)
            .eq('id', Number(slug))
            .maybeSingle()
            .abortSignal(controller.signal);
          checkAbort();
          if (error) throw error;
          if (data) {
            return data.is_active === false ? { status: 'inactive' } : { status: 'found', row: data };
          }
        } else {
          // Priority 2: Canonical slug (e.g. /materials/kcc-sense-pro-123)
          const { data, error } = await supabase
            .from('products')
            .select(queryFields)
            .eq('slug', slug)
            .maybeSingle()
            .abortSignal(controller.signal);
          checkAbort();
          if (error) throw error;
          if (data) {
            return data.is_active === false ? { status: 'inactive' } : { status: 'found', row: data };
          }
        }

        // Priority 3: Exact product_code match
        for (const candidate of codeCandidates) {
          checkAbort();
          const { data, error } = await supabase
            .from('products')
            .select(queryFields)
            .ilike('product_code', candidate.replace(/[%_\\]/g, '\\$&'))
            .limit(10)
            .abortSignal(controller.signal);
          checkAbort();
          if (error) throw error;
          if (data && data.length > 0) {
            const matches = data.filter(row => normalizeCode(row.product_code) === normalizeCode(candidate));
            const scoped = brandHint
              ? matches.filter(row => String(row.brands?.name || '').toLowerCase().includes(brandHint))
              : matches;
            if (scoped.length >= 1) {
              const row = scoped[0];
              return row.is_active === false ? { status: 'inactive' } : { status: 'found', row };
            }
          }
        }
        return { status: 'notFound' };
      };

      try {
        const outcome = await Promise.race([
          queryServer(),
          new Promise(resolve => {
            networkTimer = setTimeout(() => {
              controller.abort();
              resolve({ status: 'timeout' });
            }, 4000);
          })
        ]);
        checkAbort();
        if (outcome?.status === 'found') {
          const mapped = mapProductRow(outcome.row);
          setCachedProduct(mapped);
          return mapped;
        }
        if (outcome?.status === 'inactive') {
          return { __inactive: true };
        }
        if (outcome?.status === 'notFound') return null;
        failureReason = 'timeout';
      } catch (error) {
        checkAbort();
        console.warn('[product-detail] server failed, trying local exact match:', error);
      } finally {
        clearTimeout(networkTimer);
        controller.abort();
        signal?.removeEventListener('abort', onAbort);
      }
    }

    // Local fallback check if Supabase is offline
    checkAbort();
    let localTimer;
    try {
      const localResult = await Promise.race([
        getLocalMaterials().then(items => ({ items })),
        new Promise(resolve => {
          localTimer = setTimeout(() => resolve({ timedOut: true }), 2000);
        })
      ]);
      checkAbort();
      if (localResult.timedOut) {
        throw Object.assign(new Error('상품 조회 시간이 초과되었습니다. 다시 시도해 주세요.'), { name: 'TimeoutError' });
      }
      const items = Array.isArray(localResult.items) ? localResult.items : [];
      const active = row => row && row.active !== false && row.is_active !== false;
      const exact = items.find(row => active(row) && [row.slug, row.id, row.code]
        .some(value => value != null && String(value).toLowerCase() === slug.toLowerCase()));
      const byCode = exact ? null : items.find(row => active(row) && row.code
        && codeCandidates.some(code => normalizeCode(code) === normalizeCode(row.code))
        && (!brandHint || String(row.brand || '').toLowerCase().includes(brandHint)));
      if (exact || byCode) {
        const mapped = normalizeProductDetails(exact || byCode);
        setCachedProduct(mapped);
        return mapped;
      }

      const err = new Error('상품 서버에 연결하지 못했습니다. 다시 시도해 주세요.');
      err.name = failureReason === 'timeout' ? 'TimeoutError' : 'NetworkError';
      throw err;
    } finally {
      clearTimeout(localTimer);
    }
  })();

  if (!signal) {
    productDetailInflightRequests.set(cleanKey, fetchPromise);
  }

  try {
    return await fetchPromise;
  } finally {
    productDetailInflightRequests.delete(cleanKey);
  }
}

// High-performance search cache with TTL: 5 minutes
const searchMaterialsCache = new Map();
const SEARCH_CACHE_TTL = 5 * 60 * 1000;

/**
 * High-performance full-catalog search for autocomplete and materials page.
 * Uses targeted PostgREST sub-conditions, relevance ranking, and soft-timeout local fallback.
 */
export async function searchMaterials(queryText, optionsOrSignal = null) {
  const text = String(queryText || '').trim();
  if (!text) return [];

  // Parse arguments
  let signal = null;
  let categoryFilter = null;
  let brandFilter = null;
  let thicknessFilter = null;
  let limit = 100;

  if (optionsOrSignal) {
    if (optionsOrSignal instanceof AbortSignal || optionsOrSignal.aborted !== undefined) {
      signal = optionsOrSignal;
    } else if (typeof optionsOrSignal === 'object') {
      signal = optionsOrSignal.signal || null;
      categoryFilter = optionsOrSignal.category && optionsOrSignal.category !== 'all' ? optionsOrSignal.category : null;
      brandFilter = optionsOrSignal.brand && optionsOrSignal.brand !== 'all' ? optionsOrSignal.brand : null;
      thicknessFilter = optionsOrSignal.thickness && optionsOrSignal.thickness !== 'all' ? optionsOrSignal.thickness : null;
      if (optionsOrSignal.limit) limit = optionsOrSignal.limit;
    }
  }

  const checkAbort = () => {
    if (signal?.aborted) {
      const err = new Error('aborted');
      err.name = 'AbortError';
      throw err;
    }
  };
  checkAbort();

  const cacheKey = `${text.toLowerCase()}:${categoryFilter || 'all'}:${brandFilter || 'all'}:${thicknessFilter || 'all'}:${limit}`;
  const cached = searchMaterialsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
    return cached.data;
  }

  const parsed = parseSearchQuery(text);

  const rank = items => deduplicateProducts(items)
    .filter(item => item.active !== false && item.is_active !== false
      && !(HIDE_SUB_MATERIALS && isSubMaterialCategory(item)))
    .map(item => ({ item, score: scoreProduct(item, text, parsed) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || String(a.item.code || '').localeCompare(String(b.item.code || ''), 'ko'))
    .map(entry => entry.item);

  if (supabase) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, 4000);

    try {
      let request = supabase
        .from('products')
        .select(`
          id, slug, name, product_code, price, thickness, size_text, unit, image_url, description, is_featured, is_active, sort_order,
          categories!inner ( id, name ),
          brands!inner ( id, name )
        `)
        .eq('is_active', true)
        .abortSignal(controller.signal);

      // Build target conditions using materialSearchEngine
      const orConds = [];

      // 1. Lineup keywords (e.g. "디아망", "아트에코차음", "센스타일", etc.)
      if (parsed.detectedLineup) {
        for (const kw of parsed.detectedLineup.dbKeywords) {
          orConds.push(`name.ilike.%${kw}%`, `description.ilike.%${kw}%`, `slug.ilike.%${kw}%`);
        }
      }

      // 2. Product code and numeric matching (space/hyphen agnostic)
      if (parsed.codeNorm) {
        orConds.push(`product_code.ilike.%${parsed.codeNorm}%`, `name.ilike.%${parsed.codeNorm}%`);

        // If code has letters + digits (e.g. "TS5541", "FSM6202", "RT6202")
        const codeAlphaNum = parsed.codeNorm.match(/^([A-Z]+)(\d+)([A-Z]*)$/i);
        if (codeAlphaNum) {
          const prefix = codeAlphaNum[1];
          const digits = codeAlphaNum[2];
          orConds.push(`product_code.ilike.%${prefix}%${digits}%`, `name.ilike.%${prefix}%${digits}%`);
          if (digits.length >= 3) {
            orConds.push(`product_code.ilike.%${digits}%`, `name.ilike.%${digits}%`);
          }
        } else {
          const digitsOnly = parsed.codeNorm.replace(/\D/g, '');
          if (digitsOnly.length >= 3) {
            orConds.push(`product_code.ilike.%${digitsOnly}%`, `name.ilike.%${digitsOnly}%`);
          }
        }

        if (/^\d{6}$/.test(parsed.codeNorm)) {
          const hyp = parsed.codeNorm.slice(0, 4) + '-' + parsed.codeNorm.slice(4);
          orConds.push(`product_code.ilike.%${hyp}%`, `name.ilike.%${hyp}%`);
        }
      }

      // 3. Multi-token keywords (e.g. "에코", "차음", "트랜디", "센스타일", "5541")
      for (const tok of parsed.tokens) {
        if (!tok || tok.length < 2) continue;
        const tokCode = tok.replace(/[^A-Za-z0-9]/g, '');
        if (tokCode.length >= 2) {
          orConds.push(`product_code.ilike.%${tokCode}%`, `name.ilike.%${tokCode}%`);
          const numOnly = tok.replace(/\D/g, '');
          if (numOnly.length >= 3) {
            orConds.push(`product_code.ilike.%${numOnly}%`, `name.ilike.%${numOnly}%`);
          }
        }
        orConds.push(`name.ilike.%${tok}%`, `description.ilike.%${tok}%`, `slug.ilike.%${tok}%`);
      }

      // 4. Thickness matching
      if (parsed.detectedThickness) {
        const rawT = parsed.detectedThickness.replace('T', '');
        orConds.push(`thickness.ilike.%${rawT}%`, `name.ilike.%${rawT}T%`, `description.ilike.%${rawT}%`);
      }

      // 5. Spec matching
      if (parsed.detectedSpec === '450각') {
        orConds.push(`size_text.ilike.%450%`, `size_text.ilike.%457%`, `description.ilike.%450%`);
      } else if (parsed.detectedSpec === '600각') {
        orConds.push(`size_text.ilike.%600%`, `description.ilike.%600%`);
      }

      // 6. Fallback if empty
      if (orConds.length === 0) {
        const s = text.trim();
        orConds.push(`product_code.ilike.%${s}%`, `name.ilike.%${s}%`, `description.ilike.%${s}%`, `slug.ilike.%${s}%`);
      }

      request = request.or(Array.from(new Set(orConds)).join(','));

      // Category filter (only apply if explicitly requested in options and not 'all')
      if (categoryFilter && categoryFilter !== 'all') {
        request = request.eq('categories.name', categoryFilter);
      }

      // Brand filter (only apply if explicitly requested in options and not 'all')
      if (brandFilter && brandFilter !== 'all') {
        const b = brandFilter.toUpperCase();
        if (b === 'LX') {
          request = request.or('name.ilike.%LX%,name.ilike.%LG%', { foreignTable: 'brands' });
        } else {
          request = request.ilike('brands.name', `%${brandFilter}%`);
        }
      }

      if (thicknessFilter && thicknessFilter !== 'all') {
        request = request.eq('thickness', thicknessFilter);
      }

      request = request.order('sort_order', { ascending: true }).limit(limit);

      const { data, error } = await request;
      checkAbort();
      if (error) throw error;

      if (data && data.length > 0) {
        const ranked = rank(data.map(mapProductRow));
        searchMaterialsCache.set(cacheKey, { data: ranked, timestamp: Date.now() });
        return ranked;
      }
    } catch (error) {
      checkAbort();
      console.warn('[searchMaterials] Live search failed or soft timeout; using local catalogue:', error.message);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  }

  // Local fallback
  const local = await withTimeout(getLocalMaterials(), 4000);
  checkAbort();
  let filteredLocal = local.map(m => mapProductRow(m));
  if (categoryFilter && categoryFilter !== 'all') {
    filteredLocal = filteredLocal.filter(m => m.category === categoryFilter);
  }
  if (brandFilter && brandFilter !== 'all') {
    const b = brandFilter.toUpperCase();
    filteredLocal = filteredLocal.filter(m => (m.brand || '').toUpperCase().includes(b));
  }
  if (thicknessFilter && thicknessFilter !== 'all') {
    filteredLocal = filteredLocal.filter(m => m.thickness === thicknessFilter);
  }
  const rankedLocal = rank(filteredLocal);
  searchMaterialsCache.set(cacheKey, { data: rankedLocal, timestamp: Date.now() });
  return rankedLocal;
}
