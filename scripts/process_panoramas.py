import os
import glob
import numpy as np
from PIL import Image

def process_image(img_path, blend_width=80, target_size=(2048, 2048)):
    print(f"Processing: {img_path}")
    img = Image.open(img_path).convert("RGB")
    
    # 1. Apply horizontal seam blending
    w, h = img.size
    arr = np.array(img, dtype=float)
    
    # Left edge column 0 and right edge column w-1 represent the same direction (North).
    # We blend them to a common center column C.
    L = arr[:, 0]
    R = arr[:, w - 1]
    C = 0.5 * (L + R)
    
    # Blend left edge columns 0..blend_width-1 towards C
    for x in range(blend_width):
        alpha = x / float(blend_width)
        arr[:, x] = (1 - alpha) * C + alpha * arr[:, x]
        
    # Blend right edge columns w-1..w-blend_width towards C
    for x in range(blend_width):
        alpha = x / float(blend_width)
        arr[:, w - 1 - x] = (1 - alpha) * C + alpha * arr[:, w - 1 - x]
        
    # Save blended image in-memory
    blended_img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    
    # 2. Upscale image to target size using high-quality Lanczos interpolation
    resized_img = blended_img.resize(target_size, Image.Resampling.LANCZOS)
    
    # Overwrite the original file
    resized_img.save(img_path, "PNG")
    print(f"Successfully processed and upscaled {img_path} to {target_size}")

if __name__ == "__main__":
    # We will process all four panoramas in public/images/
    panoramas = [
        "public/images/panorama_entrance.png",
        "public/images/panorama_living.png",
        "public/images/panorama_kitchen.png",
        "public/images/panorama_bedroom.png"
    ]
    
    for pano in panoramas:
        if os.path.exists(pano):
            process_image(pano)
        else:
            print(f"Warning: {pano} does not exist!")
