import os
import json
import re

base_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\public\images\products\신한_실크'
folders = {
    '2025 스케치(SKETCH)': '스케치',
    '2025 월가드(WALLGUARD)': '월가드',
    '2026 리빙(LIVING)': '리빙',
    '신한벽지_파사드(FACADE)': '파사드'
}

exclude_keywords = ['800x800', '전체 이미지', '리스트이미지']

def generate_data():
    all_materials = {}
    
    for folder_name, product_line in folders.items():
        folder_path = os.path.join(base_path, folder_name)
        if not os.path.exists(folder_path):
            print(f"Folder not found: {folder_path}")
            continue
            
        materials_list = []
        files = [f for f in os.listdir(folder_path) if f.lower().endswith('.jpg')]
        
        for filename in files:
            # Check exclusions
            if any(keyword in filename for keyword in exclude_keywords):
                continue
                
            # Extract code (numbers at the beginning) - the user said "앞부분 숫자"
            # But looking at C9643-20, it's not just numbers. 
            # Example provided: 15120.jpg -> code 15120.
            # Example name: 스케치 15120. 
            # I'll take everything before the first space or dot.
            name_part = os.path.splitext(filename)[0]
            code = name_part.split(' ')[0]
            
            # Remove any trailing dashes or special chars if any, but the examples show things like W2201
            
            material = {
                'id': f'SH-{code}',
                'brand': '신한',
                'category': '벽지',
                'materialType': '실크',
                'collection': product_line,
                'code': code,
                'name': f'{product_line} {code}',
                'image': f'/images/products/신한_실크/{folder_name}/{filename}',
                'thumbnail': f'/images/products/신한_실크/{folder_name}/{filename}',
                'cover': f'/images/products/신한_실크/{folder_name}/{filename}',
                'price': 0
            }
            materials_list.append(material)
            
        all_materials[product_line] = materials_list
        
    return all_materials

if __name__ == "__main__":
    results = generate_data()
    with open(r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\scripts\shinhan_silk_data.js', 'w', encoding='utf-8') as f:
        for line, items in results.items():
            f.write(f"export const LIST_SHINHAN_{line.upper()} = {json.dumps(items, indent=4, ensure_ascii=False)};\n\n")
    print("Data saved to scripts/shinhan_silk_data.js")
