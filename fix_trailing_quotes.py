import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

# Pattern in ECONO_PLUS_3T_RAW:
# category: "데코타일", line: "데코타일 에코플러스 3T", ... box_m2: 3.24", price: 36000
# The " after 3.24 is the remains of the corruption.

for line in lines:
    if 'box_m2: ' in line and '", price: ' in line:
        # Example: box_m2: 3.24", price: 36000
        # We want: box_m2: 3.24, price: 36000
        line = line.replace('", price: ', ', price: ')
        fixed_count += 1
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} trailing quotes.")
