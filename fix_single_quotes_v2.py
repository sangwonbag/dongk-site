import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

for line in lines:
    if line.count("'") % 2 != 0:
        # Pattern: 'property': 'value without closing quote
        # We search for property starts and check if they have a closing quote
        parts = re.split(r"('\w+':\s*')", line)
        if len(parts) > 1:
            new_line = parts[0]
            for i in range(1, len(parts), 2):
                p_start = parts[i]
                v_part = parts[i+1]
                new_line += p_start
                if "'" not in v_part:
                    # Missing quote. Find next comma or closing brace
                    match = re.search(r"(,\s*['\w]|\})", v_part)
                    if match:
                        pos = match.start()
                        new_line += v_part[:pos].rstrip() + "'" + v_part[pos:]
                        fixed_count += 1
                    else:
                        # End of line
                        new_line += v_part.rstrip() + "'\n"
                        fixed_count += 1
                else:
                    new_line += v_part
            line = new_line
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} single quotes in pass 2.")
