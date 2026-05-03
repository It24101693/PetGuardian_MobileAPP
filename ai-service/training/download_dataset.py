"""
Helper script to download and organize public pet datasets
"""
import os
import urllib.request
import zipfile
import shutil
from pathlib import Path

def download_file(url, destination):
    """Download file with progress"""
    print(f"Downloading from {url}...")
    
    def progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        percent = min(downloaded * 100 / total_size, 100)
        print(f"\rProgress: {percent:.1f}%", end='')
    
    urllib.request.urlretrieve(url, destination, progress)
    print("\n✓ Download complete")

def setup_oxford_pets():
    """
    Download and organize Oxford-IIIT Pet Dataset
    37 breeds (25 dogs, 12 cats), ~200 images each
    """
    print("\n" + "="*80)
    print("OXFORD-IIIT PET DATASET SETUP")
    print("="*80)
    
    # URLs
    images_url = "https://www.robots.ox.ac.uk/~vgg/data/pets/data/images.tar.gz"
    annotations_url = "https://www.robots.ox.ac.uk/~vgg/data/pets/data/annotations.tar.gz"
    
    # Create temp directory
    temp_dir = "temp_download"
    os.makedirs(temp_dir, exist_ok=True)
    
    print("\n1. Downloading images...")
    images_file = os.path.join(temp_dir, "images.tar.gz")
    
    try:
        download_file(images_url, images_file)
    except Exception as e:
        print(f"\n❌ Download failed: {e}")
        print("\nManual download instructions:")
        print(f"1. Visit: https://www.robots.ox.ac.uk/~vgg/data/pets/")
        print(f"2. Download 'images.tar.gz'")
        print(f"3. Extract to: {temp_dir}/")
        return
    
    print("\n2. Extracting files...")
    # Extract (you'll need to implement extraction based on your OS)
    print("Please extract images.tar.gz manually to temp_download/images/")
    print("Then run organize_oxford_dataset() function")

def organize_oxford_dataset():
    """
    Organize Oxford dataset into train/validation splits
    Groups breeds by size
    """
    print("\n" + "="*80)
    print("ORGANIZING OXFORD DATASET")
    print("="*80)
    
    # Breed to size mapping (you can customize this)
    breed_to_size = {
        # Small Dogs
        'chihuahua': 'Small_Dog',
        'yorkshire_terrier': 'Small_Dog',
        'pomeranian': 'Small_Dog',
        'miniature_pinscher': 'Small_Dog',
        'japanese_chin': 'Small_Dog',
        'havanese': 'Small_Dog',
        'shiba_inu': 'Small_Dog',
        
        # Medium Dogs
        'beagle': 'Medium_Dog',
        'english_cocker_spaniel': 'Medium_Dog',
        'american_bulldog': 'Medium_Dog',
        'basset_hound': 'Medium_Dog',
        'english_setter': 'Medium_Dog',
        'wheaten_terrier': 'Medium_Dog',
        'staffordshire_bull_terrier': 'Medium_Dog',
        'american_pit_bull_terrier': 'Medium_Dog',
        
        # Large Dogs
        'german_shorthaired': 'Large_Dog',
        'great_pyrenees': 'Large_Dog',
        'leonberger': 'Large_Dog',
        'newfoundland': 'Large_Dog',
        'saint_bernard': 'Large_Dog',
        'samoyed': 'Large_Dog',
        'keeshond': 'Large_Dog',
        'boxer': 'Large_Dog',
        'english_foxhound': 'Large_Dog',
        
        # Small Cats
        'abyssinian': 'Small_Cat',
        'siamese': 'Small_Cat',
        'russian_blue': 'Small_Cat',
        'sphynx': 'Small_Cat',
        
        # Medium Cats
        'bengal': 'Medium_Cat',
        'birman': 'Medium_Cat',
        'british_shorthair': 'Medium_Cat',
        'egyptian_mau': 'Medium_Cat',
        'persian': 'Medium_Cat',
        
        # Large Cats
        'maine_coon': 'Large_Cat',
        'ragdoll': 'Large_Cat',
        'bombay': 'Large_Cat',
    }
    
    print("\nThis function needs to be completed based on your dataset location")
    print("Breed to size mapping created with", len(breed_to_size), "breeds")

def create_simple_dataset():
    """
    Create a simple dataset structure for manual image collection
    """
    print("\n" + "="*80)
    print("CREATING DATASET STRUCTURE")
    print("="*80)
    
    categories = [
        'Small_Dog',
        'Medium_Dog', 
        'Large_Dog',
        'Small_Cat',
        'Medium_Cat',
        'Large_Cat'
    ]
    
    base_path = 'dataset'
    
    for split in ['train', 'validation']:
        for category in categories:
            path = os.path.join(base_path, split, category)
            os.makedirs(path, exist_ok=True)
            
            # Create README in each folder
            readme_path = os.path.join(path, 'README.txt')
            with open(readme_path, 'w') as f:
                f.write(f"Add {category} images here\n\n")
                
                if 'Small_Dog' in category:
                    f.write("Examples: Chihuahua, Pomeranian, Yorkshire Terrier\n")
                    f.write("Weight: < 10kg\n")
                elif 'Medium_Dog' in category:
                    f.write("Examples: Beagle, Bulldog, Cocker Spaniel\n")
                    f.write("Weight: 10-25kg\n")
                elif 'Large_Dog' in category:
                    f.write("Examples: German Shepherd, Golden Retriever, Labrador\n")
                    f.write("Weight: > 25kg\n")
                elif 'Small_Cat' in category:
                    f.write("Examples: Siamese, Abyssinian, Russian Blue\n")
                    f.write("Weight: < 4kg\n")
                elif 'Medium_Cat' in category:
                    f.write("Examples: British Shorthair, Bengal, Persian\n")
                    f.write("Weight: 4-6kg\n")
                elif 'Large_Cat' in category:
                    f.write("Examples: Maine Coon, Ragdoll, Norwegian Forest\n")
                    f.write("Weight: > 6kg\n")
                
                f.write(f"\nRecommended: 500-1000 images for {split}\n")
    
    print(f"\n✓ Dataset structure created at: {base_path}/")
    print("\nFolder structure:")
    print(f"{base_path}/")
    print("  ├── train/")
    print("  │   ├── Small_Dog/")
    print("  │   ├── Medium_Dog/")
    print("  │   ├── Large_Dog/")
    print("  │   ├── Small_Cat/")
    print("  │   ├── Medium_Cat/")
    print("  │   └── Large_Cat/")
    print("  └── validation/")
    print("      └── (same structure)")
    
    print("\n" + "="*80)
    print("NEXT STEPS:")
    print("="*80)
    print("""
1. Add images to each category folder:
   - Minimum: 100 images per category
   - Recommended: 500-1000 images per category
   - Split: 80% in train/, 20% in validation/

2. Image requirements:
   - Format: JPG, JPEG, or PNG
   - Size: Any size (will be resized to 224x224)
   - Quality: Clear, well-lit, focused on pet
   - Variety: Different angles, backgrounds, lighting

3. Where to get images:
   - Your own photos
   - Google Images (check usage rights)
   - Kaggle datasets
   - Oxford-IIIT Pet Dataset
   - Stanford Dogs Dataset

4. After collecting images, run:
   py train_breed_classifier.py
""")

def main():
    """Main menu"""
    print("\n" + "="*80)
    print("DATASET PREPARATION TOOL")
    print("="*80)
    print("""
Choose an option:

1. Create empty dataset structure (for manual image collection)
2. Download Oxford-IIIT Pet Dataset (37 breeds, ~7400 images)
3. Instructions for Kaggle datasets
4. Exit

""")
    
    choice = input("Enter choice (1-4): ").strip()
    
    if choice == '1':
        create_simple_dataset()
    elif choice == '2':
        print("\n⚠️  Oxford dataset download requires manual steps")
        print("Visit: https://www.robots.ox.ac.uk/~vgg/data/pets/")
        print("Download and extract images.tar.gz")
        # setup_oxford_pets()
    elif choice == '3':
        print("\n" + "="*80)
        print("KAGGLE DATASETS")
        print("="*80)
        print("""
Popular Kaggle datasets for pet classification:

1. Dogs vs Cats (25,000 images)
   https://www.kaggle.com/c/dogs-vs-cats/data

2. Dog Breed Identification (10,000+ images, 120 breeds)
   https://www.kaggle.com/c/dog-breed-identification/data

3. Cat Breeds Dataset (67 breeds)
   https://www.kaggle.com/datasets/ma7555/cat-breeds-dataset

To download:
1. Create Kaggle account
2. Install: pip install kaggle
3. Setup API token: https://www.kaggle.com/docs/api
4. Download: kaggle competitions download -c dogs-vs-cats

After downloading, organize images into the dataset structure.
""")
    elif choice == '4':
        print("Exiting...")
    else:
        print("Invalid choice")

if __name__ == '__main__':
    main()
