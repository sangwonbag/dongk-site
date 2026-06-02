import { supabase } from '../lib/supabaseClient';
import { materials } from '../data/materials.db'; // Local fallback data

let cachedProducts = null;

export async function fetchAllProducts(forceRefresh = false) {
  if (cachedProducts && !forceRefresh) {
    return cachedProducts;
  }

  let data = null;
  let fetchError = null;

  if (supabase) {
    console.log("Fetching all products from Supabase DB...");
    try {
      const res = await supabase
        .from('products')
        .select(`
          *,
          categories ( id, name ),
          brands ( id, name )
        `);
      data = res.data;
      fetchError = res.error;
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
    cachedProducts = (materials || []).map(m => ({
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
    }));

    console.log("Successfully loaded local fallback materials:", cachedProducts.length);
    return cachedProducts;
  }

  console.log("Supabase response raw rows count:", data.length);

  // Map database columns to the frontend object structure safely
  cachedProducts = data.map(p => ({
    id: p.slug || String(p.id),
    code: p.product_code || "",
    name: p.name || "",
    brand: p.brands?.name || "",
    category: p.categories?.name || "",
    price: p.price || 0,
    thickness: p.thickness || "",
    specs: {
      thickness: p.thickness || "",
      size: p.size_text || "",
      packing: p.unit || ""
    },
    thumbnail: p.image_url || null,
    image: p.image_url || null,
    description: p.description || "",
    featured: p.is_featured || false,
    active: p.is_active ?? true
  }));

  console.log("Successfully loaded and mapped products from Supabase:", cachedProducts.length);
  return cachedProducts;
}

export function clearProductCache() {
  cachedProducts = null;
}
