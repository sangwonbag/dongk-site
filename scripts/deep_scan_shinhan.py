import re

db_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(db_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all occurrences of "W" followed by 4 digits (e.g., W2201)
codes = re.findall(r'W\d{4}', content)
codes = sorted(list(set(codes)))
print(f"Found {len(codes)} distinct 'W' codes: {codes[:10]}...")

# Find their objects
for code in codes:
    # Find the object containing this code
    # Usually it looks like: { "id": "...", ..., "code": "W2201", ... }
    match = re.search(fr'\{{[^{{}}]*?"code":\s*"{code}"[^{{}}]*?\}}', content, re.DOTALL)
    if match:
        item_str = match.group(0)
        mat_type = re.search(r'"materialType":\s*"(.*?)"', item_str)
        t = mat_type.group(1) if mat_type else "N/A"
        if t != "실크":
             print(f"CODE {code} has WRONG TYPE: {t}")
             print(item_str)
    else:
        # Check if it's in a list
        pass

# Special check for "월가드" in the name/collection
matches = re.finditer(r'\{[^{}]*?\}', content, re.DOTALL)
for match in matches:
    item_str = match.group(0)
    if "월가드" in item_str or "WALLGUARD" in item_str.upper():
         mat_type = re.search(r'"materialType":\s*"(.*?)"', item_str)
         t = mat_type.group(1) if mat_type else "N/A"
         if t != "실크":
              print(f"ITEM with '월가드' has WRONG TYPE: {t}")
              print(item_str)
