import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

# Pattern: `${ item.box_pcs }pcs / ${ item.box_m2 } ??
# or `${item.box_pcs}pcs / ${item.box_m2} ??
# To be fixed to: `${item.box_pcs}pcs / ${item.box_m2}㎡`

for line in lines:
    if '${' in line and '??' in line and '`' in line:
        # Match the template literal part
        # Try to find `${ ... }pcs / ${ ... } ??` and close it.
        # Actually, let's just look for `??` followed by end of line or comma
        if '??' in line and '`' in line:
            # Check if it has an odd number of `
            if line.count('`') % 2 != 0:
                # Replace the last ?? with ㎡`
                line = line.replace('??', '㎡`')
                fixed_count += 1
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} template literals.")
