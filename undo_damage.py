import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the damage: =" -> = ""
# But specifically when it's like let x = ";
new_content = content.replace(' = ";', ' = "";')

# Also check for other instances of unclosed quotes created by that script.
# If we have =" followed by a space or newline.
# Actually, let's just look for lines with odd quotes again and fix them.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Attempted to fix empty string damage.")
