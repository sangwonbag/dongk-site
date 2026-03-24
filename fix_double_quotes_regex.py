import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Pattern: "prop": "value without quote followed by , "nextProp":
pattern = r'("\w+":\s*")([^"]{1,200})(\s*,\s*"\w+":)'

def fix_match(m):
    return m.group(1) + m.group(2).rstrip() + '"' + m.group(3)

new_content, count = re.subn(pattern, fix_match, content)

# 2. Pattern for end of objects: "prop": "value }
pattern_end = r'("\w+":\s*")([^"]{1,200})(\s*\})'
new_content, count_end = re.subn(pattern_end, fix_match, new_content)

# 3. Clean up double double quotes: ""
# But be careful with empty strings. In this file, it's mostly "VALUE""
new_content = re.sub(r'([^:])""', r'\1"', new_content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Fixed {count} internal and {count_end} end-of-object double quotes.")
