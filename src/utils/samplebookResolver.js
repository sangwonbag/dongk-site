let imageManifestCache = null;
async function getImageManifest() {
    if (imageManifestCache) return imageManifestCache;
    try {
        const mod = await import("../data/imageManifest");
        imageManifestCache = mod.imageManifest || {};
    } catch {
        imageManifestCache = {};
    }
    return imageManifestCache;
}

/**
 * 샘플북 커버 이미지를 자동 매칭하는 유틸리티
 */

const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : "";

// samplebooks 폴더의 이미지들을 재귀적으로 eager 로딩 (Thumbnail_image 폴더 제외)
const sampleBookImages = import.meta.glob(['/samplebook-assets/**/*.{jpg,jpeg,png,webp}', '!/samplebook-assets/Thumbnail_image/**'], { eager: true });

// 이미지 파일명 목록 추출
const imageFiles = Object.entries(sampleBookImages).map(([path]) => {
    return {
        path: path,
        filename: path.split('/').pop()
    };
});

/**
 * 안전한 URI 인코딩 유틸리티 (한글, 공백, 특수문자 안전 처리)
 */
export const safeEncodeURI = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // 이미 encodeURI가 되었는지 확인 후 아니면 인코딩
    try {
        const decoded = decodeURIComponent(url);
        return encodeURI(decoded);
    } catch {
        return encodeURI(url);
    }
};

/**
 * 샘플북 커버 이미지를 자동 매칭하는 유틸리티
 * @param {Object} book 샘플북 객체
 * @returns {string|null} 매칭된 이미지 경로 또는 null
 */
export const getAutoMatchedCover = (book) => {
    if (!book) return null;
    if (book.cover) return safeEncodeURI(book.cover);

    // 1. Manifest에서 ID 또는 제목으로 매칭 시도 (캐시된 경우 사용)
    if (imageManifestCache) {
        const keys = [book.id, book.title, book.name].filter(Boolean).map(normalize);
        for (const key of keys) {
            const entry = imageManifestCache[key];
            if (entry) {
                const path = entry.thumbnail || entry.cover;
                if (path) {
                    if (path.startsWith('http') || path.startsWith('/')) return safeEncodeURI(path);
                    return `https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/${path}`;
                }
            }
        }
    } else {
        getImageManifest().catch(() => {});
    }

    // 2. 두께 패턴 (x.xT) 기반 매칭 (레거시/폴백)
    const searchText = (book.title || book.name || "");
    const thicknessMatch = searchText.match(/\d+(\.\d+)?T/);

    if (thicknessMatch) {
        const thickness = thicknessMatch[0];
        const matchedImage = imageFiles.find(img => img.filename.includes(thickness));
        if (matchedImage) return safeEncodeURI(matchedImage.path);
    }

    return null;
};

