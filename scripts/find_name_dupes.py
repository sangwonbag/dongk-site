import os
from collections import defaultdict

def find_name_dupes(dir_path):
    names = defaultdict(list)
    
    for root, dirs, files in os.walk(dir_path):
        for filename in files:
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                filepath = os.path.join(root, filename)
                name_only = os.path.splitext(filename)[0].lower()
                names[name_only].append(filepath)
                
    dupes = {n: paths for n, paths in names.items() if len(paths) > 1}
    
    print(f"Total duplicate names found: {len(dupes)}")
    for n, paths in dupes.items():
        print(f"Name '{n}' has {len(paths)} files:")
        for p in paths:
            print(f"  - {p}")

if __name__ == "__main__":
    target_dir = r"C:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\public\images\Thumbnail_Image\벽지"
    find_name_dupes(target_dir)
