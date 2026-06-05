import { imageManifest } from "../data/imageManifest";

/**
 * 샘플북 커버 이미지를 자동 매칭하는 유틸리티
 */

const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : "";

// samplebooks 폴더의 이미지들을 재귀적으로 eager 로딩 (Thumbnail_image 폴더 제외)
const sampleBookImages = import.meta.glob(['/samplebooks/**/*.{jpg,jpeg,png,webp}', '!/samplebooks/Thumbnail_image/**'], { eager: true });

// 이미지 파일명 목록 추출
const imageFiles = Object.entries(sampleBookImages).map(([path]) => {
    return {
        path: path,
        filename: path.split('/').pop()
    };
});

/**
 * 샘플북 데이터에서 매칭되는 이미지 경로 반환
 * @param {Object} book 샘플북 객체
 * @returns {string|null} 매칭된 이미지 경로 또는 null
 */
export const getAutoMatchedCover = (book) => {
    if (!book) return null;

    // 1. Manifest에서 ID 또는 제목으로 매칭 시도
    const keys = [book.id, book.title, book.name].filter(Boolean).map(normalize);
    for (const key of keys) {
        const entry = imageManifest[key];
        if (entry) {
            const path = entry.thumbnail || entry.cover;
            if (path) {
                if (path.startsWith('http') || path.startsWith('/')) return path;
                return `https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/${path}`;
            }
        }
    }

    // 2. 두께 패턴 (x.xT) 기반 매칭 (레거시/폴백)
    const searchText = (book.title || book.name || "");
    const thicknessMatch = searchText.match(/\d+(\.\d+)?T/);

    if (thicknessMatch) {
        const thickness = thicknessMatch[0];
        const matchedImage = imageFiles.find(img => img.filename.includes(thickness));
        if (matchedImage) return matchedImage.path;
    }

    return null;
};
