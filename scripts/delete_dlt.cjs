const fs = require('fs');
const glob = require('glob');

const paths = [
    'public/images/Thumbnail_Image/materials/**/*DLT 3304*.jpg',
    'public/images/Thumbnail_Image/materials/**/*DLT 3305*.jpg',
    'public/images/Thumbnail_Image/materials/**/*DLT 3304*.png',
    'public/images/Thumbnail_Image/materials/**/*DLT 3305*.png'
];

paths.forEach(p => {
    require('glob').glob(p, (err, files) => {
        if(files) {
            files.forEach(f => {
                console.log("Deleting", f);
                fs.unlinkSync(f);
            });
        }
    });
});
