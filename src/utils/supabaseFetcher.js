import { supabase } from '../lib/supabaseClient';
import { materials } from '../data/materials.db'; // Local fallback data
import { dongshinPolymer2026 } from '../data/dongshinPolymer2026.js';

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
      if (m.catalog) mapped.catalog = m.catalog;
      if (m.productName) mapped.productName = m.productName;

      return mapped;
    });

    console.log("Successfully loaded local fallback materials:", cachedProducts.length);
    return cachedProducts;
  }

  console.log("Supabase response raw rows count:", data.length);

  // Map database columns to the frontend object structure safely
  cachedProducts = data.map(p => {
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
      if (localMatch.sizeOptions) {
        mapped.sizeOptions = localMatch.sizeOptions;
      }
    }

    return mapped;
  });

  // Deduplicate products based on brand + category + line + name (Requirement 6)
  const seenProducts = new Map();
  const deduplicatedProducts = [];

  for (const m of cachedProducts) {
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

  cachedProducts = deduplicatedProducts;

  console.log("Successfully loaded and mapped products from Supabase (deduplicated):", cachedProducts.length);
  return cachedProducts;
}

export function clearProductCache() {
  cachedProducts = null;
}
