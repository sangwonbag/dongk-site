export const CATEGORY_BRAND_MAP = {
    '데코타일': ['KCC', 'LX', '동신', '녹수', '현대', '유성', '재영', '대진'],
    '장판': ['KCC', 'LX', '현대'],
    '마루': ['동화', '이건마루', '구정'],
    '벽지': ['LX', '개나리', '신한', '서울', '제일', '디아이디'],
    '카페트타일': ['스완', '아반', '코오롱'],
    '러버타일': ['KCC', '현대']
};

export const BRANDS_BY_CATEGORY = CATEGORY_BRAND_MAP;

export const ALL_BRANDS = [
  'KCC', 'LX', '동신', '동화', '이건', '구정', '우성', '녹수', '현대', '스완', '유성', '재영', '대진', '이건마루', '개나리', '신한', '서울', '제일', '디아이디', '코오롱'
];

export const BRAND_TREE = Object.entries(CATEGORY_BRAND_MAP).map(([category, brands]) => ({
  category,
  brands: brands.map(b => ({ name: b, count: 0 }))
}));

// Maps internal English category keys to Korean display keys if needed
export const CATEGORY_LABEL_MAP = {
    "Deco Tile": "데코타일",
    "Jangpan": "장판",
    "Maru": "마루",
    "Wallpaper": "벽지",
    "Carpet Tile": "카페트타일",
    "Sub Materials": "부자재"
};

