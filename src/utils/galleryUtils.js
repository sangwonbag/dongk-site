import { resolveProductImages, resolveProductCardImage } from "./materialImageResolver";

export const SUPABASE_PUBLIC_URL_PREFIX = "https://ymoshkaiwvnmhhcglpjj.supabase.co/storage/v1/object/public/materials/";

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
