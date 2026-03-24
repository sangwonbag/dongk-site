import re
import os

mapping = {
    # Categories
    "?곗퐫?€": "데코타일",
    "?곗퐫?€딥": "데코타일",
    "데코€": "데코타일",
    "?ν뙋": "장판",
    "留덈（": "마루",
    "踰쎌?": "벽지",
    "移댄럹?명???": "카페트타일",
    "湲고?": "기타",
    "?곗퐫?€??": "데코타일",
    "?곗퐫?": "데코",
    
    # Brands / Lines
    "?꾨젅스틸떚吏€ 5T": "프레스티지 5T",
    "?먯꽭?€ 3T": "보타닉 3T",
    "吏€?꾩궗?묒븷": "지아사랑애",
    "吏€?꾩냼由ъ옞": "지아소리잠",
    "?€?됰ぉ": "은행목",
    "媛쒕굹由?": "개나리",
    "?쒖슱": "서울",
    "?쒖씪": "제일",
    "?붿븘?대뵒": "디아이디",
    "?좏븳(KCC)": "신한(KCC)",
    "?곗퐫?€??": "데코레이",
    "?덉떆": "뉴시스",
    "?닿굔": "이건",
    "?숉솕": "동화",
    "?ㅼ셿": "스와니",
    "?꾨컲": "아반",
    "?숈떊": "동신",
    "?뱀닔": "특수",
    "?ъ쁺": "재영",
    "?꾨?": "현대",
    "?좎꽦": "유성",
    "援ъ젙": "구정",
    "?좏븳": "신한",

    # Common corrupted name fragments
    "踰좎씠吏": "베이지",
    "鍮꾩븞肄": "비앙코",
    "뚮씪議": "테라조",
}

import re
import os

file_path = os.path.join("src", "data", "materials.db.js")

def fix_content():
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    fixed = content

    # Multi-pass replacement
    for _ in range(3):
        for key, value in mapping.items():
            fixed = fixed.replace(key, value)

    # Specific cases
    fixed = fixed.replace("? 섎젅媛뺤뒪", "르네강스")
    fixed = fixed.replace("? 좊윭 ? 쇱븞", "컬러스톤")
    fixed = fixed.replace("? 뚰봽 딥? 뚯씤", "소프트파인")
    fixed = fixed.replace("? 곕뱶", "우드")
    fixed = fixed.replace("? 쇱씤", "라인")

    # Regex cleanup: trailing corrupt chars (딥, €, ?, ^C, etc.)
    fixed = re.sub(r"[딥€?^C\s]+(?=[,\n\"'])", "", fixed)
    
    # Specific cleanup for name strings that got doubled
    fixed = fixed.replace('"데코타일데코타일"', '"데코타일"')
    fixed = re.sub(r"\"\? ", "\"", fixed)
    fixed = fixed.replace('category: "?"', 'category: "기타"')
    fixed = re.sub(r"(brand|category|line):\s*\"[\?\s]+", r"\1: \"", fixed)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed)
    
    print(f"File {file_path} has been successfully restored.")

if __name__ == "__main__":
    fix_content()
