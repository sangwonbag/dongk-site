const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createCatalogPdf(outputPath, title, imagePaths, maxPages = 40) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const doc = await PDFDocument.create();
  const selectedImages = imagePaths.slice(0, maxPages);

  let embeddedCount = 0;
  for (let i = 0; i < selectedImages.length; i++) {
    const imgPath = selectedImages[i];
    try {
      if (!fs.existsSync(imgPath)) continue;
      const bytes = fs.readFileSync(imgPath);
      let img;
      if (imgPath.toLowerCase().endsWith('.png')) {
        img = await doc.embedPng(bytes);
      } else {
        img = await doc.embedJpg(bytes);
      }

      // Page size A4 (595.28 x 841.89)
      const page = doc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      const maxW = width - 80;
      const maxH = height - 120;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const imgW = img.width * scale;
      const imgH = img.height * scale;
      const x = (width - imgW) / 2;
      const y = (height - imgH) / 2 - 10;

      page.drawImage(img, { x, y, width: imgW, height: imgH });
      embeddedCount++;
    } catch (e) {
      console.warn('Failed to embed:', imgPath, e.message);
    }
  }

  if (embeddedCount === 0) {
    doc.addPage([595.28, 841.89]);
  }

  const pdfBytes = await doc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`[PDF Created] ${outputPath} | Pages: ${embeddedCount} | Size: ${Math.round(pdfBytes.length / 1024)} KB`);
}

function getImgs(dir) {
  if (!fs.existsSync(dir)) return [];
  let r = [];
  const items = fs.readdirSync(dir);
  for (const f of items) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      r = r.concat(getImgs(full));
    } else if (/\.(jpg|jpeg|png)$/i.test(f) && !f.includes('__MACOSX')) {
      r.push(full);
    }
  }
  return r;
}

async function main() {
  console.log('Generating wallpaper PDF catalogs...');

  // 1. 신한 방염
  await createCatalogPdf(
    'public/samplebook-assets/벽지/신한/방염/신한벽지_방염.pdf',
    '신한 방염 벽지',
    getImgs('public/samplebook-assets/Thumbnail_image/벽지/신한/방염/신한벽지_방염'),
    40
  );

  // 2. 신한 합지 (아이리스 + 파인하임)
  await createCatalogPdf(
    'public/samplebook-assets/벽지/신한/합지/신한벽지_합지.pdf',
    '신한 합지 벽지 (아이리스/파인하임)',
    getImgs('public/samplebook-assets/Thumbnail_image/벽지/신한/합지'),
    40
  );

  // 3. 신한 실크 4종 (리빙, 스케치, 월가드, 파사드)
  const silkBase = 'public/images/Thumbnail_Image/materials/벽지/신한/실크';
  await createCatalogPdf(
    'public/samplebook-assets/벽지/신한/실크/신한벽지_리빙.pdf',
    '신한 실크 벽지 - 리빙',
    [
      'public/samplebook-assets/Thumbnail_image/벽지/신한/실크/신한벽지_리빙(LIVING)/신한벽지리빙.png',
      ...getImgs(path.join(silkBase, '신한벽지_리빙(LIVING)'))
    ],
    35
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/신한/실크/신한벽지_스케치.pdf',
    '신한 실크 벽지 - 스케치',
    [
      'public/samplebook-assets/Thumbnail_image/벽지/신한/실크/신한벽지_스케치(SKETCH)/신한벽지스케치.png',
      ...getImgs(path.join(silkBase, '신한벽지_스케치(SKETCH)'))
    ],
    35
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/신한/실크/신한벽지_월가드.pdf',
    '신한 실크 벽지 - 월가드',
    [
      'public/samplebook-assets/Thumbnail_image/벽지/신한/실크/신한벽지_월가드(WALLGUARD)/신한벽지월가드 썸네일.png',
      ...getImgs(path.join(silkBase, '신한벽지_월가드(WALLGUARD)'))
    ],
    35
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/신한/실크/신한벽지_파사드.pdf',
    '신한 실크 벽지 - 파사드',
    [
      'public/samplebook-assets/Thumbnail_image/벽지/신한/실크/신한벽지_파사드(FACADE)/신한벽지파사드.png',
      ...getImgs(path.join(silkBase, '신한벽지_파사드(FACADE)'))
    ],
    35
  );

  // 4. LX 벽지 (합지, 실크, 방염, 디아망)
  await createCatalogPdf(
    'public/samplebook-assets/벽지/LX/실크/LX_실크벽지(베스트_테라피).pdf',
    'LX 실크 벽지',
    [
      ...getImgs('public/samplebook-assets/Thumbnail_image/벽지/LX/실크/LX_베스트'),
      ...getImgs('public/samplebook-assets/Thumbnail_image/벽지/LX/실크/LX_테라피')
    ],
    40
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/LX/디아망/LX_디아망.pdf',
    'LX 디아망 프리미엄 벽지',
    [
      ...getImgs('public/samplebook-assets/Thumbnail_image/벽지/LX/디아망/LX_디아망'),
      ...getImgs('public/samplebook-assets/Thumbnail_image/벽지/LX/디아망/LX_디아망포티스')
    ],
    40
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/LX/합지/LX_합지벽지.pdf',
    'LX 합지 벽지',
    getImgs('public/samplebook-assets/Thumbnail_image/벽지/LX/실크/LX_베스트'),
    35
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/LX/방염/LX_방염벽지.pdf',
    'LX 방염 벽지',
    getImgs('public/samplebook-assets/Thumbnail_image/벽지/LX/디아망/LX_디아망포티스'),
    35
  );

  // 5. 서울 벽지 (합지, 실크, 방염, 프리미엄)
  await createCatalogPdf(
    'public/samplebook-assets/벽지/서울/합지/서울_합지벽지.pdf',
    '서울 합지 벽지',
    getImgs('public/samplebook-assets/Thumbnail_image/벽지/서울/합지'),
    40
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/서울/실크/서울_실크벽지.pdf',
    '서울 실크 벽지',
    getImgs('public/samplebook-assets/Thumbnail_image/벽지/서울/실크'),
    40
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/서울/방염/서울_방염벽지.pdf',
    '서울 방염 벽지',
    getImgs('public/samplebook-assets/Thumbnail_image/벽지/서울/방염'),
    40
  );

  // 6. 디아이디 벽지 (방염, 실크, 합지)
  const didBase = 'public/images/Thumbnail_Image/materials/벽지/디아이디';
  await createCatalogPdf(
    'public/samplebook-assets/벽지/디아이디/방염/디아이디_방염벽지.pdf',
    '디아이디 방염 벽지',
    getImgs(path.join(didBase, '방염')),
    35
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/디아이디/실크/디아이디_실크벽지.pdf',
    '디아이디 실크 벽지',
    getImgs(path.join(didBase, '실크')),
    35
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/디아이디/합지/디아이디_합지벽지.pdf',
    '디아이디 합지 벽지',
    getImgs(path.join(didBase, '합지')),
    35
  );

  // 7. 제일 벽지 (합지, 실크, 방염)
  const jeilImages = getImgs('public/samplebook-assets/Thumbnail_image/벽지/개나리');
  await createCatalogPdf(
    'public/samplebook-assets/벽지/제일/합지/제일_합지벽지.pdf',
    '제일 합지 벽지',
    jeilImages,
    20
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/제일/실크/제일_실크벽지.pdf',
    '제일 실크 벽지',
    jeilImages,
    20
  );
  await createCatalogPdf(
    'public/samplebook-assets/벽지/제일/방염/제일_방염벽지.pdf',
    '제일 방염 벽지',
    jeilImages,
    20
  );

  console.log('All wallpaper PDF catalogs generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
