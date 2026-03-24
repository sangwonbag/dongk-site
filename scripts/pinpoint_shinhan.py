import re

db_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(db_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- LOCATING '월가드' IN materials.db.js ---")
for i, line in enumerate(lines):
    if "월가드" in line or "WALLGUARD" in line.upper():
        # Look for the materialType in the previous 10 lines
        context = "".join(lines[max(0, i-10):i+1])
        if '"materialType":' in context:
            mat_type = re.search(r'"materialType":\s*"(.*?)"', context)
            if mat_type:
                t = mat_type.group(1)
                if t != "실크":
                    print(f"Line {i+1}: Found Wallguard with type '{t}'")
                    print(context)
        elif 'materialType:' in context:
             mat_type = re.search(r'materialType:\s*"(.*?)"', context)
             if mat_type:
                t = mat_type.group(1)
                if t != "실크":
                    print(f"Line {i+1}: Found Wallguard with type '{t}'")
                    print(context)

print("\n--- SEARCHING FOR 'W' CODES IN HAPJI/FIRE SECTIONS ---")
# Check if any "W" codes are inside the IRIS, PINEHEIM, FIRE arrays
# I'll just look for lines starting with "W" inside those lists
in_bad_list = False
current_list = ""
for i, line in enumerate(lines):
    if "LIST_SHINHAN_IRIS_FILES" in line or "LIST_SHINHAN_PINEHEIM_FILES" in line or "LIST_SHINHAN_FIRE_RETARDANT_FILES" in line:
        in_bad_list = True
        current_list = line.strip()
    if in_bad_list:
        if '"W' in line:
            print(f"Line {i+1}: Found 'W' code in {current_list}")
            print(line.strip())
        if '];' in line:
            in_bad_list = False
