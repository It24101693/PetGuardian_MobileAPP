# Complete Guide: Train Breed & Species Classification Model

## What This Model Does

Your trained model will predict:
- **Breed**: Specific breed name (Beagle, Persian, Golden Retriever, etc.)
- **Species**: Dog or Cat (automatically determined from breed)

## Step-by-Step Instructions

### Step 1: Prepare Your Dataset (1-3 hours)

#### Option A: Download Kaggle Dataset (Recommended)

1. **Create Kaggle account** (free): https://www.kaggle.com/

2. **Download datasets**:
   
   **For Dogs** (choose one):
   - Dog Breed Identification (120 breeds, 10,000+ images)
     https://www.kaggle.com/c/dog-breed-identification/data
   
   - Stanford Dogs (120 breeds, 20,000+ images)
     https://www.kaggle.com/datasets/jessicali9530/stanford-dogs-dataset

   **For Cats** (choose one):
   - Cat Breeds (67 breeds, 10,000+ images)
     https://www.kaggle.com/datasets/ma7555/cat-breeds-dataset
   
   - Cats and Dogs (12,500 cat images)
     https://www.kaggle.com/c/dogs-vs-cats/data

3. **Extract the downloaded files**

#### Option B: Use Your Own Images

Collect at least 100 images per breed (500+ recommended)

### Step 2: Organize Dataset (30 minutes)

Create this folder structure:

```
ai-service/training/dataset/
    train/
        Beagle/
            dog1.jpg
            dog2.jpg
            ... (400+ images)
        Boxer/
            dog1.jpg
            ... (400+ images)
        Bulldog/
        Chihuahua/
        German_Shepherd/
        Golden_Retriever/
        Labrador_Retriever/
        Poodle/
        Rottweiler/
        Yorkshire_Terrier/
        Persian/
            cat1.jpg
            ... (400+ images)
        Siamese/
        Maine_Coon/
        British_Shorthair/
        Ragdoll/
        Bengal/
        Sphynx/
        Russian_Blue/
        Abyssinian/
        Birman/
    validation/
        Beagle/
            dog1.jpg
            ... (100+ images)
        Boxer/
        ... (same breeds as train)
```

**Important:**
- Folder names become breed names (use underscores for spaces: `Golden_Retriever`)
- 80% of images in `train/`, 20% in `validation/`
- Minimum: 100 images per breed
- Recommended: 500+ images per breed

**Quick organize script:**
```python
# organize_by_breed.py
import os
import shutil
from sklearn.model_selection import train_test_split

# If you have all images in one folder per breed
source_folder = 'downloaded_images'
dest_folder = 'dataset'

breeds = ['Beagle', 'Boxer', 'Persian', 'Siamese']  # Add all your breeds

for breed in breeds:
    breed_path = os.path.join(source_folder, breed)
    if not os.path.exists(breed_path):
        continue
    
    images = [f for f in os.listdir(breed_path) if f.endswith(('.jpg', '.png'))]
    
    # Split 80/20
    train_imgs, val_imgs = train_test_split(images, test_size=0.2, random_state=42)
    
    # Create folders
    os.makedirs(f'{dest_folder}/train/{breed}', exist_ok=True)
    os.makedirs(f'{dest_folder}/validation/{breed}', exist_ok=True)
    
    # Copy files
    for img in train_imgs:
        shutil.copy(
            os.path.join(breed_path, img),
            f'{dest_folder}/train/{breed}/{img}'
        )
    
    for img in val_imgs:
        shutil.copy(
            os.path.join(breed_path, img),
            f'{dest_folder}/validation/{breed}/{img}'
        )
    
    print(f"{breed}: {len(train_imgs)} train, {len(val_imgs)} validation")
```

### Step 3: Validate Dataset (2 minutes)

```bash
cd ai-service/training
py validate_dataset.py
```

This checks:
- ✅ Folder structure is correct
- ✅ Enough images per breed
- ✅ Images are not corrupted
- ✅ Train/validation split is good

### Step 4: Train the Model (30 min - 4 hours)

```bash
py train_breed_species_classifier.py
```

**What you'll see:**

```
================================================================================
BREED & SPECIES CLASSIFICATION MODEL TRAINING
================================================================================

1. Loading dataset...
✓ Dataset loaded successfully
  - Number of breeds: 20
  - Breed names: ['Beagle', 'Boxer', 'Bulldog', ...]
  
  - Species mapping:
    Beagle → Dog
    Boxer → Dog
    Persian → Cat
    Siamese → Cat
    ...

2. Creating model...
✓ Model created
  - Total parameters: 3,538,984

3. Compiling model...
✓ Model compiled

4. Training model (Phase 1: Transfer Learning)...
  - Epochs: 25
  - Batch size: 32
  - Learning rate: 0.001

Epoch 1/25
100/100 [==============================] - 45s 450ms/step
  - loss: 2.5432
  - breed_output_accuracy: 0.3456
  - breed_output_top_k_categorical_accuracy: 0.6789
  - species_output_accuracy: 0.9123
  - val_loss: 2.1234
  - val_breed_output_accuracy: 0.4567
  - val_species_output_accuracy: 0.9456

Epoch 2/25
...

[Training continues for 25 epochs]

5. Fine-tuning model (Phase 2: Unfreezing layers)...
  - Trainable parameters: 2,257,984

Epoch 26/50
...

6. Saving model...
✓ Model saved to: ../models/pet_breed_species_classifier
✓ Keras model saved to: final_model.keras
✓ Training history saved to: training_history.json

7. Evaluating model...

✓ Final validation results:
  - Breed accuracy: 87.34%
  - Breed top-3 accuracy: 96.78%
  - Species accuracy: 99.12%

================================================================================
TRAINING COMPLETE!
================================================================================

Your model can now predict:
  - 20 different breeds
  - 2 species (Dog/Cat)
```

**Training Time Estimates:**

| Breeds | Images | Hardware | Time |
|--------|--------|----------|------|
| 10 | 5,000 | CPU | 2 hours |
| 10 | 5,000 | GPU | 30 min |
| 20 | 10,000 | CPU | 4 hours |
| 20 | 10,000 | GPU | 1 hour |
| 50 | 25,000 | CPU | 8 hours |
| 50 | 25,000 | GPU | 2 hours |

### Step 5: Test the Model (5 minutes)

```bash
# Test with a single image
py test_trained_model.py path/to/dog.jpg

# Or create test_images folder and test multiple
mkdir ../test_images
# Add some test images
py test_trained_model.py
```

**Example output:**

```
================================================================================
Testing: ../test_images/golden_retriever.jpg
================================================================================

🐾 PREDICTION RESULTS:
  Breed: Golden_Retriever
  Confidence: 94.56%

  Species: Dog
  Confidence: 99.87%

  Expected species: Dog
  ✓ Species matches breed!

  Top 3 breeds:
    1. Golden_Retriever (94.56%)
    2. Labrador_Retriever (3.21%)
    3. Irish_Setter (1.45%)
```

### Step 6: Deploy the Model (5 minutes)

```bash
cd ai-service

# Backup old model
mv models/pet_breed_category_classifier models/pet_breed_category_classifier_backup

# Deploy new model
cp -r training/models/pet_breed_species_classifier models/pet_breed_category_classifier
```

### Step 7: Update Code (10 minutes)

Update `ai-service/services/breed_classification.py`:

```python
import json
import os

# Load breed metadata
METADATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'training', 'model_metadata.json')

with open(METADATA_PATH, 'r') as f:
    metadata = json.load(f)

# Create BREED_CATEGORIES from metadata
BREED_CATEGORIES = {}
for breed_name in metadata['breed_names']:
    species = metadata['breed_to_species'][breed_name]
    # Convert underscore to space for display
    display_name = breed_name.replace('_', ' ')
    BREED_CATEGORIES[breed_name] = {
        'species': species,
        'breed': display_name
    }

# Update the predict function to use the new model structure
def predict(self, image_file):
    """Predict breed from image"""
    try:
        self.load_model()
        processed_img = self.preprocess_image(image_file)
        
        # Model returns [breed_probs, species_probs]
        breed_probs, species_probs = self.model.predict(processed_img, verbose=0)
        
        # Get breed prediction
        breed_idx = np.argmax(breed_probs[0])
        breed_conf = float(breed_probs[0][breed_idx])
        
        # Get species prediction
        species_idx = np.argmax(species_probs[0])
        species_conf = float(species_probs[0][species_idx])
        species_name = "Dog" if species_idx == 0 else "Cat"
        
        # Get breed info
        breed_keys = list(BREED_CATEGORIES.keys())
        if breed_idx < len(breed_keys):
            breed_key = breed_keys[breed_idx]
            breed_info = BREED_CATEGORIES[breed_key]
        else:
            breed_info = {'species': species_name, 'breed': 'Unknown'}
        
        # Get top 3 predictions
        top3_indices = np.argsort(breed_probs[0])[-3:][::-1]
        top3_predictions = []
        
        for idx in top3_indices:
            if idx < len(breed_keys):
                key = breed_keys[idx]
                info = BREED_CATEGORIES[key]
                top3_predictions.append({
                    'species': info['species'],
                    'breed': info['breed'],
                    'confidence': float(breed_probs[0][idx])
                })
        
        return {
            'species': breed_info['species'],
            'breed': breed_info['breed'],
            'confidence': breed_conf,
            'top3Predictions': top3_predictions
        }
        
    except Exception as e:
        print(f"Breed prediction error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
```

### Step 8: Test in Application (2 minutes)

```bash
cd ai-service
py app.py
```

Then test in your frontend by uploading pet images!

## Expected Results

### Good Results:
- **Breed accuracy**: 75-90% (depends on breed similarity)
- **Top-3 accuracy**: 90-98% (correct breed in top 3)
- **Species accuracy**: 95-99% (very high)

### If Accuracy is Low (<70%):

1. **Add more training data**
   - Need 500+ images per breed
   - More variety (angles, lighting, backgrounds)

2. **Train for more epochs**
   - Change `EPOCHS = 50` to `EPOCHS = 75` or `EPOCHS = 100`

3. **Check data quality**
   - Remove corrupted images
   - Ensure images are correctly labeled

4. **Reduce number of breeds**
   - Start with 10-15 breeds
   - Add more breeds later

## Recommended Breed Sets

### Starter Set (10 breeds - Easy to train):

**Dogs (5):**
- Beagle
- Bulldog
- German_Shepherd
- Golden_Retriever
- Labrador_Retriever

**Cats (5):**
- Persian
- Siamese
- Maine_Coon
- British_Shorthair
- Bengal

### Standard Set (20 breeds - Recommended):

**Dogs (10):**
- Beagle, Boxer, Bulldog, Chihuahua, German_Shepherd
- Golden_Retriever, Labrador_Retriever, Poodle, Rottweiler, Yorkshire_Terrier

**Cats (10):**
- Persian, Siamese, Maine_Coon, British_Shorthair, Ragdoll
- Bengal, Sphynx, Russian_Blue, Abyssinian, Birman

### Advanced Set (50+ breeds - For production):

Use full Kaggle datasets with 50-120 breeds

## Troubleshooting

### "Not enough images" error
- Need minimum 100 images per breed
- Add more images or reduce number of breeds

### Out of memory
- Reduce `BATCH_SIZE` from 32 to 16 or 8
- Reduce `IMG_SIZE` from 224 to 160
- Close other applications

### Training too slow
- Use GPU (10x faster)
- Reduce number of breeds
- Reduce `EPOCHS` from 50 to 25

### Low accuracy
- Add more training data (500+ per breed)
- Train for more epochs
- Check data quality
- Use data augmentation (already included)

## Files Created

After training, you'll have:
- `models/pet_breed_species_classifier/` - Trained model
- `model_metadata.json` - Breed names and species mapping
- `training_history.json` - Training metrics
- `best_model.keras` - Best model checkpoint
- `logs/` - TensorBoard logs

## Next Steps

1. **Monitor performance** in production
2. **Collect user feedback** on predictions
3. **Retrain periodically** with new images
4. **Add more breeds** as needed

---

**Ready to start?** Run:
```bash
cd ai-service/training
py validate_dataset.py
py train_breed_species_classifier.py
```

Good luck with your training! 🐕🐈
