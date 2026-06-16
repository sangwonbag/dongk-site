import { getMaterialImagePath } from "./materialImageResolver";
import { imageManifest } from "../data/imageManifest";
import { materials } from "../data/materials.db";

const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase() : "";

export const SUPABASE_PUBLIC_URL_PREFIX = "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/";

function toFullUrl(path) {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return path; // Keep absolute local paths
    return SUPABASE_PUBLIC_URL_PREFIX + path;
}

export async function getThumbnailImage(item) {
    if (!item) return "";

    // Try code-matching material image resolver first
    const resolvedLocalPath = getMaterialImagePath(item);
    if (resolvedLocalPath && resolvedLocalPath !== '/images/no-image.svg') {
        return resolvedLocalPath;
    }

    // 1. Try manifest lookup first to get the Supabase Storage hash
    const keys = [item.code, item.name].filter(Boolean).map(normalize);
    for (const key of keys) {
        const entry = imageManifest[key];
        if (entry) {
            if (Array.isArray(entry)) {
                if (entry.length > 0) return toFullUrl(entry[0]);
            } else {
                if (entry.thumbnail) return toFullUrl(entry.thumbnail);
                if (entry.cover) return toFullUrl(entry.cover);
            }
        }
    }

    // 2. Fallback to direct thumbnail property if not found in manifest
    if (item.thumbnail) return toFullUrl(item.thumbnail);
    if (item.cover) return toFullUrl(item.cover); // Fallback to cover if old db format

    // 3. Try looking up in local materials database
    const localProduct = (materials || []).find(m => 
        m.category === item.category && 
        m.brand === item.brand && 
        m.code === item.code
    );
    if (localProduct && (localProduct.thumbnail || localProduct.image)) {
        return toFullUrl(localProduct.thumbnail || localProduct.image);
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
        const entry = imageManifest[key];
        if (!entry) continue;

        if (Array.isArray(entry) || entry.images) {
            return getThumbnailImage(item); // the full array is handled by getValidGalleryImages
        } else if (entry.detail) {
            return toFullUrl(entry.detail);
        }
    }

    // 3. Fallback to thumbnail if no detail is found
    return getThumbnailImage(item);
}

export async function getValidGalleryImages(item) {
    if (!item) return [];

    // 1. Try manifest lookup first
    const keys = [item.code, item.name].filter(Boolean).map(normalize);
    for (const key of keys) {
        const entry = imageManifest[key];
        if (entry) {
            if (Array.isArray(entry)) {
                return entry.map(str => ({ thumbnail: toFullUrl(str), detail: toFullUrl(str) }));
            } else if (entry.images) {
                return entry.images.map(str => ({ thumbnail: toFullUrl(str), detail: toFullUrl(str) }));
            } else if (entry.gallery) {
                return entry.gallery.map(str => ({
                    thumbnail: toFullUrl(str),
                    detail: toFullUrl(str)
                }));
            }
        }
    }

    // 2. Fallback to manual gallery data from DB
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

    if (item.images && Array.isArray(item.images)) {
        return item.images.map(str => ({
            thumbnail: toFullUrl(str),
            detail: toFullUrl(str)
        }));
    }

    // 2. Try looking up in local materials database
    const localProduct = (materials || []).find(m => 
        m.category === item.category && 
        m.brand === item.brand && 
        m.code === item.code
    );
    if (localProduct && localProduct.images && Array.isArray(localProduct.images)) {
        return localProduct.images.map(str => ({
            thumbnail: toFullUrl(str),
            detail: toFullUrl(str)
        }));
    }

    return [];
}
