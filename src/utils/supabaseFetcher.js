import { supabase } from '../lib/supabaseClient';

let cachedProducts = null;

export async function fetchAllProducts(forceRefresh = false) {
  if (cachedProducts && !forceRefresh) {
    return cachedProducts;
  }

  if (!supabase) {
    throw new Error("Supabase client is not initialized. Please verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.");
  }

  console.log("Fetching all products from Supabase DB...");
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( id, name ),
      brands ( id, name )
    `);

  if (error) {
    console.error("Supabase SELECT products error:", error);
    throw error;
  }

  console.log("Supabase response raw rows count:", data ? data.length : 0);

  // Map database columns to the frontend object structure safely
  cachedProducts = (data || []).map(p => ({
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

  console.log("Successfully loaded and mapped products:", cachedProducts.length);
  return cachedProducts;
}

export function clearProductCache() {
  cachedProducts = null;
}
