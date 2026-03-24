import os

def safe_delete_redundant(thumb_dir, cover_dir):
    cover_filenames = set()
    for root, dirs, files in os.walk(cover_dir):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                cover_filenames.add(f.lower())
                
    deleted_count = 0
    for root, dirs, files in os.walk(thumb_dir):
        for f in files:
            if f.lower() in cover_filenames:
                path = os.path.join(root, f)
                try:
                    os.remove(path)
                    print(f"Deleted redundant: {os.path.relpath(path, thumb_dir)}")
                    deleted_count += 1
                except Exception as e:
                    print(f"Error deleting {path}: {e}")
                    
    print(f"\nCleanup complete. Total redundant files deleted: {deleted_count}")

if __name__ == "__main__":
    thumb_path = r"C:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\public\images\Thumbnail_Image\벽지"
    cover_path = r"C:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\public\images\cover\벽지"
    
    if os.path.exists(thumb_path) and os.path.exists(cover_path):
        safe_delete_redundant(thumb_path, cover_path)
    else:
        print("Path missing, aborting.")
