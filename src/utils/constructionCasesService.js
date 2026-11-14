import { supabase } from '../lib/supabaseClient.js';
import { FALLBACK_CASES } from '../data/fallbackCases.js';

let cachedPublishedCases = null;

/**
 * Invalidate in-memory cached cases.
 * Called when an admin creates, updates, deletes, or toggles visibility of a case.
 */
export function invalidateCasesCache() {
  cachedPublishedCases = null;
}

/**
 * Fetch published construction cases.
 * Uses in-memory caching to avoid duplicate round-trips across Home and Cases pages.
 * @param {boolean} forceRefresh
 * @returns {Promise<Array>}
 */
export async function fetchPublishedCases(forceRefresh = false) {
  if (cachedPublishedCases && !forceRefresh) {
    return cachedPublishedCases;
  }

  try {
    if (!supabase) {
      cachedPublishedCases = FALLBACK_CASES;
      return FALLBACK_CASES;
    }

    const { data, error } = await supabase
      .from('construction_cases')
      .select('id, title, slug, location, material_summary, product_id, main_image_url, description, constructed_at, sort_order, is_published, is_active, category, image_urls, products:product_id ( id, name, slug, product_code )')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (Array.isArray(data) && data.length > 0) {
      cachedPublishedCases = data;
      return data;
    }

    cachedPublishedCases = FALLBACK_CASES;
    return FALLBACK_CASES;
  } catch (err) {
    console.warn('[constructionCasesService] Supabase fetch failed, falling back to local data:', err);
    return cachedPublishedCases || FALLBACK_CASES;
  }
}

/**
 * Fisher-Yates shuffle algorithm for un-biased, O(N) in-place/copy randomization.
 * @param {Array} array
 * @returns {Array} Shuffled copy of the array
 */
export function fisherYatesShuffle(array) {
  if (!Array.isArray(array)) return [];
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get distinct random construction cases for the home showcase.
 * - Guarantees no duplicates.
 * - Adapts to any case count (e.g. 1 case returns [1 case], 2 cases returns 2 cases, etc.).
 * - Only includes published and active cases.
 * - Optional previousIds avoid showing the exact same set if there are enough cases.
 * @param {Array} cases
 * @param {number} count
 * @param {Array<number|string>} previousIds
 * @returns {Array}
 */
export function getRandomShowcaseCases(cases, count = 4, previousIds = []) {
  if (!Array.isArray(cases) || cases.length === 0) {
    return [];
  }

  // Filter for published & active cases only
  const validCases = cases.filter(c => c && c.is_published !== false && c.is_active !== false);
  if (validCases.length === 0) {
    return [];
  }

  // If total available is equal to or less than requested count, just shuffle them all
  if (validCases.length <= count) {
    return fisherYatesShuffle(validCases);
  }

  const prevSet = new Set(previousIds.map(String));
  // Divide into un-shown in previous visit and shown in previous visit
  const freshCases = validCases.filter(c => !prevSet.has(String(c.id)));
  const repeatedCases = validCases.filter(c => prevSet.has(String(c.id)));

  // Shuffle both pools with Fisher-Yates
  const shuffledFresh = fisherYatesShuffle(freshCases);
  const shuffledRepeated = fisherYatesShuffle(repeatedCases);

  // Prioritize fresh cases to maximize variety across home visits
  const combined = [...shuffledFresh, ...shuffledRepeated];
  return combined.slice(0, count);
}
