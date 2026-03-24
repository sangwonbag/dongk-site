const path = require('path');
function normalize(str) { return str ? str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : ""; }

const nCode = normalize("AB_6711"); // AB6711
const f = "AB6711_1.jpg";

const nameWithoutExt = path.parse(path.basename(f)).name;
const matchName = nameWithoutExt.replace(/_\d+$/, ''); // strips _1
const nFile = normalize(matchName); // AB6711

console.log('nfile:', nFile);

if (nFile.includes(nCode) || nCode.includes(nFile)) {
    if (/[0-9]/.test(nCode[nCode.length - 1])) {
        const idx = nFile.indexOf(nCode);
        if (idx !== -1) {
            const charAfter = nFile[idx + nCode.length];
            if (charAfter && /[0-9]/.test(charAfter)) console.log('false');
            else console.log('true');
        } else console.log('true');
    } else console.log('true');
} else console.log('false');
