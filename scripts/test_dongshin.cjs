const fs = require('fs');

const code = fs.readFileSync('src/data/materials.db.js', 'utf8');

// The new files start with AB or AH
const testCodes = ['AB6711', 'AH505', 'AB6741'];

const startDongshin = code.indexOf('LIST_DONGSHIN');
if (startDongshin !== -1) {
    console.log('Found LIST_DONGSHIN');
} else {
    console.log('LIST_DONGSHIN not found');
}

testCodes.forEach(tc => {
    if (code.includes(tc)) {
        console.log(`Code ${tc} FOUND in DB`);
    } else {
        console.log(`Code ${tc} MISSING in DB`);
    }
});
