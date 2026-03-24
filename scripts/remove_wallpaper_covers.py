import re

file_path = 'src/data/samplebooks.db.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any line containing `cover: "/samplebooks/벽지/...`
# Let's just find the `// 벽지 (재칠별 재구성)` section and remove `cover: ...` inside it
start_idx = content.find('// 벽지 (재칠별 재구성)')
if start_idx != -1:
    before = content[:start_idx]
    after = content[start_idx:]
    
    # Remove all `cover: "...",\n` or `cover: "..."` in the after section
    # Be careful about trailing commas on preceding lines if the cover was the last item,
    # but in our DB, `pdf: ...` and `description: ...` always follow `cover: ...`.
    # Let's remove `\s*cover:\s*".*?",`
    after_modified = re.sub(r'[ \t]*cover:\s*".*?",\n', '', after)
    
    new_content = before + after_modified
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Wallpaper covers removed successfully.")
else:
    print("Wallpaper section not found.")
