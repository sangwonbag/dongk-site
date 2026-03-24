import { imageManifest } from "../data/imageManifest";

const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : "";

export async function getCoverImage(item) {
    if (!item) return "";

    // 1. Try direct cover/thumbnail/image property first
    if (item.cover) return item.cover;
    if (item.thumbnail) return item.thumbnail;
    if (item.image) return item.image;

    // 2. Fallback to code/name lookup in manifest
    const keys = [item.code, item.name].filter(Boolean).map(normalize);

    for (const key of keys) {
        if (imageManifest[key] && imageManifest[key].cover) {
            return imageManifest[key].cover;
        }
    }

    return "";
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
