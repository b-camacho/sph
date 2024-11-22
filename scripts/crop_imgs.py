from PIL import Image
import os

def process_images(input_folder, output_folder):
    """
    Process images in the input folder and save cropped versions to the output folder.
    Each image will be 400px wide, maintaining the original height up to 800px max.
    """
    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Process each image in the input folder
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)
            
            with Image.open(input_path) as img:
                # Convert image to RGB if it's in RGBA mode
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                
                # Get original dimensions
                original_width, original_height = img.size
                
                # Calculate scaling factor if height > 800px
                if original_height > 800:
                    scale_factor = 800 / original_height
                    new_height = 800
                    new_width = int(original_width * scale_factor)
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Calculate dimensions for cropping
                target_width = 400
                current_width = img.width
                
                # Calculate left and right coordinates for center crop
                left = (current_width - target_width) // 2
                right = left + target_width
                
                # Crop the image
                cropped_img = img.crop((left, 0, right, img.height))
                
                # Save the processed image
                cropped_img.save(output_path, quality=95)
                print(f"Processed: {filename}")

# Example usage
if __name__ == "__main__":
    input_folder = "data/rembrandt"  # Replace with your input folder path
    output_folder = "data/rembrandt_crops"  # Replace with your output folder path
    process_images(input_folder, output_folder)