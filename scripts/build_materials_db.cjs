const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MATERIALS_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'Thumbnail_Image', 'materials');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'generatedMaterials.js');

function getMd5StorageKey(absPath) {
    const relPath = path.relative(MATERIALS_DIR, absPath).replace(/\\/g, '/');
    const hash = crypto.createHash('md5').update(relPath, 'utf8').digest('hex');
    const ext = path.extname(absPath).toLowerCase();
    return hash + ext;
}

// Helper to extract a readable brand name from folder
function extractBrand(folderName, category) {
    if (folderName.includes('KCC')) return 'KCC';
    if (folderName.toLowerCase().includes('dongshin')) return '동신';
    if (folderName.toLowerCase().includes('yousung')) return '유성';
    if (folderName.includes('LX') && category === '벽지') return 'LX';
    if (folderName.includes('LX')) return 'LX';
    if (folderName.includes('구정')) return '구정';
    if (folderName.includes('동화')) return '동화';
    if (folderName.includes('이건')) return '이건';
    if (folderName.includes('개나리')) return '개나리';
    if (folderName.includes('서울')) return '서울';
    if (folderName.includes('신한')) return '신한(KCC)';
    if (folderName.includes('제일')) return '제일';
    if (folderName.includes('스완')) return '스완';
    if (folderName.includes('아반')) return '아반';
    if (folderName.toLowerCase().includes('noksu')) return '녹수';
    return folderName;
}

// Pricing & Spec Rules Engine
function applyRules(category, brand, line, fileName, nameOnly, id, code, brandFolder) {
    let price = 0;
    let sizeLabel = "";
    let packing = "";
    let thickness = "";
    let type = "";
    let materialType = "";
    let division = "";

    // Regex helpers for code
    const uCode = code.toUpperCase();

    switch (category) {
        case '데코타일':
            if (brand === '동신') {
                if (uCode.startsWith("AS")) {
                    sizeLabel = "457.2x457.2mm";
                    packing = "16pcs / 3.34㎡";
                    type = "ds_450";
                    materialType = "동신 450각";
                    price = 36000;
                } else if (uCode.startsWith("AH 61") || uCode.startsWith("AH_61") || uCode.startsWith("AH61")) {
                    sizeLabel = "600x600mm";
                    packing = "9pcs / 3.24㎡";
                    type = "ds_600";
                    materialType = "동신 600각";
                    price = 36000;
                } else {
                    sizeLabel = "180x920mm";
                    packing = "20pcs / 3.31㎡";
                    type = "ds_wood";
                    materialType = "동신 우드";
                    price = uCode.startsWith("AB") ? 24000 : 36000;
                }
            } else if (brand === 'KCC') {
                if (uCode.endsWith("M") || uCode.includes("600")) {
                    price = 26000;
                    sizeLabel = "600x600mm";
                    packing = "9pcs / 3.24㎡";
                    type = "600";
                } else if (uCode.endsWith("P") || uCode.includes("450") || (!uCode.startsWith("TW") && uCode !== "TS5508")) {
                    price = 25000;
                    sizeLabel = "457.2x457.2mm"; // Usually P is 450
                    packing = "16pcs / 3.34㎡";
                    type = "450";
                } else if (uCode.startsWith("TW") || uCode.toLowerCase().includes("wood")) {
                    price = 25000;
                    sizeLabel = "184x950mm";
                    packing = "19pcs / 3.32㎡";
                    type = "wood";
                }
            } else if (brand === '유성') {
                thickness = "3.0mm";
                const uName = nameOnly.toUpperCase();
                if (uName.startsWith('FWM') || uName.includes('WOOD') || (line.includes('우드') && !line.includes('600'))) {
                    sizeLabel = "180mm(W) x 920mm(L) x 3.0(T)";
                    packing = "20pcs/box (3.31㎡)";
                    type = "wood";
                } else if (uName.startsWith('FSM') || line.includes('600각') || line.includes('600')) {
                    sizeLabel = "600mm(W) x 600mm(L) x 3.0(T)";
                    packing = "9 pcs/box (3.24㎡)";
                    type = "600";
                }
            } else if (brand === 'LX') {
                // Determine prices based on lines or codes
                if (line.includes('프레스티지')) {
                    price = 36000;
                    thickness = "5.0T";
                    if (uCode.startsWith("PTW")) { sizeLabel = "228.6x1523mm"; packing = "6pcs / 2.09㎡"; }
                    else if (uCode.startsWith("PTT8")) { sizeLabel = "457.2x914.4mm"; packing = "5pcs / 2.09㎡"; }
                    else { sizeLabel = "600x600mm"; packing = "5pcs / 1.80㎡"; }
                } else if (line.includes('에코노플러스')) {
                    price = 35000;
                    thickness = "3.0T";
                } else if (line.includes('보타닉')) {
                    price = 35000;
                    thickness = "3.0T";
                    if (uCode.startsWith("DBW")) {
                        sizeLabel = "180x920mm";
                        packing = "20pcs / 3.31㎡";
                        type = "wood";
                    } else if (uCode.startsWith("DBT")) {
                        const numMatch = uCode.match(/\d+/);
                        const num = numMatch ? parseInt(numMatch[0], 10) : 0;
                        if (num >= 3080) {
                            sizeLabel = "600x600mm";
                            packing = "9pcs / 3.24㎡";
                            type = "600";
                        } else {
                            sizeLabel = "450x450mm";
                            packing = "16pcs / 3.24㎡";
                            type = "450";
                        }
                    }
                } else if (line.includes('데코레이')) {
                    price = 0; // Unknown
                    thickness = "3.0T";
                } else if (line.includes('하우스스타일') || (brandFolder && brandFolder.includes('하우스스타일'))) {
                    thickness = "3.0T";
                    price = 0; // Unspecified
                    if (uCode.startsWith("ZOT")) {
                        sizeLabel = "600x600mm";
                        packing = "9pcs / 3.24㎡";
                        division = "스톤"; 
                        type = "600";
                    } else if (uCode.startsWith("ZOW")) {
                        sizeLabel = "150x1200mm";
                        packing = "18pcs / 3.24㎡";
                        division = "우드";
                        type = "wood";
                    }
                } else if (line.includes('하우스') || (brandFolder && brandFolder.includes('하우스'))) {
                    // This acts as a fallback for '하우스' that isn't '하우스스타일'
                    // Since '하우스스타일' is matched above, this will only hit for '하우스'
                    thickness = "3.0T";
                    price = 40000;
                    if (uCode.startsWith("HOT")) {
                        sizeLabel = "600x600mm";
                        packing = "9pcs / 3.24㎡";
                        division = "스톤"; 
                        type = "600";
                    } else if (uCode.startsWith("HOW")) {
                        sizeLabel = "150x920mm";
                        packing = "24pcs / 3.31㎡";
                        division = "우드";
                        type = "wood";
                    }
                }
            } else if (brand === '녹수') {
                if (line.includes('프라임1500')) {
                    price = 21500;
                    if (line.includes('우드') || uCode.startsWith("NPW")) {
                        sizeLabel = "184x950mm";
                        packing = "19pcs/Box (3.32m²)";
                        thickness = "3.0T";
                        type = "wood";
                    } else if (line.includes('450각')) {
                        sizeLabel = "457.2x457.2mm";
                        packing = "16pcs/Box (3.34m²)";
                        thickness = "3.0T";
                        type = "450";
                    } else if (line.includes('600각')) {
                        sizeLabel = "600x600mm";
                        packing = "9pcs/Box (3.24m²)";
                        thickness = "3.0T";
                        type = "600";
                    }
                } else if (line.includes('세타그립')) {
                    if (line.includes('450각')) {
                        sizeLabel = "457.2x457.2mm";
                        packing = "14pcs/Box (2.93m²)";
                        thickness = "3.5T";
                        type = "450";
                    } else if (line.includes('우드')) {
                        sizeLabel = "152.4x1219.2mm";
                        packing = "16pcs/Box (2.97m²)";
                        thickness = "3.5T";
                        type = "wood";
                    }
                } else if (line.includes('오키드3000')) {
                    price = 32000;
                    if (line.includes('우드450')) {
                        sizeLabel = "457.2x914.4mm";
                        packing = "8pcs/Box (3.34m²)";
                        thickness = "3.0T";
                        type = "wood";
                    } else if (line.includes('우드1200')) {
                        sizeLabel = "180x1200mm";
                        packing = "15pcs/Box (3.24m²)";
                        thickness = "3.0T";
                        type = "wood";
                    } else if (line.includes('우드150') || line.includes('프리미엄_우드')) {
                        sizeLabel = "152.4x914.4mm";
                        packing = "24pcs/Box (3.34m²)";
                        thickness = "3.0T";
                        type = "wood";
                    } else if (line.includes('우드') || uCode.startsWith("NOW")) {
                        sizeLabel = "186x940mm";
                        packing = "18pcs/Box (3.15m²)";
                        thickness = "3.0T";
                        type = "wood";
                    } else if (line.includes('900각')) {
                        sizeLabel = "914.4x914.4mm";
                        packing = "6pcs/Box (5.02m²)";
                        thickness = "3.0T";
                        type = "900";
                    } else if (line.includes('프리미엄_600각')) {
                        sizeLabel = "609.6x609.6mm";
                        packing = "9pcs/Box (3.34m²)";
                        thickness = "3.0T";
                        type = "600";
                    } else if (line.includes('600각')) {
                        sizeLabel = "600x600mm";
                        packing = "9pcs/Box (3.24m²)";
                        thickness = "3.0T";
                        type = "600";
                    } else if (line.includes('프리미엄_450각')) {
                        sizeLabel = "457.2x457.2mm";
                        packing = "16pcs/Box (3.34m²)";
                        thickness = "3.0T";
                        type = "450";
                    } else if (line.includes('450각')) {
                        sizeLabel = "457.2x457.2mm";
                        packing = "15pcs/Box (3.14m²)";
                        thickness = "3.0T";
                        type = "450";
                    }
                } else if (line.includes('에코홈2000')) {
                    price = 32000;
                    if (line.includes('우드') || uCode.startsWith("NEW")) {
                        sizeLabel = "180x920mm";
                        packing = "19pcs/Box (3.15m²)";
                        thickness = "3.0T";
                        type = "wood";
                    } else if (line.includes('600각')) {
                        sizeLabel = "600x600mm";
                        packing = "9pcs/Box (3.24m²)";
                        thickness = "3.0T";
                        type = "600";
                    }
                }
            }
            break;

        case '장판':
            if (brand.includes('LX') || (brandFolder && brandFolder.includes('LX'))) {
                // Parse thickness from brandFolder or line
                const thicknessSource = brandFolder || line;
                
                if (thicknessSource.includes('뉴청맥')) {
                    price = 11000;
                    sizeLabel = "1.8mm(T) x 1,830mm(W)";
                    packing = "35m / Roll";
                } else if (thicknessSource.includes('은행목')) {
                    price = 17000;
                    sizeLabel = "2.0mm(T) x 1,830mm(W)";
                    packing = "30m / Roll";
                } else if (thicknessSource.includes('지아자연애')) {
                    price = 22000;
                    sizeLabel = "2.2mm(T) x 1,830mm(W)";
                    packing = "30m / Roll";
                } else if (thicknessSource.includes('지아사랑애') && thicknessSource.includes('3.2')) {
                    price = 36000;
                    sizeLabel = "3.2mm(T) x 1,830mm(W)";
                    packing = "23m / Roll";
                } else if (thicknessSource.includes('지아사랑애') && thicknessSource.includes('2.7')) {
                    price = 32000;
                    sizeLabel = "2.7mm(T) x 1,830mm(W)";
                    packing = "25m / Roll";
                } else if (thicknessSource.includes('지아소리잠')) {
                    price = 44000;
                    sizeLabel = "4.5mm(T) x 1,830mm(W)";
                    packing = "20m / 롤";
                } else if (thicknessSource.includes('엑스컴포트')) {
                    price = 50000;
                    sizeLabel = "5.0mm(T) x 1,830mm(W)";
                    packing = "20m / Roll";
                }
                let tMatch = thicknessSource.match(/(\d\.\d)T/i);
                if (tMatch) {
                    thickness = tMatch[0].toUpperCase();
                    brand = `LX ${thickness}`;
                } else {
                    thickness = "1.8T"; // default
                    brand = `LX 1.8T`;
                }
                if (!sizeLabel) sizeLabel = "1.83m x 롤단위";
                if (!packing) packing = "m 단위 절단 판매";
            }
            break;

        case '마루':
            if (brand === '동화' && line.includes('진 오리진')) {
                materialType = "진 오리진";
                thickness = "7.5T";
                sizeLabel = "190x1615mm";
                packing = "1박스 (1.84 m²)";
            }
            break;

        case '벽지':
            if (line.includes('방염') || fileName.includes('방염') || (brandFolder && brandFolder.includes('방염'))) {
                materialType = "방염";
            } else if (brand.includes('신한')) {
                materialType = line.includes('실크') || line.includes('스케치') || line.includes('리빙') || line.includes('월가드') ? "실크" : "합지";
            } else if (brand === 'LX') {
                if (line.includes('디아망') || uCode.startsWith('PR0') || uCode.startsWith('PRO') || uCode.startsWith('DF')) {
                    materialType = "디아망";
                } else if (uCode.startsWith('4')) {
                    materialType = "합지";
                } else {
                    materialType = "실크";
                }
            } else if (brand === '제일') {
                materialType = line.includes('실크') ? "실크" : "합지";
                if (!line) materialType = "합지";
            } else if (brand === '서울') {
                if (line.includes('프리미엄')) {
                    materialType = "프리미엄";
                    sizeLabel = "1.06m(W) x 15.6m(H) / Roll";
                    packing = "1 Roll / Box";
                } else if (line.includes('합지')) {
                    materialType = "합지";
                    sizeLabel = "93cm(W) x 17.75m(H) / Roll";
                    packing = "6 Roll / Box";
                } else if (line.includes('실크')) {
                    materialType = "실크";
                    sizeLabel = "1.06m(W) x 15.6m(H) / Roll";
                    packing = "4 Roll / Box";
                } else if (line.includes('방염')) {
                    materialType = "방염";
                    sizeLabel = "1.06m(W) x 15.6m(H) / Roll";
                    packing = "4 Roll / Box";
                } else {
                    return { skip: true };
                }
            } else if (brand === '개나리') {
                if (line.includes('프리미엄')) {
                    materialType = "프리미엄";
                    sizeLabel = "1.06m(W) x 15.6m(H) / Roll";
                    packing = "2 Roll";
                } else if (line.includes('합지(소폭)')) {
                    materialType = "합지(소폭)";
                } else if (line.includes('합지(장폭)')) {
                    materialType = "합지(장폭)";
                } else if (line.includes('합지')) {
                    materialType = "합지";
                } else if (line.includes('아트북')) {
                    materialType = "실크";
                    sizeLabel = "1.06m(W) x 15.6m(H) / Roll (16.43㎡)";
                    packing = "4 Roll / Box";
                } else if (line.includes('실크')) {
                    materialType = "실크";
                    sizeLabel = "1.06m(W) x 15.6m(H) / Roll (16.43㎡)";
                    packing = "4 Roll";
                } else if (line.includes('방염')) {
                    materialType = "방염";
                    sizeLabel = "1.06m(W) x 15.6m(H) / Roll (16.43㎡)";
                    packing = "4 Roll";
                }
            }
            break;
    }

    return { price, sizeLabel, packing, thickness, type, materialType, brand, division };
}

function processDirectory(dirPath, category, brandFolder, lineFolder) {
    let items = [];
    if (!fs.existsSync(dirPath)) return items;

    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    files.forEach(file => {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
            if (!brandFolder) {
                items = items.concat(processDirectory(fullPath, category, file.name, ""));
            } else if (!lineFolder) {
                items = items.concat(processDirectory(fullPath, category, brandFolder, file.name));
            } else {
                items = items.concat(processDirectory(fullPath, category, brandFolder, lineFolder + "_" + file.name));
            }
        } else if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file.name)) {
            // Ignore _detail or _original for primary mapping as they should be deduped
            if (file.name.toLowerCase().includes('_detail')) return;
            
            const nameOnly = path.parse(file.name).name.replace(/_original$/i, '');
            
            // Guess Code from Name
            let codeMatch = nameOnly.match(/[A-Za-z0-9\-\_]+/g);
            let rawCode = codeMatch ? codeMatch[0] : nameOnly.trim().split(' ')[0];
            
            // Cleanup generic prefixes like "1. ", "내지_데코_"
            // Strip suffixes like _0, _1, _2, _detail, _thumb, _original
            let cleanName = nameOnly.replace(/^\d+\.\s*/, '').replace(/^내지_데코_/, '')
                              .replace(/_?(detail|thumb|original)$/i, '')
                              .replace(/_\d{1,2}$/, '') // strip _0, _1, _2 up to 2 digits max
                              .replace(/_$/, ''); // strip trailing underscore
                              
            let words = cleanName.trim().split(/\s+/);
            let finalCode = words[0];
            if (words.length > 1 && /^\d+/.test(words[1])) {
                finalCode += ' ' + words[1];
            }
            if (brandFolder && brandFolder.toLowerCase().includes('yousung')) {
                finalCode = words[words.length - 1]; 
            }

            // Convert contiguous 3-letter + numbers to spaced format (e.g. DBT3066 -> DBT 3066)
            if (/^[A-Za-z]{3}\d{4,}$/.test(finalCode)) {
                finalCode = finalCode.replace(/^([A-Za-z]{3})(\d{4,})$/, '$1 $2');
            }

            // For LX Decotiles, drop descriptive text and just use the spaced code as name
            if (category === '데코타일' && brandFolder && brandFolder.includes('LX')) {
                cleanName = finalCode;
            }
            
            // Build ID
            let id = `${brandFolder ? brandFolder.slice(0, 2).toUpperCase() : 'XX'}-${finalCode}`;
            if (category === '데코타일') {
                if (brandFolder.includes('dongshin')) id = `DS-${finalCode}`;
                if (brandFolder.includes('KCC')) id = finalCode;
                if (brandFolder.includes('LX')) id = `LX-${finalCode}`;
                if (brandFolder.toLowerCase().includes('noksu')) id = `NOKSU-${finalCode}`;
            } else if (category === '벽지' && brandFolder.includes('LX')) {
                id = `LXW-${finalCode}`;
            }

            const activeLine = lineFolder || "";
            const computedBrand = extractBrand(brandFolder || "기타", category);

            // Apply rules
            const rules = applyRules(category, computedBrand, activeLine, file.name, cleanName, id, finalCode, brandFolder);

            // Skip if rule tells us to
            if (rules.skip) return;

            // De-dupe check 
            const existingIdx = items.findIndex(i => i.id === id);
            if (existingIdx !== -1) return;
            if (category === '장판' && id.includes('XCF3441')) {
                require('fs').appendFileSync('debug_output.log', JSON.stringify({id, brandFolder, activeLine, rules}) + '\n');
            }

            items.push({
                id: id,
                code: finalCode,
                name: cleanName,
                brand: rules.brand || computedBrand,
                category: category,
                line: activeLine.replace(/_$/, ''),
                price: rules.price,
                thumbnail: getMd5StorageKey(fullPath),
                images: [getMd5StorageKey(fullPath)],
                materialType: rules.materialType || undefined,
                type: rules.type || undefined,
                thickness: rules.thickness || undefined,
                specs: (rules.thickness || rules.sizeLabel || rules.packing || rules.division) ? {
                    division: rules.division,
                    thickness: rules.thickness,
                    size: rules.sizeLabel,
                    packing: rules.packing
                } : undefined
            });
        }
    });

    return items;
}

console.log("Generating fresh materials database from file structure...");

let allMaterials = [];
if (fs.existsSync(MATERIALS_DIR)) {
    const categories = fs.readdirSync(MATERIALS_DIR, { withFileTypes: true })
                         .filter(dirent => dirent.isDirectory())
                         .map(dirent => dirent.name);

    categories.forEach(cat => {
        allMaterials = allMaterials.concat(processDirectory(path.join(MATERIALS_DIR, cat), cat, "", ""));
    });
}

// Optional: Fallbacks for highly specific IDs that might have got parsed weirdly 
// (can be appended if needed)

const uniqueBrands = [...new Set(allMaterials.map(m => m.brand))];
const brandsByCategory = {};
allMaterials.forEach(m => {
    if (!brandsByCategory[m.category]) brandsByCategory[m.category] = new Set();
    brandsByCategory[m.category].add(m.brand);
});
for (let cat in brandsByCategory) {
    brandsByCategory[cat] = [...brandsByCategory[cat]];
}

const fileContent = `// Auto-generated by scripts/build_materials_db.cjs based on folder structure
export const ALL_BRANDS = ${JSON.stringify(uniqueBrands, null, 2)};

export const BRANDS_BY_CATEGORY = ${JSON.stringify(brandsByCategory, null, 2)};

export const materials = ${JSON.stringify(allMaterials, null, 2)};
`;

fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
console.log(`Generated database with ${allMaterials.length} items to ${OUTPUT_FILE}`);
