import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('src/data/samplebooks.db.js');
const content = fs.readFileSync(dbPath, 'utf8');

const jsonStr = content.replace(/^export const sampleBooks =\s*/, '').replace(/;\s*$/, '');
const sampleBooks = eval(jsonStr);

console.log('Original count:', sampleBooks.length);

// Verified official catalog mappings
const officialCatalogs = {
  // === LX (19) ===
  'lx-new-chungmac-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/newchungmac/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-xcomfort-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/xcomfort/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-unhaengmok-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/eunhaengmok/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-jiasarang-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/zeasarangae/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-jiasorijam-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/zeasorijam/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-jiajayeonae-2026': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/zeajayeonae/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-botanic-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/botanic/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-editon-stone-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/editonestone/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-econoplus-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/econoplus/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-prestige-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/prestg/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-house-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/house/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-housestyle-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/housestyle/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-eq-floor-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/eqfloor/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-oa-tile-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/OAtile/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-rexcourt-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/rexcourt/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-hapji': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/therapy/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-silk': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/bestie/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-fire': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/diamantfortis/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'lx-diamant-2025': {
    catalogUrl: 'https://www.b2bzincatalog.com/digital/samplebook/diamant/',
    catalogType: 'external_viewer',
    catalogProvider: 'LX하우시스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === KCC (5) ===
  'kcc-senstyle-trendy-2025': {
    catalogUrl: 'https://www.homecc.com/catalog/lvt/sensetiletrendy/hcc.do?/tjqvi/afmy',
    catalogType: 'external_viewer',
    catalogProvider: 'KCC글라스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kcc-senstyle-pro-2025': {
    catalogUrl: 'https://www.homecc.com/catalog/lvt/sensetilepro/hcc.do?/tjqvi/bmir',
    catalogType: 'external_viewer',
    catalogProvider: 'KCC글라스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kcc-dodam-2026': {
    catalogUrl: 'https://www.homecc.com/catalog/sheet/sup_dodam/hcc.do?/tjqvi/fesu',
    catalogType: 'external_viewer',
    catalogProvider: 'KCC글라스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kcc-hyugaon-2025': {
    catalogUrl: 'https://www.homecc.com/catalog/sheet/sup_hyugaon/hcc.do?/tjqvi/cfxl',
    catalogType: 'external_viewer',
    catalogProvider: 'KCC글라스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kcc-rubber-tile-catalog': {
    catalogUrl: 'https://www.homecc.com/catalog/etc/rubbertile/hcc.do?/tjqvi/vixc',
    catalogType: 'external_viewer',
    catalogProvider: 'KCC글라스',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 현대L&C (11) ===
  'hyundai-goldtile-classic': {
    catalogUrl: 'https://www.hyundailnc.com/product/contents?mng_cd=18B5D8EF',
    catalogType: 'official_page',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'hyundai-goldtile-master': {
    catalogUrl: 'https://www.hyundailnc.com/product/contents?mng_cd=D58B15D4',
    catalogType: 'official_page',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'hyundai-deluxetile': {
    catalogUrl: 'https://www.hyundailnc.com/product/contents?mng_cd=CE8C1780',
    catalogType: 'official_page',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'hyundai-goldtile-relic': {
    catalogUrl: 'https://www.hyundailnc.com/product/contents?mng_cd=1411D801',
    catalogType: 'official_page',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'hyundai-nobletile': {
    catalogUrl: 'https://www.hyundailnc.com/product/contents?mng_cd=80F7A45B',
    catalogType: 'official_page',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'hyundai-carpet-tile': {
    catalogUrl: 'https://www.hyundailnc.com/product/contents?mng_cd=6B25807C',
    catalogType: 'official_page',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'hyundai-chamdaum-2025': {
    catalogUrl: 'https://www.hyundailnc.com/product/contents?mng_cd=AAF85B3B',
    catalogType: 'official_page',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'hyundai-sorijium-2025': {
    catalogUrl: 'https://heyzine.com/flip-book/c20e79f796.html',
    catalogType: 'external_viewer',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'hyundai-thechaeum-2025': {
    catalogUrl: 'https://www.hyundailnc.com/product/contents?mng_cd=8262A23A',
    catalogType: 'official_page',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'hyundai-artium-2023': {
    catalogUrl: 'https://www.hyundailnc.com/product/contents?mng_cd=DA98D9D5',
    catalogType: 'official_page',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'hyundai-conductive-tile': {
    catalogUrl: 'https://www.hyundailnc.com/product/contents?mng_cd=CC9C5475',
    catalogType: 'official_page',
    catalogProvider: '현대L&C',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 개나리벽지 (6) ===
  'gaenari-primo': {
    catalogUrl: 'https://www.gniwallpaper.com/product/index.php?ctg_code=primo&code=10&br_code=br_8',
    catalogType: 'official_page',
    catalogProvider: '개나리벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'gaenari-lohas': {
    catalogUrl: 'https://www.gniwallpaper.com/product/index.php?ctg_code=lohas&code=10&br_code=br_1',
    catalogType: 'official_page',
    catalogProvider: '개나리벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'gaenari-artbook': {
    catalogUrl: 'https://www.gniwallpaper.com/product/index.php?ctg_code=artbook&code=10&br_code=br_3',
    catalogType: 'official_page',
    catalogProvider: '개나리벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'gaenari-story': {
    catalogUrl: 'https://www.gniwallpaper.com/product/index.php?ctg_code=story&code=11&br_code=br_7',
    catalogType: 'official_page',
    catalogProvider: '개나리벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'gaenari-trendy': {
    catalogUrl: 'https://www.gniwallpaper.com/product/index.php?ctg_code=trendy&code=11&br_code=br_5',
    catalogType: 'official_page',
    catalogProvider: '개나리벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'gaenari-fire': {
    catalogUrl: 'https://www.gniwallpaper.com/product/index.php?ctg_code=fireproof&code=13',
    catalogType: 'official_page',
    catalogProvider: '개나리벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 신한벽지 (6) ===
  'shinhan-hapji-total': {
    catalogUrl: 'https://www.shinhanwall.co.kr/brands/view.html?depth1=2&depth2=8',
    catalogType: 'official_page',
    catalogProvider: '신한벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'shinhan-silk-living': {
    catalogUrl: 'https://www.shinhanwall.co.kr/brands/view.html?depth1=1&depth2=4',
    catalogType: 'official_page',
    catalogProvider: '신한벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'shinhan-silk-sketch': {
    catalogUrl: 'https://www.shinhanwall.co.kr/brands/view.html?depth1=1&depth2=5',
    catalogType: 'official_page',
    catalogProvider: '신한벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'shinhan-silk-wallguard': {
    catalogUrl: 'https://www.shinhanwall.co.kr/brands/view.html?depth1=1&depth2=61',
    catalogType: 'official_page',
    catalogProvider: '신한벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'shinhan-silk-facade': {
    catalogUrl: 'https://www.shinhanwall.co.kr/brands/view.html?depth1=1&depth2=59',
    catalogType: 'official_page',
    catalogProvider: '신한벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'shinhan-fire-2025': {
    catalogUrl: 'https://www.shinhanwall.co.kr/brands/view.html?depth1=3&depth2=10',
    catalogType: 'official_page',
    catalogProvider: '신한벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 서울벽지 (3) ===
  'seoul-hapji': {
    catalogUrl: 'https://www.seoulwallpaper.co.kr/collection/collection.php?search_category=7',
    catalogType: 'official_page',
    catalogProvider: '서울벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'seoul-silk': {
    catalogUrl: 'https://www.seoulwallpaper.co.kr/collection/collection.php?search_category=1',
    catalogType: 'official_page',
    catalogProvider: '서울벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'seoul-fire': {
    catalogUrl: 'https://www.seoulwallpaper.co.kr/collection/collection.php?search_category=6',
    catalogType: 'official_page',
    catalogProvider: '서울벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 제일벽지 (3) ===
  'jeil-hapji': {
    catalogUrl: 'https://www.jeilwallpaper.com/kor/%EC%A0%9C%ED%92%88%EC%86%8C%EA%B0%9C/%ED%95%A9%EC%A7%80-%EB%B8%8C%EB%9E%9C%EB%93%9C',
    catalogType: 'official_page',
    catalogProvider: '제일벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'jeil-silk': {
    catalogUrl: 'https://www.jeilwallpaper.com/kor/%EC%A0%9C%ED%92%88%EC%86%8C%EA%B0%9C/%EC%8B%A4%ED%81%AC-%EB%B8%8C%EB%9E%9C%EB%93%9C',
    catalogType: 'official_page',
    catalogProvider: '제일벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'jeil-fire': {
    catalogUrl: 'https://www.jeilwallpaper.com/kor/%EC%A0%9C%ED%92%88%EC%86%8C%EA%B0%9C/%EC%8B%A4%ED%81%AC-%EB%B8%8C%EB%9E%9C%EB%93%9C',
    catalogType: 'official_page',
    catalogProvider: '제일벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 동화자연마루 (4) ===
  'dongwha-maru-duo': {
    catalogUrl: 'https://www.greendongwha.com/product/brand/duo/',
    catalogType: 'official_page',
    catalogProvider: '동화자연마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'dongwha-maru-jin-teramax': {
    catalogUrl: 'https://www.greendongwha.com/product/brand/jin/',
    catalogType: 'official_page',
    catalogProvider: '동화자연마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'dongwha-maru-texture': {
    catalogUrl: 'https://www.greendongwha.com/product/brand/duo/',
    catalogType: 'official_page',
    catalogProvider: '동화자연마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'dongwha-maru-baum': {
    catalogUrl: 'https://www.greendongwha.com/product/brand/baum/',
    catalogType: 'official_page',
    catalogProvider: '동화자연마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 이건마루 (9) ===
  'igun-grin-105': {
    catalogUrl: 'https://catalog.eagon.com',
    catalogType: 'external_viewer',
    catalogProvider: '이건마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'igun-sera-basic-62': {
    catalogUrl: 'https://catalog.eagon.com',
    catalogType: 'external_viewer',
    catalogProvider: '이건마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'igun-sera-75': {
    catalogUrl: 'https://catalog.eagon.com',
    catalogType: 'external_viewer',
    catalogProvider: '이건마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'igun-sera-flax-143': {
    catalogUrl: 'https://catalog.eagon.com',
    catalogType: 'external_viewer',
    catalogProvider: '이건마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'igun-foresta-g': {
    catalogUrl: 'https://catalog.eagon.com',
    catalogType: 'external_viewer',
    catalogProvider: '이건마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'igun-foresta': {
    catalogUrl: 'https://catalog.eagon.com',
    catalogType: 'external_viewer',
    catalogProvider: '이건마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'igun-gena-natural': {
    catalogUrl: 'https://catalog.eagon.com',
    catalogType: 'external_viewer',
    catalogProvider: '이건마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'igun-largo': {
    catalogUrl: 'https://catalog.eagon.com',
    catalogType: 'external_viewer',
    catalogProvider: '이건마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'igun-total-catalog': {
    catalogUrl: 'https://catalog.eagon.com',
    catalogType: 'external_viewer',
    catalogProvider: '이건마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 구정마루 (14) ===
  'kujung-modern-kang': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-kang-maru': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-marbulous-deux': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-marbulous-live': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-marbulous-muse': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-marbulous-l': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-marbulous-zen': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-blonte': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-grand-texture-165': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-premium-texture': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-noblesse': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-piante': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-heritage': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'kujung-prestige-brush-gold': {
    catalogUrl: 'https://www.kujungmaru.com/product/catalogue/catalogue?type=%EC%83%98%ED%94%8C%EB%B6%81',
    catalogType: 'external_viewer',
    catalogProvider: '구정마루',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 디아이디벽지 (3) ===
  'did-hapji': {
    catalogUrl: 'https://www.didwallpaper.com/collection',
    catalogType: 'official_page',
    catalogProvider: '디아이디벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'did-silk': {
    catalogUrl: 'https://www.didwallpaper.com/collection',
    catalogType: 'official_page',
    catalogProvider: '디아이디벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },
  'did-fire': {
    catalogUrl: 'https://www.didwallpaper.com/collection',
    catalogType: 'official_page',
    catalogProvider: '디아이디벽지',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 동신포리마 (1) ===
  'dongshin-polyma-samplebook': {
    catalogUrl: 'http://www.dsarttile.co.kr/kr/sub/customer/download.php',
    catalogType: 'official_page',
    catalogProvider: '동신포리마',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 재영 (1) ===
  'jaeyoung-decotile-2025': {
    catalogUrl: 'http://www.jflor.co.kr/customer/download.php',
    catalogType: 'official_page',
    catalogProvider: '재영',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 스완카페트 (1) ===
  'swan-carpet-tile': {
    catalogUrl: 'http://www.swancarpet.co.kr/kr/carpet/tile_carpet_introduce.do',
    catalogType: 'official_page',
    catalogProvider: '스완카페트',
    catalogStatus: 'verified',
    verifiedAt: '2026-10-12'
  },

  // === 녹수 (3) - 미확인 ===
  'noxo-ecohome-2000': {
    catalogUrl: null,
    catalogType: 'none',
    catalogProvider: '녹수(NOX)',
    catalogStatus: 'unverified',
    verifiedAt: '2026-10-12',
    unverifiedReason: '제조사 공식 온라인 E-카탈로그 뷰어 미확인'
  },
  'noxo-orchid-3000': {
    catalogUrl: null,
    catalogType: 'none',
    catalogProvider: '녹수(NOX)',
    catalogStatus: 'unverified',
    verifiedAt: '2026-10-12',
    unverifiedReason: '제조사 공식 온라인 E-카탈로그 뷰어 미확인'
  },
  'noxo-prime-1500': {
    catalogUrl: null,
    catalogType: 'none',
    catalogProvider: '녹수(NOX)',
    catalogStatus: 'unverified',
    verifiedAt: '2026-10-12',
    unverifiedReason: '제조사 공식 온라인 E-카탈로그 뷰어 미확인'
  },

  // === 유성 (3) - 미확인 ===
  'yuseong-fineo-deluxe': {
    catalogUrl: null,
    catalogType: 'none',
    catalogProvider: '유성씨앤에프',
    catalogStatus: 'unverified',
    verifiedAt: '2026-10-12',
    unverifiedReason: '제조사 공식 온라인 E-카탈로그 뷰어 미확인'
  },
  'yuseong-fineo-unique': {
    catalogUrl: null,
    catalogType: 'none',
    catalogProvider: '유성씨앤에프',
    catalogStatus: 'unverified',
    verifiedAt: '2026-10-12',
    unverifiedReason: '제조사 공식 온라인 E-카탈로그 뷰어 미확인'
  },
  'yuseong-pione-modern2': {
    catalogUrl: null,
    catalogType: 'none',
    catalogProvider: '유성씨앤에프',
    catalogStatus: 'unverified',
    verifiedAt: '2026-10-12',
    unverifiedReason: '제조사 공식 온라인 E-카탈로그 뷰어 미확인'
  }
};

let verifiedCount = 0;
let unverifiedCount = 0;

const updatedSampleBooks = sampleBooks.map(item => {
  const meta = officialCatalogs[item.id] || {
    catalogUrl: null,
    catalogType: 'none',
    catalogProvider: item.brand,
    catalogStatus: 'unverified',
    verifiedAt: '2026-10-12',
    unverifiedReason: '공식 링크 미확인'
  };

  if (meta.catalogStatus === 'verified') {
    verifiedCount++;
  } else {
    unverifiedCount++;
  }

  return {
    ...item,
    catalogUrl: meta.catalogUrl,
    catalogType: meta.catalogType,
    catalogProvider: meta.catalogProvider,
    catalogStatus: meta.catalogStatus,
    verifiedAt: meta.verifiedAt,
    unverifiedReason: meta.unverifiedReason || null
  };
});

console.log(`Verified count: ${verifiedCount}`);
console.log(`Unverified count: ${unverifiedCount}`);

const outputCode = `export const sampleBooks = ${JSON.stringify(updatedSampleBooks, null, 4)};\n`;
fs.writeFileSync(dbPath, outputCode, 'utf8');

console.log('Successfully updated samplebooks.db.js with official catalog metadata!');
