import re

db_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(db_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all Shinhan items
# They either look like objects { ... "brand": "신한" ... }
# Or they are in a list that is mapped

print("--- SEARCHING FOR ALL SHINHAN ITEMS WITH '월가드' OR 'W' CODES ---")

# Regex to find JSON objects that might be items
matches = re.finditer(r'\{[^{}]*?\}', content, re.DOTALL)
seen_codes = set()
for match in matches:
    item_str = match.group(0)
    if '"brand":\s*"신한"' in item_str or '"brand":"신한"' in item_str:
        # Check if it has "월가드" or a "W" code
        code_match = re.search(r'"code":\s*"(.*?)"', item_str)
        name_match = re.search(r'"name":\s*"(.*?)"', item_str)
        collection_match = re.search(r'"collection":\s*"(.*?)"', item_str)
        mat_type_match = re.search(r'"materialType":\s*"(.*?)"', item_str)
        
        code = code_match.group(1) if code_match else "N/A"
        name = name_match.group(1) if name_match else "N/A"
        collection = collection_match.group(1) if collection_match else "N/A"
        mat_type = mat_type_match.group(1) if mat_type_match else "N/A"
        
        if "월가드" in name or "월가드" in collection or code.startswith("W"):
            if mat_type != "실크":
                print(f"BAD ITEM: Code={code}, Name={name}, Collection={collection}, Type={mat_type}")
                # print(item_str)
            else:
                # print(f"OK ITEM: Code={code}, Name={name}, Type={mat_type}")
                pass

print("\n--- SEARCHING SOURCE ARRAYS ---")
# Check if any "W" or "월가드" strings exist in LIST_SHINHAN_FIRE_RETARDANT_FILES, etc.
arrays = ["LIST_SHINHAN_IRIS_FILES", "LIST_SHINHAN_PINEHEIM_FILES", "LIST_SHINHAN_FIRE_RETARDANT_FILES"]
for arr_name in arrays:
    arr_match = re.search(fr'const {arr_name} = \[\s*(.*?)\s*\];', content, re.DOTALL)
    if arr_match:
        items = arr_match.group(1).split(',')
        for item in items:
            if "월가드" in item or "W" in item:
                print(f"FOUND SUSPICIOUS IN {arr_name}: {item.strip()}")
