file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

for line in lines:
    if "''" in line:
        line = line.replace("''", "'")
        fixed_count += 1
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} ghost quotes.")
