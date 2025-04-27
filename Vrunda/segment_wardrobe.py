import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pillow_heif import register_heif_opener
from PIL import Image
from utils.sam_utils import sam_init, sam_out_nosave
from utils.utils import pred_bbox, image_preprocess_nosave
import torch

# Register HEIC opener
register_heif_opener()

# Initialize SAM
predictor = sam_init()

def preprocess(predictor, raw_im, lower_contrast=False):
    raw_im.thumbnail([512, 512], Image.Resampling.LANCZOS)
    image_sam = sam_out_nosave(predictor, raw_im.convert("RGB"), pred_bbox(raw_im))
    input_256 = image_preprocess_nosave(image_sam, lower_contrast=lower_contrast, rescale=True)
    torch.cuda.empty_cache()
    return input_256

def process_folder(input_folder, output_folder):
    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)
    
    # Process each subfolder
    for category in ['shirts', 't-shirts', 'pants', 'shorts']:
        input_category_path = os.path.join(input_folder, category)
        output_category_path = os.path.join(output_folder, category)
        os.makedirs(output_category_path, exist_ok=True)
        
        # Process each image in the category
        for filename in os.listdir(input_category_path):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.heic')):
                input_path = os.path.join(input_category_path, filename)
                output_path = os.path.join(output_category_path, f"segmented_{filename}")
                
                try:
                    # Open and process the image
                    img = Image.open(input_path)
                    segmented_img = preprocess(predictor, img)
                    
                    # Save the segmented image
                    segmented_img.save(output_path)
                    print(f"Processed: {filename}")
                    
                except Exception as e:
                    print(f"Failed to process {filename}: {e}")

if __name__ == "__main__":
    input_folder = "Vrunda/wardrobe"
    output_folder = "Vrunda/segmented_wardrobe"
    process_folder(input_folder, output_folder) 