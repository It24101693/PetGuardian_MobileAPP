"""
Validate dataset before training
Checks folder structure, image counts, and image quality
"""
import os
from PIL import Image
from pathlib import Path

def validate_dataset(dataset_path='dataset'):
    """Validate dataset structure and contents"""
    
    print("\n" + "="*80)
    print("DATASET VALIDATION")
    print("="*80)
    
    if not os.path.exists(dataset_path):
        print(f"\n❌ Dataset folder not found: {dataset_path}")
        print("\nRun: py download_dataset.py")
        print("Choose option 1 to create the structure")
        return False
    
    issues = []
    warnings = []
    
    # Check train and validation folders
    for split in ['train', 'validation']:
        split_path = os.path.join(dataset_path, split)
        
        if not os.path.exists(split_path):
            issues.append(f"Missing {split}/ folder")
            continue
        
        print(f"\n📁 Checking {split}/ folder...")
        
        # Get categories
        categories = [d for d in os.listdir(split_path) 
                     if os.path.isdir(os.path.join(split_path, d))]
        
        if not categories:
            issues.append(f"No category folders in {split}/")
            continue
        
        print(f"  Found {len(categories)} categories: {', '.join(categories)}")
        
        # Check each category
        total_images = 0
        for category in categories:
            category_path = os.path.join(split_path, category)
            
            # Count images
            image_files = [f for f in os.listdir(category_path)
                          if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
            
            num_images = len(image_files)
            total_images += num_images
            
            # Status
            status = "✓"
            if num_images == 0:
                status = "❌"
                issues.append(f"{split}/{category}: No images found")
            elif num_images < 50:
                status = "⚠️"
                warnings.append(f"{split}/{category}: Only {num_images} images (recommend 100+)")
            elif num_images < 100:
                status = "⚠️"
                warnings.append(f"{split}/{category}: Only {num_images} images (recommend 500+)")
            
            print(f"    {status} {category}: {num_images} images")
            
            # Check image quality (sample first 5)
            corrupted = 0
            for img_file in image_files[:5]:
                img_path = os.path.join(category_path, img_file)
                try:
                    img = Image.open(img_path)
                    img.verify()
                except Exception as e:
                    corrupted += 1
                    issues.append(f"Corrupted image: {split}/{category}/{img_file}")
            
            if corrupted > 0:
                print(f"      ⚠️  {corrupted} corrupted images detected")
        
        print(f"  Total: {total_images} images in {split}/")
        
        # Check split ratio
        if split == 'validation':
            train_path = os.path.join(dataset_path, 'train')
            if os.path.exists(train_path):
                train_total = sum(len([f for f in os.listdir(os.path.join(train_path, c))
                                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))])
                                 for c in os.listdir(train_path)
                                 if os.path.isdir(os.path.join(train_path, c)))
                
                if train_total > 0:
                    ratio = total_images / (train_total + total_images) * 100
                    print(f"  Split ratio: {ratio:.1f}% validation")
                    
                    if ratio < 15:
                        warnings.append(f"Validation split too small ({ratio:.1f}%), recommend 20%")
                    elif ratio > 30:
                        warnings.append(f"Validation split too large ({ratio:.1f}%), recommend 20%")
    
    # Summary
    print("\n" + "="*80)
    print("VALIDATION SUMMARY")
    print("="*80)
    
    if issues:
        print(f"\n❌ Found {len(issues)} issues:")
        for issue in issues:
            print(f"  - {issue}")
    
    if warnings:
        print(f"\n⚠️  Found {len(warnings)} warnings:")
        for warning in warnings:
            print(f"  - {warning}")
    
    if not issues and not warnings:
        print("\n✅ Dataset looks good! Ready to train.")
        return True
    elif not issues:
        print("\n⚠️  Dataset has warnings but can proceed with training")
        print("Consider addressing warnings for better results")
        return True
    else:
        print("\n❌ Please fix issues before training")
        return False

def show_recommendations():
    """Show recommendations based on validation"""
    print("\n" + "="*80)
    print("RECOMMENDATIONS")
    print("="*80)
    print("""
For best results:

1. Image Count:
   ✅ Minimum: 100 images per category
   ⭐ Recommended: 500-1000 images per category
   
2. Image Quality:
   ✅ Clear, well-lit photos
   ✅ Pet is main subject
   ✅ Various angles and backgrounds
   ✅ Different lighting conditions
   
3. Split Ratio:
   ✅ 80% training, 20% validation
   Example: 400 train, 100 validation per category
   
4. File Format:
   ✅ JPG, JPEG, PNG
   ✅ Any size (will be resized to 224x224)
   
5. Balance:
   ✅ Equal number of images per category
   ⚠️  Imbalanced data leads to biased predictions

Where to get more images:
- Kaggle: https://www.kaggle.com/datasets
- Oxford-IIIT: https://www.robots.ox.ac.uk/~vgg/data/pets/
- Google Images (check usage rights)
""")

if __name__ == '__main__':
    is_valid = validate_dataset()
    
    if is_valid:
        print("\n" + "="*80)
        print("READY TO TRAIN!")
        print("="*80)
        print("\nRun: py train_breed_classifier.py")
    else:
        show_recommendations()
        print("\n" + "="*80)
        print("FIX ISSUES FIRST")
        print("="*80)
        print("\nAfter fixing, run this script again to validate")
