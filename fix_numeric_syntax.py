import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix numbers followed by a misplaced quote
# Example: 11000',
new_content = re.sub(r'(\d+)\'', r'\1', content)
# Also fix 3.24', etc
new_content = re.sub(r'(\d+\.\d+)\'', r'\1', new_content)

# Also check for double single quotes that might be left
new_content = new_content.replace("''", "'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Cleaned up numeric properties and ghost quotes.")
