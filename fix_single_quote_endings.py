import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

for line in lines:
    # Pattern: VALUE,'property'
    # We want: VALUE','property'
    # Strategy: find all ,'\w+': and check if there's a quote before the comma
    
    # We use a regex that looks behind the comma
    # But Python's re doesn't support variable width lookbehind.
    # We use finditer.
    
    matches = list(re.finditer(r",\s*'\w+':", line))
    offset = 0
    for match in matches:
        start = match.start() + offset
        # Check the character before the comma (ignoring trailing spaces of the value)
        prefix = line[:start].rstrip()
        if prefix and not prefix.endswith("'") and not prefix.endswith('"') and not prefix.endswith('}') and not prefix.endswith(']'):
            # Missing closing quote for the previous property!
            # Insert ' before the comma
            line = line[:start].rstrip() + "'" + line[start:]
            offset += 1
            fixed_count += 1
            
    # Also check the end of the line: VALUE }
    if line.strip().endswith('}') and not line.strip().endswith("'}") and not line.strip().endswith('"}'):
        # Check if the last property has a quote
        # Find last colon
        last_colon = line.rfind(':')
        if last_colon != -1:
            segment = line[last_colon:].strip()
            # If segment is : 'VALUE }
            if "'" in segment and segment.count("'") == 1:
                # Insert ' before }
                pos = line.rfind('}')
                line = line[:pos].rstrip() + "'" + line[pos:]
                fixed_count += 1

    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} single quote endings.")
