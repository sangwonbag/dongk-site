import re

file_path = 'src/data/samplebooks.db.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace `pdf: "/samplebooks/2025 ..."` with `pdf: "/samplebooks/데코타일/LX/2025 ..."`
# specifically for the LX 데코타일 section.

# The files are: "2025 OA타일.pdf", "2025 보타닉.pdf", "2025 에디톤 스톤.pdf",
# "2025 에코노플러스.pdf", "2025 프레스티지.pdf", "2025 하우스.pdf", "2025 하우스스타일.pdf"

files_to_update = [
    "2025 OA타일.pdf",
    "2025 보타닉.pdf",
    "2025 에디톤 스톤.pdf",
    "2025 에코노플러스.pdf",
    "2025 프레스티지.pdf",
    "2025 하우스.pdf",
    "2025 하우스스타일.pdf"
]

for filename in files_to_update:
    old_str = f'pdf: "/samplebooks/{filename}"'
    new_str = f'pdf: "/samplebooks/데코타일/LX/{filename}"'
    content = content.replace(old_str, new_str)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated LX Deco Tile PDF paths.")
