
/**
 * Generate candidate URLs for a product image and its variants.
 * @param {string} baseKey - The filename without extension (e.g. "TS 5502P 우븐")
 * @param {number} max - Maximum number of variants to check
 * @returns {string[]} Array of encoded URLs
 */
function buildCandidateList(baseKey, max = 10) {
    const list = [];

    // 대표 이미지
    list.push(`/images/Thumbnail_Image/${baseKey}.jpg`);

    // _1, _2, _3 ...
    for (let i = 1; i <= max; i++) {
        list.push(`/images/Thumbnail_Image/${baseKey}_${i}.jpg`);
    }

    return list.map(url => encodeURI(url));
}

/**
 * Check if an image exists by loading it.
 * @param {string} url 
 * @returns {Promise<boolean>}
 */
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

/**
 * Get list of existing image URLs for a product.
 * @param {string} baseKey 
 * @returns {Promise<string[]>}
 */
export async function getDetailImages(baseKey) {
    if (!baseKey) return [];

    // Generate candidates
    const candidates = buildCandidateList(baseKey);

    // Check existence in parallel
    const results = await Promise.all(candidates.map(async (url) => {
        const exists = await checkImageExists(url);
        return exists ? url : null;
    }));

    // Filter out nulls
    return results.filter(url => url !== null);
}
