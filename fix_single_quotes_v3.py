import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

for line in lines:
    # Pattern: 'key': 'value
    # We want to ensure there is a closing quote.
    # We use a state machine or regex to find and fix.
    
    # regex matches: 'key': '
    # then matches anything until next ' or , or }
    
    # Let's try to match property pairs
    segments = re.split(r"('\w+':\s*')", line)
    if len(segments) > 1:
        new_line = segments[0]
        for i in range(1, len(segments), 2):
            p_decl = segments[i]
            p_value_rest = segments[i+1]
            
            new_line += p_decl
            # Check if p_value_rest starts with a quote or contains a quote before a separator
            # Actually, p_decl is 'key': '
            # So the value starts at segments[i+1]
            if "'" not in p_value_rest:
                # Missing quote!
                # Find separator: , prop: ' or } or end of line
                match = re.search(r"(,\s*'\w+':|\s*\})", p_value_rest)
                if match:
                    pos = match.start()
                    new_line += p_value_rest[:pos].rstrip() + "'" + p_value_rest[pos:]
                    fixed_count += 1
                else:
                    # End of line or something else
                    if p_value_rest.endswith('\n'):
                         new_line += p_value_rest[:-1].rstrip() + "'\n"
                    else:
                         new_line += p_value_rest.rstrip() + "'"
                    fixed_count += 1
            else:
                # Has a quote. But wait, what if it's the NEXT property's start?
                # split() handled that by finding ALL 'key': '
                # So segments[i+1] only contains the value plus anything until the NEXT match.
                new_line += p_value_rest
        line = new_line
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} unclosed single quotes.")
