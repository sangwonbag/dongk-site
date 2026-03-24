import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

for line in lines:
    original = line
    # Fix the specific pattern: ??,'property' or ??,'packing' or ?? }
    # Look for property values that end abruptly
    
    # 1. name: '...??,'code' -> name: '...??','code'
    line = line.replace("??,'code'", "??','code'")
    
    # 2. size: '...??,'packing' -> size: '...??','packing'
    line = line.replace("??,'packing'", "??','packing'")
    
    # 3. size: '...??' } -> size: '...??' }
    # Wait, ?? } might be ??' }
    if "?? }" in line:
        line = line.replace("?? }", "??' }")
        
    if line != original:
        fixed_count += 1
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Surgically fixed {fixed_count} lines.")
