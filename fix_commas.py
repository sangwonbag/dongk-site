import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

for line in lines:
    # Pattern: property: "anything," at the end of line
    # We want: property: "anything",
    if line.strip().endswith(',"'):
        # Only if it has a colon before it to be safe
        if ':' in line:
            new_line = line.replace(',"', '",')
            new_lines.append(new_line)
            fixed_count += 1
            continue
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} lines.")
