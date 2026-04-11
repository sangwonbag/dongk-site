import { imageManifest } from "../data/imageManifest";

const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase() : "";

export async function getThumbnailImage(item) {
    if (!item) return "";

    // 1. Try direct thumbnail property first
    if (item.thumbnail) return item.thumbnail;
    if (item.cover) return item.cover; // Fallback to cover if old db format

    // 2. Fallback to code/name lookup in manifest
    const keys = [item.code, item.name].filter(Boolean).map(normalize);

    for (const key of keys) {
        if (imageManifest[key] && imageManifest[key].thumbnail) {
            return imageManifest[key].thumbnail;
        }
        if (imageManifest[key] && imageManifest[key].cover) {
            return imageManifest[key].cover;
        }
    }

    return "";
}

export async function getDetailImage(item) {
    if (!item) return "";

    // 1. Try direct detail property first
    if (item.detailImage) return item.detailImage;
    
    // 2. Fallback to code/name lookup in manifest
    const keys = [item.code, item.name].filter(Boolean).map(normalize);

    for (const key of keys) {
        if (imageManifest[key] && imageManifest[key].detail) {
            return imageManifest[key].detail;
        }
    }

    // 3. Fallback to thumbnail if no detail is found
    return getThumbnailImage(item);
}

export async function getValidGalleryImages(item) {
    if (!item) return [];

    const keys = [item.code, item.name].filter(Boolean).map(normalize);

    for (const key of keys) {
        if (imageManifest[key] && imageManifest[key].gallery) {
            // Manifest already contains only _1 and _2 in order
            return imageManifest[key].gallery;
        }
    }

    return [];
}
