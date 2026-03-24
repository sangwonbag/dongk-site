// src/utils/imageLoader.js

/**
 * Check if a URL exists via HEAD request.
 * @param {string} url 
 * @returns {Promise<boolean>}
 */
export async function urlExists(url) {
    try {
        // dev 서버에서는 HEAD가 보통 잘 됨. 막히면 GET으로 바꿔.
        const res = await fetch(url, { method: "HEAD", cache: "no-store" });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Build product images list by checking existence.
 * @param {Object} params
 * @param {string} params.brand
 * @param {string} params.slug
 * @param {number} [params.maxExtra=20]
 * @returns {Promise<{main: string|null, extras: string[]}>}
 */
export async function buildProductImages({ brand, slug, maxExtra = 20 }) {
    const name = decodeURIComponent(slug); // ✅ TS%205508P -> TS 5508P

    // Map brand to folder name if needed, or use as is
    // Assuming folder structure matches brand name or has a mapper
    // User request: "public/images/Thumbnail_Image/{brand}/"
    // We might need a mapper if brand names in DB don't match folder names exactly
    // But for now, we use the logic provided in the snippet.
    // If brand is "동신", folder might be "dongshin".
    // Let's add a simple mapper for safety based on previous context.

    const BRAND_MAP = {
        "KCC": "KCC_square",
        "동신": "dongshin",
        "LX1.8T": "LX하우시스_뉴청맥_1.8T",
        "LX2.0T": "LX하우시스_은행목_2.0T",
        "LX2.7T": "LX하우시스_지아사랑애_2.7T",
        "LX3.2T": "LX하우시스_지아사랑애_3.2T",
        "LX4.5T": "LX하우시스_지아소리잠_4.5T",
        "LX": "LX하우스"
    };

    const brandDir = BRAND_MAP[brand] || brand;
    const baseDir = `/images/Thumbnail_Image/${brandDir}`;
    const exts = ["jpg", "jpeg", "png", "webp"];

    // 1) 메인 후보: "TS 5508P.(ext)"
    let main = null;
    for (const ext of exts) {
        const u = `${baseDir}/${name}.${ext}`;
        if (await urlExists(u)) { main = u; break; }
    }

    // 2) 추가 후보: "TS 5508P_1.(ext)" ... 존재하는 것만
    const extras = [];
    for (let i = 1; i <= maxExtra; i++) {
        let found = null;
        for (const ext of exts) {
            const u = `${baseDir}/${name}_${i}.${ext}`;
            if (await urlExists(u)) { found = u; break; }
        }
        if (found) extras.push(found);
    }

    // 3) 메인이 없으면 extras[0]를 메인으로
    if (!main && extras.length) {
        main = extras[0];
        extras.shift();
    }

    return { main, extras };
}
