import os

def find_cross_directory_dupes(thumb_dir, cover_dir):
    thumb_files = {}
    cover_files = {}
    
    for root, dirs, files in os.walk(thumb_dir):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                thumb_files[f.lower()] = os.path.join(root, f)
                
    for root, dirs, files in os.walk(cover_dir):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                cover_files[f.lower()] = os.path.join(root, f)
                
    intersection = set(thumb_files.keys()) & set(cover_files.keys())
    
    print(f"Thumbnails found: {len(thumb_files)}")
    print(f"Covers found: {len(cover_files)}")
    print(f"Duplicate filenames found in both: {len(intersection)}")
    
    if intersection:
        print("\nCommon Files:")
        for name in sorted(list(intersection))[:20]: # Show first 20
            print(f"- {name}")
            print(f"  Thumb: {os.path.relpath(thumb_files[name], thumb_dir)}")
            print(f"  Cover: {os.path.relpath(cover_files[name], cover_dir)}")

if __name__ == "__main__":
    thumb_path = r"C:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\public\images\Thumbnail_Image\벽지"
    cover_path = r"C:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\public\images\cover\벽지"
    
    if os.path.exists(thumb_path) and os.path.exists(cover_path):
        find_cross_directory_dupes(thumb_path, cover_path)
    else:
        print("One or both directories missing.")
        print(f"Thumb path exists: {os.path.exists(thumb_path)}")
        print(f"Cover path exists: {os.path.exists(cover_path)}")
