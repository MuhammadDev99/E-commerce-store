import os
from PIL import Image

def process_pngs():
    # Get the current directory
    current_dir = os.getcwd()
    
    print(f"Processing PNGs in: {current_dir}")

    for filename in os.listdir(current_dir):
        if filename.lower().endswith(".png"):
            try:
                # 1. Open the image and ensure it is in RGBA mode
                img = Image.open(filename).convert("RGBA")
                
                # 2. Convert to White (Silhouetting)
                # Split the image into individual channels
                r, g, b, a = img.split()
                # Create a solid white channel
                white_channel = Image.new('L', img.size, 0)
                # Merge the white channels with the original transparency (Alpha)
                img = Image.merge('RGBA', (white_channel, white_channel, white_channel, a))

                # 3. Remove Empty Space (Trim/Autocrop)
                # getbbox() finds the bounding box of non-zero (non-transparent) regions
                bbox = img.getbbox()
                
                if bbox:
                    # Crop the image to the bounding box
                    img = img.crop(bbox)
                    
                    # 4. Save the image (overwriting the original)
                    img.save(filename)
                    print(f"✓ White & Trimmed: {filename}")
                else:
                    print(f"! Skipped {filename}: Image is completely transparent.")
                
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    process_pngs()