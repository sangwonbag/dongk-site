import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

for line in lines:
    # Count single quotes
    s_quotes = line.count("'")
    if s_quotes % 2 != 0:
        # Generic fix for single quote imbalance at property ends
        # Example: 'size': 'VALUE, 'packing': 'VALUE'
        
        # Look for ', ' followed by a property name in single quotes
        # Or look for '} }' etc.
        
        # Try to find ', \'' or '\' }' etc.
        parts = re.split(r"('\w+':\s*')", line)
        if len(parts) > 1:
            new_line = parts[0]
            for i in range(1, len(parts), 2):
                prop_start = parts[i]
                value_part = parts[i+1]
                new_line += prop_start
                if "'" not in value_part:
                    # Missing quote before next prop or end
                    match = re.search(r"(,\s*'\w+':|\s*\})", value_part)
                    if match:
                        pos = match.start()
                        new_line += value_part[:pos] + "'" + value_part[pos:]
                        fixed_count += 1
                    else:
                        if value_part.endswith('\n'):
                            new_line += value_part[:-1].rstrip() + "'\n"
                        else:
                            new_line += value_part + "'"
                        fixed_count += 1
                else:
                    new_line += value_part
            line = new_line
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} single quotes.")
