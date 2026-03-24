import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

for line in lines:
    original_line = line
    # Count quotes
    quotes = line.count('"')
    if quotes % 2 != 0:
        # Strategy 1: Missing quote before property comma or object end
        # Example: name: "TEXT, type: "600" },
        # We look for ", propertyName:" or " }" or " },"
        
        # Try to find where the quote should be.
        # Often it's name: "GABRLED , type: ...
        # If we see a sequence of [word]: " then it's a property start.
        
        # Let's try to fix the most common pattern: property: "value without closing quote
        parts = re.split(r'(\w+:\s*")', line)
        if len(parts) > 1:
            # Reconstruct and insert quote if needed
            new_line = parts[0]
            for i in range(1, len(parts), 2):
                prop_start = parts[i]
                value_part = parts[i+1]
                
                new_line += prop_start
                # Find if this value part has its own closing quote
                # If there's another property start later in this value_part, we might have missed it.
                # Actually, parts[i+1] contains everything until the NEXT property start or end of line.
                
                # If there's no quote in value_part before the next comma or end of line
                if '"' not in value_part:
                    # Find comma or ending
                    match = re.search(r'(,\s*\w+:|\s*\})', value_part)
                    if match:
                        pos = match.start()
                        value = value_part[:pos]
                        rest = value_part[pos:]
                        new_line += value + '"' + rest
                        fixed_count += 1
                    else:
                        # End of line case
                        if value_part.endswith('\n'):
                            new_line += value_part[:-1].rstrip() + '"\n'
                        else:
                            new_line += value_part + '"'
                        fixed_count += 1
                else:
                    new_line += value_part
            line = new_line

    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} cases.")
