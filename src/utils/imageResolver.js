// src/utils/imageUtils.js

const BRAND_IMG = {
    "KCC": {
        thumbDir: "/images/Thumbnail_Image/KCC_square",
        thumbExt: "jpg",
        coverDir: "/images/Thumbnail_Image/KCC_square",
        coverExt: "jpg",
    },
    "동신": {
        thumbDir: "/images/Thumbnail_Image/dongshin",
        thumbExt: "png",
        coverDir: "/images/cover/dongshin",
        coverExt: "png",
    },
    "LX1.8T": { thumbDir: "/images/Thumbnail_Image/LX하우시스_뉴청맥_1.8T", thumbExt: "jpg", coverDir: "/images/cover/LX하우시스_뉴청맥_1.8T", coverExt: "jpg" },
    "LX2.0T": { thumbDir: "/images/Thumbnail_Image/LX하우시스_은행목_2.0T", thumbExt: "jpg", coverDir: "/images/cover/LX하우시스_은행목_2.0T", coverExt: "jpg" },
    "LX2.7T": { thumbDir: "/images/Thumbnail_Image/LX하우시스_지아사랑애_2.7T", thumbExt: "jpg", coverDir: "/images/cover/LX하우시스_지아사랑애_2.7T", coverExt: "jpg" },
    "LX3.2T": { thumbDir: "/images/Thumbnail_Image/LX하우시스_지아사랑애_3.2T", thumbExt: "jpg", coverDir: "/images/cover/LX하우시스_지아사랑애_3.2T", coverExt: "jpg" },
    "LX4.5T": { thumbDir: "/images/Thumbnail_Image/LX하우시스_지아소리잠_4.5T", thumbExt: "jpg", coverDir: "/images/cover/LX하우시스_지아소리잠_4.5T", coverExt: "jpg" },
    "LX": { thumbDir: "/images/Thumbnail_Image/LX", thumbExt: "jpg", coverDir: "/images/cover/LX", coverExt: "jpg" }
};

export function normalizeCode(input) {
    if (!input) return "";
    // 공백만 제거, 대문자화 (AB_6711 같은 언더스코어는 유지됨)
    return String(input).replace(/\s+/g, "").toUpperCase().trim();
}

export function getImagePaths(material) {
    const brand = material?.brand || material?.maker || material?.company || "KCC";
    const cfg = BRAND_IMG[brand] || BRAND_IMG["KCC"];

    const code = normalizeCode(material?.code || material?.productCode || material?.id);

    const thumbnail = `${cfg.thumbDir}/${code}.${cfg.thumbExt}`;
    const cover = `${cfg.coverDir}/${code}.${cfg.coverExt}`;

    return { thumbnail, cover };
}
// ✅ 커버 로딩 실패 시 -> 썸네일 -> no-image 순으로 떨어뜨리는 핸들러
export function handleImageError(e, fallbackSrc) {
    const img = e.currentTarget;
    const cur = img.getAttribute("data-fallback-step") || "0";

    if (cur === "0" && fallbackSrc) {
        img.src = fallbackSrc;
        img.setAttribute("data-fallback-step", "1");
        return;
    }

    img.src = "/images/no-image.jpg";
    img.setAttribute("data-fallback-step", "2");
}
