import { getMaterialImagePath, resolveProductImages, resolveProductCardImage } from "./materialImageResolver";
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
    return resolveProductCardImage(item);
}

export async function getDetailImage(item) {
    if (!item) return "";
    const images = resolveProductImages(item);
    return images[0] || "/images/no-image.svg";
}

export async function getValidGalleryImages(item) {
    if (!item) return [];
    const images = resolveProductImages(item);
    return images.map(url => ({ thumbnail: url, detail: url }));
}
