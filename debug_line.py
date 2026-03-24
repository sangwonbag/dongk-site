file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

for i in range(875, min(len(lines), 882)):
    line = lines[i]
    print(f"--- Line {i+1} ---")
    print(f"Content: {line.strip()}")
    print(f"Length: {len(line)}")
    print(f"Hex: {line.encode('utf-8', errors='replace').hex()}")
    print(f"Single Quote Count: {line.count(\"'\")}")
    print(f"Double Quote Count: {line.count('\"')}")
