const { sampleBooks } = require('./src/data/samplebooks.db.js');
const { materials } = require('./src/data/materials.db.js');
const { imageManifest } = require('./src/data/imageManifest.js');

const BRAND_MAPPING = {
    'LX': 'LX하우시스',
    '개나리': '개나리벽지',
    '신한': '신한벽지',
    '제일': '제일벽지',
    '서울': '서울벽지',
    '디아이디': '디아이디',
    'DID': '디아이디',
    '동신': '동신',
    'KCC': 'KCC',
    '이건': '이건마루',
    '구정': '구정마루',
    '스완': '스완카페트'
};

const mapBrand = (brand) => {
    if (!brand) return "";
    const b = brand.toUpperCase();
    return BRAND_MAPPING[b] || brand;
};

const getKeywords = (title) => {
    if (!title) return [];
    let clean = title.replace(/\d{4}/g, '')
                     .replace(/LX|KCC|동신|개나리|신한|서울|제일|디아이디|DID|이건|구정|스완/gi, '')
                     .replace(/데코타일|장판|마루|벽지|카페트타일/g, '')
                     .replace(/\(.*?\)/g, '')
                     .replace(/\[.*?\]/g, '')
                     .replace(/합지|실크|방염/g, '')
                     .trim();
    return clean.split(/[^a-zA-Z0-9가-힣]+/).filter(w => w.length >= 1);
};

let matchedCount = 0;
let fallbackCount = 0;
let failedCount = 0;

sampleBooks.forEach(book => {
    if (!book.cover) {
        const keywords = getKeywords(book.title);
        const targetBrand = mapBrand(book.brand);
        
        const brandProducts = materials.filter(m => {
            if (m.category !== book.category) return false;
            return mapBrand(m.brand || "") === targetBrand;
        });

        let matched = null;

        if (brandProducts.length > 0) {
            if (keywords.length > 0) {
                matched = brandProducts.find(m => {
                    return keywords.some(keyword => {
                        const term = keyword.toUpperCase();
                        return (m.id && m.id.toUpperCase().includes(term)) ||
                               (m.name && m.name.toUpperCase().includes(term)) ||
                               (m.line && m.line.toUpperCase().includes(term)) ||
                               (m.code && m.code.toUpperCase().includes(term));
                    });
                });
            }

            if (matched && matched.thumbnail) {
                matchedCount++;
                console.log(`MATCHED: "${book.title}" -> Product: "${matched.name}" (${matched.code})`);
            } else if (brandProducts[0].thumbnail) {
                fallbackCount++;
                console.log(`FALLBACK: "${book.title}" -> First product: "${brandProducts[0].name}" (${brandProducts[0].code})`);
            } else {
                failedCount++;
                console.log(`FAILED (no thumbnail): "${book.title}"`);
            }
        } else {
            failedCount++;
            console.log(`FAILED (no brand products): "${book.title}" (brand: ${book.brand}, cat: ${book.category})`);
        }
    }
});

console.log(`Summary: Matched: ${matchedCount}, Fallback: ${fallbackCount}, Failed: ${failedCount}`);
