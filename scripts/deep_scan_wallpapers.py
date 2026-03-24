import os
from collections import defaultdict

def scan_all_wallpapers(base_dir):
    file_map = defaultdict(list)
    
    for root, dirs, files in os.walk(base_dir):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                full_path = os.path.join(root, f)
                # Store relative path for cleaner output
                rel_path = os.path.relpath(full_path, base_dir)
                file_map[f.lower()].append(rel_path)
                
    dupes = {name: paths for name, paths in file_map.items() if len(paths) > 1}
    
    print(f"Scanned directory: {base_dir}")
    print(f"Total unique filenames: {len(file_map)}")
    print(f"Duplicate filename sets found: {len(dupes)}")
    
    if dupes:
        print("\nDuplicate Filenames and their Locations:")
        for name, paths in sorted(dupes.items()):
            print(f"\n- {name}:")
            for p in paths:
                print(f"    {p}")
    else:
        print("\nNo duplicate filenames found in the entire tree.")

if __name__ == "__main__":
    target = r"C:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\public\images\Thumbnail_Image\벽지"
    scan_all_wallpapers(target)
