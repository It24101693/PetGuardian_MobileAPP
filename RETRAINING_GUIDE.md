# Breed Classification Model - Retraining Guide

## Overview

Yes, you can retrain the model with a larger dataset! This guide will walk you through the entire process.

## Prerequisites

### 1. Install Required Packages

```bash
cd ai-service
pip install tensorflow pillow numpy scikit-learn matplotlib
```

### 2. Prepare Your Dataset

You need to organize your images in this structure:

```
ai-service/dataset/
    train/
        Small_Dog/
            dog1.jpg
            dog2.jpg
            ...
        Medium_Dog/
            dog1.jpg
            ...
        Large_Dog/
            dog1.jpg
            ...
        Small_Cat/
            cat1.jpg
            ...
        Medium_Cat/
            cat1.jpg
            ...
        Large_Cat/
            cat1.jpg
            ...
    validation/
        Small_Dog/
            dog1.jpg
            ...
        Medium_Dog/
            ...
        (same structure as train)
```

**Important Notes:**
- Each folder name becomes a category (you can use any names you want)
- Recommended: 80% of images in `train/`, 20% in `validation/`
- Minimum: 100 images per category (more is better!)
- Recommended: 500-1000+ images per category for good accuracy

## Dataset Options

### Option A: Use Your Own Images

Collect pet images and organize them into categories based on:
- **Size**: Small/Medium/Large for both dogs and cats (6 categories)
- **Breed Groups**: Sporting/Working/Terrier/Toy/Domestic Cat/Persian Cat (6 categories)
- **Specific Breeds**: If you want specific breeds, you can have as many categories as you want

### Option B: Download Public Datasets

**1. Oxford-IIIT Pet Dataset** (37 breeds, ~200 images each)
- Download: https://www.robots.ox.ac.uk/~vgg/data/pets/
- Contains 25 dog breeds and 12 cat breeds
- Total: ~7,400 images

**2. Stanford Dogs Dataset** (120 dog breeds, ~150 images each)
- Download: http://vision.stanford.edu/aditya86/ImageNetDogs/
- Total: ~20,000 dog images

**3. Kaggle Datasets**
- Dogs vs Cats: https://www.kaggle.com/c/dogs-vs-cats
- Dog Breed Identification: https://www.kaggle.com/c/dog-breed-identification
- Cat Breeds: https://www.kaggle.com/datasets/ma7555/cat-breeds-dataset

### Option C: Combine Multiple Sources

Mix images from different sources to create a larger, more diverse dataset.

## Training Process

### Step 1: Organize Your Dataset

Create the folder structure shown above. Example script to help:

```python
# organize_dataset.py
import os
import shutil
from sklearn.model_selection import train_test_split

# If you have all images in one folder, this script splits them
source_folder = 'all_images'
categories = ['Small_Dog', 'Medium_Dog', 'Large_Dog', 'Small_Cat', 'Medium_Cat', 'Large_Cat']

for category in categories:
    os.makedirs(f'dataset/train/{category}', exist_ok=True)
    os.makedirs(f'dataset/validation/{category}', exist_ok=True)

# Move your images to appropriate folders
# You'll need to manually categorize them or use existing labels
```

### Step 2: Run Training Script

```bash
cd ai-service/training
py train_breed_classifier.py
```

The script will:
1. Load your dataset
2. Create a model with MobileNetV2 backbone
3. Train in two phases:
   - Phase 1: Transfer learning (frozen base)
   - Phase 2: Fine-tuning (unfrozen layers)
4. Save the best model
5. Generate training history and metrics

### Step 3: Monitor Training

Training will show:
```
Epoch 1/25
100/100 [==============================] - 45s 450ms/step
  - loss: 2.1234
  - output_0_accuracy: 0.6543  (breed accuracy)
  - output_1_accuracy: 0.9876  (species accuracy)
  - val_loss: 1.8765
  - val_output_0_accuracy: 0.7123
  - val_output_1_accuracy: 0.9912
```

Good signs:
- Accuracy increasing over epochs
- Validation accuracy close to training accuracy (not overfitting)
- Species accuracy should be very high (>95%)
- Breed accuracy depends on difficulty (70-90% is good)

### Step 4: Replace Old Model

After training completes:

```bash
# Backup old model
cd ai-service
mv models/pet_breed_category_classifier models/pet_breed_category_classifier_old

# Copy new model
cp -r training/models/pet_breed_classifier_new models/pet_breed_category_classifier
```

### Step 5: Update Code

Update `ai-service/services/breed_classification.py` with your new class names:

```python
# Read class names from training
import json
with open('training/class_names.json', 'r') as f:
    class_names = json.load(f)

# Update BREED_CATEGORIES
BREED_CATEGORIES = {
    class_names[0]: {'species': 'Dog', 'breed': class_names[0]},
    class_names[1]: {'species': 'Dog', 'breed': class_names[1]},
    # ... etc
}
```

## Training Tips

### For Better Accuracy

1. **More Data**: Aim for 500-1000+ images per category
2. **Balanced Dataset**: Equal number of images per category
3. **Image Quality**: Clear, well-lit, focused on the pet
4. **Variety**: Different angles, backgrounds, lighting conditions
5. **Data Augmentation**: Already included in the script

### For Faster Training

1. **Use GPU**: If you have NVIDIA GPU, install `tensorflow-gpu`
2. **Reduce Image Size**: Change `IMG_SIZE = 224` to `IMG_SIZE = 160`
3. **Smaller Model**: Use MobileNetV2 (already default) instead of ResNet
4. **Fewer Epochs**: Reduce `EPOCHS = 50` to `EPOCHS = 25`

### For More Categories

Want to classify specific breeds instead of size categories?

1. Create more folders (e.g., 20 breeds instead of 6 categories)
2. The script automatically detects the number of categories
3. Need more training data per breed (minimum 100 images each)

## Recommended Dataset Structure

### Option 1: Size-Based (6 categories) - EASIEST

```
dataset/
    train/
        Small_Dog/      (< 10kg: Chihuahua, Pomeranian, etc.)
        Medium_Dog/     (10-25kg: Beagle, Bulldog, etc.)
        Large_Dog/      (> 25kg: German Shepherd, Golden Retriever, etc.)
        Small_Cat/      (< 4kg: Siamese, Abyssinian, etc.)
        Medium_Cat/     (4-6kg: British Shorthair, etc.)
        Large_Cat/      (> 6kg: Maine Coon, Ragdoll, etc.)
    validation/
        (same structure)
```

### Option 2: Specific Breeds (20+ categories) - MORE ACCURATE

```
dataset/
    train/
        Beagle/
        Boxer/
        Bulldog/
        Chihuahua/
        German_Shepherd/
        Golden_Retriever/
        Labrador_Retriever/
        Poodle/
        Rottweiler/
        Yorkshire_Terrier/
        Abyssinian/
        Bengal/
        British_Shorthair/
        Maine_Coon/
        Persian/
        Ragdoll/
        Russian_Blue/
        Siamese/
        Sphynx/
        Birman/
    validation/
        (same structure)
```

## Training Time Estimates

- **CPU only**: 2-4 hours for 6 categories with 3000 images
- **GPU (NVIDIA)**: 20-40 minutes for 6 categories with 3000 images
- **More categories**: Add ~30% time per additional 10 categories

## After Training

1. **Test the model**:
```bash
cd ai-service
py test_breed_prediction.py
```

2. **Check accuracy**:
   - Look at `training_history.json` for metrics
   - Test with real images using `test_with_images.py`

3. **Deploy**:
   - Restart your Flask app
   - Test in the frontend by uploading pet images

## Troubleshooting

### "Not enough images" error
- Need minimum 100 images per category
- Add more images or reduce number of categories

### Low accuracy (<60%)
- Need more training data
- Images might be too varied or low quality
- Try training for more epochs

### Overfitting (train accuracy >> validation accuracy)
- Add more data augmentation
- Increase dropout rates
- Reduce model complexity

### Out of memory
- Reduce `BATCH_SIZE` from 32 to 16 or 8
- Reduce `IMG_SIZE` from 224 to 160

## Quick Start Commands

```bash
# 1. Prepare dataset folder
cd ai-service
mkdir -p dataset/train dataset/validation

# 2. Organize your images into category folders
# (do this manually or with a script)

# 3. Install dependencies
pip install tensorflow pillow numpy scikit-learn

# 4. Start training
cd training
py train_breed_classifier.py

# 5. Wait for training to complete (30 min - 4 hours)

# 6. Replace old model
cd ..
mv models/pet_breed_category_classifier models/pet_breed_category_classifier_old
cp -r training/models/pet_breed_classifier_new models/pet_breed_category_classifier

# 7. Update breed_classification.py with new class names

# 8. Test
py test_breed_prediction.py
```

## Need Help?

If you need help with:
- Finding/downloading datasets
- Organizing images into categories
- Adjusting the training script
- Improving accuracy

Just ask!

---

**Ready to start?** Let me know:
1. How many categories do you want? (6 size-based or 20+ specific breeds)
2. Do you have images already, or need help finding datasets?
3. Do you have a GPU for faster training?
