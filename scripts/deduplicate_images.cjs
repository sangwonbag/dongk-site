const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TARGET_DIR = path.resolve(__dirname, '../public/images/Thumbnail_Image');

function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(filePath));
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
            results.push(filePath);
        }
    });
    return results;
}

function getFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

console.log(`Scanning ${TARGET_DIR} for duplicates...`);
try {
    const allFiles = getFiles(TARGET_DIR);
    console.log(`Found ${allFiles.length} images.`);

    const groups = {}; // { hash: [path, path, ...] }

    allFiles.forEach(file => {
        const hash = getFileHash(file);
        if (!groups[hash]) {
            groups[hash] = [];
        }
        groups[hash].push(file);
    });

    let deletedCount = 0;

    Object.values(groups).forEach(paths => {
        if (paths.length > 1) {
            // We have duplicates.
            // Keep the one with the shortest name or the one that matches the "pure" CODE_N.jpg pattern better.
            paths.sort((a, b) => {
                const nameA = path.basename(a);
                const nameB = path.basename(b);
                
                // Prefer shorter names (usually simpler codes)
                if (nameA.length !== nameB.length) return nameA.length - nameB.length;
                return nameA.localeCompare(nameB);
            });

            const original = paths[0];
            const duplicates = paths.slice(1);

            duplicates.forEach(dup => {
                console.log(`Deleting duplicate: ${path.basename(dup)} (Same as ${path.basename(original)})`);
                fs.unlinkSync(dup);
                deletedCount++;
            });
        }
    });

    console.log(`Done. Deleted ${deletedCount} duplicate files.`);
} catch (err) {
    console.error("Critical Failure:", err);
    process.exit(1);
}
