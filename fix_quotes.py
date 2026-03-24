import os

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

for line in lines:
    quote_count = line.count('"')
    if quote_count % 2 != 0:
        # Systematic fix: find the last occurrence of ", " and insert " before it
        # Example: name: "TEXT, type: "600" },
        # We want: name: "TEXT", type: "600" },
        
        last_comma = line.rfind(', ')
        if last_comma != -1:
            # Check if the text before the last comma has an odd number of quotes
            prefix = line[:last_comma]
            if prefix.count('"') % 2 != 0:
                line = line[:last_comma] + '"' + line[last_comma:]
                fixed_count += 1
        else:
            # Maybe it's at the end of the line: name: "TEXT" }
            # Actually, most of these use properties.
            # Let's try to find potential missing quotes after garbled text
            pass
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} lines.")
