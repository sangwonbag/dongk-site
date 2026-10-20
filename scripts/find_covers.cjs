const fs = require('fs');
const path = require('path');

function getFirstFile(dir) {
  if (!fs.existsSync(dir)) return null;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item.includes('__MACOSX')) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (!stat.isDirectory() && /\.(jpg|jpeg|png)$/i.test(item)) {
      return full.replace(/\\/g, '/').replace(/^public/, '');
    }
    if (stat.isDirectory()) {
      const sub = getFirstFile(full);
      if (sub) return sub;
    }
  }
  return null;
}

const targets = {
  'lx-hapji': 'public/samplebook-assets/Thumbnail_image/벽지/LX/실크/LX_베스트',
  'lx-silk': 'public/samplebook-assets/Thumbnail_image/벽지/LX/실크/LX_테라피',
  'lx-fire': 'public/samplebook-assets/Thumbnail_image/벽지/LX/디아망/LX_디아망포티스',
  'seoul-hapji': 'public/samplebook-assets/Thumbnail_image/벽지/서울/합지',
  'seoul-silk': 'public/samplebook-assets/Thumbnail_image/벽지/서울/실크',
  'lx-prestige': 'public/samplebook-assets/Thumbnail_image/데코타일/LX',
  'hyundai-jangpan': 'public/images/Thumbnail_Image/materials/장판/현대',
  'dongwha-maru': 'public/images/Thumbnail_Image/materials/마루/동화'
};

for (const [k, v] of Object.entries(targets)) {
  console.log(k, ':', getFirstFile(v));
}
