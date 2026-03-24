import chardet
import os

file_path = r"c:\Users\psw71\.\gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js"
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, 'rb') as f:
    rawdata = f.read()
    result = chardet.detect(rawdata)
    encoding = result['encoding']
    print(f"Detected encoding: {encoding}")

try:
    decoded_data = rawdata.decode(encoding)
    print("Snippet (first 200 chars):")
    print(decoded_data[:200])
except Exception as e:
    print(f"Error decoding: {e}")
