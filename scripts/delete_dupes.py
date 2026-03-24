import os

facade_dir = r"C:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\public\images\Thumbnail_Image\벽지\신한벽지_파사드(FACADE)"
files_to_delete = [
    "W2201-1 하드릭.jpg", "W2201-2 하드릭.jpg", "W2201-3 하드릭.jpg", "W2201-4 하드릭.jpg",
    "W2202-1 믹스톤.jpg", "W2202-2 믹스톤.jpg", "W2202-3 믹스톤.jpg",
    "W2203-1 러프트.jpg", "W2203-2 러프트.jpg", "W2203-3 러프트.jpg", "W2203-4 러프트.jpg"
]

deleted = 0
if os.path.exists(facade_dir):
    for f in files_to_delete:
        path = os.path.join(facade_dir, f)
        if os.path.exists(path):
            os.remove(path)
            deleted += 1
            print(f"Deleted {path}")
            
print(f"Total deleted: {deleted}")
