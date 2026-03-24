import re

with open('src/data/materials.db.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace category: "전체보기" with category: "데코타일" for Dongshin items
# The easiest way is to modify just the LIST_DONGSHIN_RAW section or just replace globally inside the Dongshin section.

start_idx = code.find('const LIST_DONGSHIN_RAW')
end_idx = code.find(']', start_idx)

if start_idx != -1 and end_idx != -1:
    dongshin_section = code[start_idx:end_idx]
    # Replace category: "전체보기"
    modified_section = dongshin_section.replace('category: "전체보기"', 'category: "데코타일"')
    
    code = code[:start_idx] + modified_section + code[end_idx:]
    
    with open('src/data/materials.db.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print('Category fixed successfully!')
else:
    print('Could not find LIST_DONGSHIN_RAW')
