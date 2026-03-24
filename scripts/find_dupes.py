import os
import hashlib
from collections import defaultdict

def get_file_hash(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read(65536)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()

def find_dupes(dir_path):
    hashes = defaultdict(list)
    total_files = 0
    
    for root, dirs, files in os.walk(dir_path):
        for filename in files:
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                filepath = os.path.join(root, filename)
                file_hash = get_file_hash(filepath)
                hashes[file_hash].append(filepath)
                total_files += 1

    dupes = {h: paths for h, paths in hashes.items() if len(paths) > 1}
    
    print(f"Total images scanned: {total_files}")
    print(f"Total unique images: {len(hashes)}")
    print(f"Total duplicate sets found: {len(dupes)}")
    
    dupe_count = sum(len(paths) - 1 for paths in dupes.values())
    print(f"Total duplicate files that can be removed: {dupe_count}")
    
    if dupe_count > 0:
        # Show first 3 sets
        print("\nExamples of duplicates:")
        for i, (h, paths) in enumerate(list(dupes.items())[:3]):
            print(f"Set {i+1}:")
            for p in paths:
                print(f"  - {p}")

if __name__ == "__main__":
    target_dir = r"C:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\public\images\Thumbnail_Image\벽지"
    if os.path.exists(target_dir):
        find_dupes(target_dir)
    else:
        print(f"Directory not found: {target_dir}")
