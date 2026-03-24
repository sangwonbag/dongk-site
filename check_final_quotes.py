file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.count('"') % 2 != 0:
        print(f"Line {i+1} (Double Quote): {line.strip()}")
    if line.count("'") % 2 != 0:
        print(f"Line {i+1} (Single Quote): {line.strip()}")
