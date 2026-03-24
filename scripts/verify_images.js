
import { getCoverImage, getValidGalleryImages } from "../src/utils/galleryUtils.js";

const testItems = [
    { code: "TS 5535M", brand: "KCC" },
    { code: "TS5502P", brand: "KCC" },
    { code: "AB_6711", brand: "동신" },
    { code: "TW 5102G", brand: "KCC" } // Wood
];

async function run() {
    console.log("Verifying Image Loading...");

    for (const item of testItems) {
        const cover = await getCoverImage(item);
        const gallery = await getValidGalleryImages(item);
        console.log(`[${item.code}] Cover: ${cover} | Gallery: ${gallery.length} images`);
    }
}

run();
