const fs = require('fs');
const path = require('path');

const publicDir = 'C:\\Users\\psw71\\.gemini\\antigravity\\scratch\\tokyo-flooring\\public';
const testPaths = [
    '/images/Thumbnail_Image/장판/LX하우시스_뉴청맥_1.8T/1. CM24731 내추럴 화이트.jpg',
    '/images/Thumbnail_Image/장판/LX하우시스_은행목_2.0T/1. EH14721 클라우드 크림 (1).jpg'
];

for (const p of testPaths) {
    const abs = path.join(publicDir, p.replace(/\//g, path.sep));
    console.log(`Path: ${p}`);
    console.log(`Absolute: ${abs}`);
    console.log(`Exists: ${fs.existsSync(abs)}`);
    if (!fs.existsSync(abs)) {
        // List directory to see what's there
        const dir = path.dirname(abs);
        if (fs.existsSync(dir)) {
            console.log(`Directory ${dir} exists. Contents:`);
            console.log(fs.readdirSync(dir).slice(0, 5));
        } else {
            console.log(`Directory ${dir} does NOT exist.`);
        }
    }
}
