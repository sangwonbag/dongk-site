const { sampleBooks } = require('./src/data/samplebooks.db.js');
const { materials } = require('./src/data/materials.db.js');
const { imageManifest } = require('./src/data/imageManifest.js');

const normalize = (str) => str ? str.replace(/[^a-zA-Z0-9가-힣]/g, '').toUpperCase() : "";

function mapBrand(brand) {
    const b = brand.toUpperCase();
    if (b === 'LX') return 'LX하우시스';
    if (b === '개나리') return '개나리벽지';
    if (b === '신한') return '신한벽지';
    if (b === '제일') return '제일벽지';
    if (b === '서울') return '서울벽지';
    if (b === '디아이디' || b === 'DID') return '디아이디';
    if (b === '동신') return '동신';
    if (b === 'KCC') return 'KCC';
    if (b === '이건') return '이건마루';
    if (b === '구정') return '구정마루';
    return brand;
}

// Extract keywords from title
function getKeywords(title) {
    // Remove year, brand, category, brackets, thickness
    let clean = title.replace(/\d{4}/g, '')
                     .replace(/LX|KCC|동신|개나리|신한|서울|제일|디아이디|DID|이건|구정/g, '')
                     .replace(/데코타일|장판|마루|벽지|카페트타일/g, '')
                     .replace(/\(.*?\)/g, '')
                     .replace(/\[.*?\]/g, '')
                     .replace(/합지|실크|방염/g, '')
                     .trim();
    // Split by spaces or special chars
    return clean.split(/[\s_\-]+/).filter(w => w.length >= 2);
}

console.log('Testing match for coverless books:');
let matchedCount = 0;
let totalCoverless = 0;

sampleBooks.forEach(book => {
    if (!book.cover) {
        totalCoverless++;
        const keywords = getKeywords(book.title);
        const targetBrand = mapBrand(book.brand);
        
        // Find matching product
        const matchedProduct = materials.find(m => {
            if (m.category !== book.category) return false;
            // Check brand
            const mBrand = m.brand || "";
            if (mapBrand(mBrand) !== targetBrand) return false;
            
            // Check keywords
            if (keywords.length === 0) return true; // match first if no keywords
            
            return keywords.some(keyword => {
                const term = keyword.toUpperCase();
                return (m.id && m.id.toUpperCase().includes(term)) ||
                       (m.name && m.name.toUpperCase().includes(term)) || 
                       (m.line && m.line.toUpperCase().includes(term)) || 
                       (m.code && m.code.toUpperCase().includes(term));
            });
        });
        
        if (matchedProduct) {
            matchedCount++;
            console.log(`MATCHED: "${book.title}" (brand: ${book.brand}, cat: ${book.category}) -> Product: "${matchedProduct.name}" (code: ${matchedProduct.code}), thumbnail: ${matchedProduct.thumbnail}`);
        } else {
            console.log(`FAILED: "${book.title}" (brand: ${book.brand}, cat: ${book.category}) Keywords tried:`, keywords);
        }
    }
});

console.log(`Summary: Matched ${matchedCount}/${totalCoverless} coverless books.`);
