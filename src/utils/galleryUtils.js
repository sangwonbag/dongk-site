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

    // 1. Try manual gallery data from DB
    if (item.galleryImages && Array.isArray(item.galleryImages)) {
        const mapped = item.galleryImages.map(g => {
            if (typeof g === 'string') return { thumbnail: g, detail: g };
            return {
                thumbnail: g.thumbnail || g.detail || "",
                detail: g.detail || g.thumbnail || ""
            };
        });
        if (mapped.length > 0) return mapped;
    }

    const keys = [item.code, item.name].filter(Boolean).map(normalize);

    for (const key of keys) {
        if (imageManifest[key] && imageManifest[key].gallery) {
            // Manifest contains strings, map them to objects
            // Future-proofing: if they provide large files, they can update this mapping.
            return imageManifest[key].gallery.map(str => ({
                thumbnail: str,
                detail: str // Fallback to same string if no high-res replacement logic
            }));
        }
    }

    return [];
}
