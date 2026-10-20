const fs = require('fs');
const path = require('path');

const dbPath = path.resolve('src/data/samplebooks.db.js');
let content = fs.readFileSync(dbPath, 'utf8');

const jsonStr = content.replace(/^export const sampleBooks =\s*/, '').replace(/;\s*$/, '');
let sampleBooks = eval(jsonStr);

const covers = {
  'lx-hapji': '/samplebook-assets/Thumbnail_image/벽지/LX/실크/LX_베스트/8190-01.jpg',
  'lx-silk': '/samplebook-assets/Thumbnail_image/벽지/LX/실크/LX_테라피/7043-01.jpg',
  'lx-fire': '/samplebook-assets/Thumbnail_image/벽지/LX/디아망/LX_디아망포티스/DF001-01.jpg',
  'seoul-hapji': '/samplebook-assets/Thumbnail_image/벽지/서울/합지/100-1.jpg',
  'seoul-silk': '/samplebook-assets/Thumbnail_image/벽지/서울/실크/1000-1.jpg',
  'lx-prestige-2025': '/samplebook-assets/Thumbnail_image/데코타일/LX/2025 보타닉/cover.png',
  'lx-eq-floor-2025': '/samplebook-assets/Thumbnail_image/장판/LX/LX장판_5.0T/LX장판_5.0T.png',
  'lx-rexcourt-2025': '/samplebook-assets/Thumbnail_image/장판/LX/LX장판_2.7T_3.2T/LX장판_2.7T_3.2T.png',
  'kujung-prestige-brush-gold': '/images/Thumbnail_Image/materials/마루/구정/원목마루/노블레스/리얼 블랙 오크.png',
  'igun-total-catalog': '/images/Thumbnail_Image/materials/마루/이건/강마루/세라/세라 플렉스S/세라 플렉스 143/데일리 오크.jpg',
  'dongwha-maru-texture': '/images/Thumbnail_Image/materials/마루/동화/강마루/듀오텍스쳐/DUO TEXTURE/까사 내추럴.png',
  'hyundai-chamdaum-2025': '/images/Thumbnail_Image/materials/장판/현대/더채움2.2/M3204_thumbnail.jpg',
  'hyundai-sorijium-2025': '/images/Thumbnail_Image/materials/장판/현대/소리지움5.0/M6501_thumbnail.jpg',
  'hyundai-thechaeum-2025': '/images/Thumbnail_Image/materials/장판/현대/더채움2.2/M3204_thumbnail.jpg',
  'hyundai-artium-2023': '/images/Thumbnail_Image/materials/장판/현대/아티움2.7/M4701_thumbnail.jpg'
};

sampleBooks = sampleBooks.map(item => {
  if (covers[item.id]) {
    return { ...item, cover: covers[item.id] };
  }
  return item;
});

const updatedContent = `export const sampleBooks = ${JSON.stringify(sampleBooks, null, 4)};\n`;
fs.writeFileSync(dbPath, updatedContent, 'utf8');

console.log('Successfully fixed all covers in samplebooks.db.js!');
