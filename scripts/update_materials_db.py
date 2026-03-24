import os
import re

materials_db_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'
silk_data_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\scripts\shinhan_silk_data.js'

with open(silk_data_path, 'r', encoding='utf-8') as f:
    silk_data = f.read()

# Remove 'export' from the silk data if we are pasting it as local consts
silk_data = silk_data.replace('export const ', 'const ')

with open(materials_db_path, 'r', encoding='utf-8') as f:
    db_content = f.read()

other_collections = """
const LIST_SHINHAN_IRIS_FILES = [
    "6875-1 하림.jpg", "6875-2 하림.jpg", "6876-1 아띠오이.jpg", "6877-1 뤼느아.jpg", "6878-1 시티뷰.jpg",
    "6879-1 동양화.jpg", "6880-1 펠톤.jpg", "6880-2 펠톤.jpg", "6880-3 펠톤.jpg", "6881-1 미스티.jpg",
    "6882-1 클래식.jpg", "6882-2 클래식.jpg", "6882-3 클래식.jpg", "6883-1 포스터.jpg", "6883-2 포스터.jpg",
    "6884-1 샤넬.jpg", "6884-2 샤넬.jpg", "6884-3 샤넬.jpg", "6884-4 샤넬.jpg", "6884-5 샤넬.jpg",
    "6885-1 데즐.jpg", "6885-2 데즐.jpg", "6885-3 데즐.jpg", "6885-4 데즐.jpg", "6885-5 데즐.jpg",
    "6886-1 체이서.jpg", "6886-2 체이서.jpg", "6886-3 체이서.jpg", "6886-4 체이서.jpg", "6887-1 에너가.jpg",
    "6887-10 에너가.jpg", "6887-2 에너가.jpg", "6887-3 에너가.jpg", "6887-4 에너가.jpg", "6887-5 에너가.jpg",
    "6887-6 에너가.jpg", "6887-7 에너가.jpg", "6887-8 에너가.jpg", "6887-9 에너가.jpg", "6888-1 퍼블릭.jpg",
    "6888-2 퍼블릭.jpg", "6888-3 퍼블릭.jpg", "6888-4 퍼블릭.jpg", "6888-5 퍼블릭.jpg", "6888-6 퍼블릭.jpg",
    "6889-1 파티오.jpg", "6889-2 파티오.jpg", "6889-3 파티오.jpg", "6889-4 파티오.jpg", "6889-5 파티오.jpg",
    "6889-6 파티오.jpg", "6890-1 우드.jpg", "6890-2 우드.jpg", "6890-3 우드.jpg", "6890-4 우드.jpg",
    "6890-5 우드.jpg", "6890-6 우드.jpg", "6891-1 프리즈.jpg", "6891-2 프리즈.jpg", "6891-3 프리즈.jpg",
    "6891-4 프리즈.jpg", "6891-5 프리즈.jpg", "6892-1 코르바.jpg", "6892-2 코르바.jpg", "6892-3 코르바.jpg",
    "6892-4 코르바.jpg", "6892-5 코르바.jpg", "6892-6 코르바.jpg", "6892-7 코르바.jpg"
];
const LIST_SHINHAN_IRIS = LIST_SHINHAN_IRIS_FILES.map(file => ({
    id: 'SH-' + file.split('.')[0],
    brand: "신한",
    category: "벽지",
    materialType: "합지",
    collection: "아이리스",
    code: file.split('.')[0],
    name: "아이리스 " + file.split('.')[0],
    price: 0,
    image: "/images/products/신한벽지_아이리스(IRIS)/" + file,
    thumbnail: "/images/products/신한벽지_아이리스(IRIS)/" + file,
    cover: "/images/products/신한벽지_아이리스(IRIS)/" + file
}));

const LIST_SHINHAN_PINEHEIM_FILES = [
    "4244-1 데치데치.jpg", "4249-1 에코베이지.jpg", "4278-1 코코넛스.jpg", "4295-1 루비안.jpg", "4298-1 포레.jpg",
    "4298-2 포레.jpg", "4298-4 포레.jpg", "4298-5 포레.jpg", "4299-1 파우더.jpg", "4299-2 파우더.jpg",
    "4303-1 캔버스.jpg", "4305-1 스테미.jpg", "4305-2 스테미.jpg", "4305-3 스테미.jpg", "4306-2 샤링스.jpg",
    "4309-2 베르가.jpg", "4310-1 파트.jpg", "4310-2 파트.jpg", "4314-1 루카스.jpg", "4314-2 루카스.jpg",
    "4315-1 캠퍼스.jpg", "4315-2 캠퍼스.jpg", "4315-3 캠퍼스.jpg", "4316-1 코우스.jpg", "4316-2 코우스.jpg",
    "4316-3 코우스.jpg", "4317-1 메이프.jpg", "4317-2 메이프.jpg", "4317-3 메이프.jpg", "4317-4 메이프.jpg"
];
const LIST_SHINHAN_PINEHEIM = LIST_SHINHAN_PINEHEIM_FILES.map(file => ({
    id: 'SH-' + file.split('.')[0],
    brand: "신한",
    category: "벽지",
    materialType: "합지",
    collection: "파인하임",
    code: file.split('.')[0],
    name: "파인하임 " + file.split('.')[0],
    price: 0,
    image: "/images/products/신한벽지_파인하임/" + file,
    thumbnail: "/images/products/신한벽지_파인하임/" + file,
    cover: "/images/products/신한벽지_파인하임/" + file
}));

const LIST_SHINHAN_FIRE_RETARDANT_FILES = [
    "F15053-1 조용한수색.jpg", "F15053-2 조용한수색.jpg", "F15087-5 봄날의매.jpg", "F15087-7 봄날의매.jpg", "F15094-2 서울의풍경.jpg",
    "F15094-3 서울의풍경.jpg", "F15094-4 서울의풍경.jpg", "F15099-1 신비로운새벽.jpg", "F15099-2 신비로운새벽.jpg", "F15099-3 신비로운새벽.jpg",
    "F15099-4 신비로운새벽.jpg", "F15099-8 신비로운새벽.jpg", "F15099-9 신비로운새벽.jpg", "F15102-1 소소한기다림.jpg", "F15102-3 소소한기다림.jpg",
    "F15102-4 소소한기다림.jpg", "F15102-6 소소한기다림.jpg", "F15102-7 소소한기다림.jpg", "F15102-8 소소한기다림.jpg", "F15103-1 비밀이야기.jpg",
    "F15103-2 비밀이야기.jpg", "F15103-3 비밀이야기.jpg", "F15103-4 비밀이야기.jpg", "F15105-1 그날의약속.jpg", "F15105-2 그날의약속.jpg",
    "F15105-3 그날의약속.jpg", "F15105-4 그날의약속.jpg", "F70180-3 노출콘크리트.jpg", "F70199-2 에스톤.jpg", "F70199-3 에스톤.jpg",
    "F70213-10 프레임.jpg", "F70220-1 뷰글라스.jpg", "F70220-2 뷰글라스.jpg", "F70220-4 뷰글라스.jpg", "F70226-1 브람스.jpg",
    "F70226-2 브람스.jpg", "F70227-1 결.jpg", "F70231-1 바흐.jpg", "F70231-2 바흐.jpg", "F70231-3 바흐.jpg",
    "F70249-1 에디터.jpg", "F70249-2 에디터.jpg", "F70249-3 에디터.jpg", "F70249-4 에디터.jpg", "F70249-6 에디터.jpg",
    "F70252-1 루메르.jpg", "F70252-2 루메르.jpg", "F70252-3 루메르.jpg", "F70254-1 쉬프리.jpg", "F70254-2 쉬프리.jpg",
    "F70254-3 쉬프리.jpg", "F70254-4 쉬프리.jpg", "F70254-5 쉬프리.jpg", "F70254-6 쉬프리.jpg", "F70255-1 필터.jpg",
    "F70255-2 필터.jpg", "F70255-3 필터.jpg", "FC8052-1 파토.jpg", "FC8052-3 파토.jpg", "FC9643-10 스타.jpg",
    "FC9643-11 스타.jpg", "FK0007-1 웨이브.jpg", "FK0007-2 웨이브.jpg", "FK0007-4 웨이브.jpg", "FK0010-1 그릴.jpg",
    "FK0010-2 그릴.jpg", "FK0010-3 그릴.jpg", "FK0010-4 그릴.jpg", "FK0014-1 리얼터치.jpg", "FK0014-2 리얼터치.jpg",
    "FK0014-3 리얼터치.jpg", "FK0014-4 리얼터치.jpg", "FK0018-1 스톤베이지.jpg", "FK0018-2 스톤베이지.jpg", "FK0018-3 스톤베이지.jpg",
    "FK0019-1 와이드터치.jpg", "FK0025-1 코모드.jpg", "FK0025-2 코모드.jpg", "FK0025-3 코모드.jpg", "FK0025-4 코모드.jpg"
];
const LIST_SHINHAN_FIRE_RETARDANT = LIST_SHINHAN_FIRE_RETARDANT_FILES.map(file => ({
    id: 'SH-' + file.split('.')[0],
    brand: "신한",
    category: "벽지",
    materialType: "방염",
    collection: "방염벽지",
    code: file.split('.')[0],
    name: "방염벽지 " + file.split('.')[0],
    price: 0,
    image: "/images/products/신한벽지_방염/" + file,
    thumbnail: "/images/products/신한벽지_방염/" + file,
    cover: "/images/products/신한벽지_방염/" + file
}));
"""

new_content = "// --- SHINHAN AUTO GENERATED START ---\n"
new_content += "const LIST_GAENARI_2025 = [];\n"
new_content += silk_data
new_content += other_collections
new_content += "\n// --- SHINHAN AUTO GENERATED END ---"

# Replace the block
pattern = r'// --- SHINHAN AUTO GENERATED START ---.*?// --- SHINHAN AUTO GENERATED END ---'
updated_db = re.sub(pattern, new_content, db_content, flags=re.DOTALL)

# Update materials array
materials_replace = """...LIST_SHINHAN_리빙,
    ...LIST_SHINHAN_월가드,
    ...LIST_SHINHAN_스케치,
    ...LIST_SHINHAN_파사드,
    ...LIST_SHINHAN_IRIS,
    ...LIST_SHINHAN_PINEHEIM,
    ...LIST_SHINHAN_FIRE_RETARDANT,
    ...LIST_GAENARI_2025,"""

# Pattern to find the Shinhan block in export const materials
pattern_array = r'\.\.\.LIST_SHINHAN_LIVING,\s*\.\.\.LIST_SHINHAN_FIRE_RETARDANT,\s*\.\.\.LIST_SHINHAN_SKETCH,\s*\.\.\.LIST_SHINHAN_IRIS,\s*\.\.\.LIST_SHINHAN_WALLGUARD,\s*\.\.\.LIST_SHINHAN_FACADE,\s*\.\.\.LIST_SHINHAN_PINEHEIM,\s*\.\.\.LIST_GAENARI_2025,'
updated_db = re.sub(pattern_array, materials_replace, updated_db)

with open(materials_db_path, 'w', encoding='utf-8') as f:
    f.write(updated_db)

print("materials.db.js updated successfully with array alignment")
