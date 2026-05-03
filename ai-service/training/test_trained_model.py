"""
Test the trained breed and species classification model
"""
import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image
import sys

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

MODEL_PATH = '../models/pet_breed_species_classifier'
METADATA_PATH = 'model_metadata.json'

def load_model_and_metadata():
    """Load the trained model and metadata"""
    print("Loading model...")
    
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model not found at: {MODEL_PATH}")
        print("\nTrain the model first:")
        print("  py train_breed_species_classifier.py")
        return None, None
    
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✓ Model loaded")
    
    if not os.path.exists(METADATA_PATH):
        print(f"⚠️  Metadata not found at: {METADATA_PATH}")
        metadata = None
    else:
        with open(METADATA_PATH, 'r') as f:
            metadata = json.load(f)
        print("✓ Metadata loaded")
        print(f"  - Breeds: {len(metadata['breed_names'])}")
    
    return model, metadata

def preprocess_image(image_path, img_size=224):
    """Preprocess image for prediction"""
    img = Image.open(image_path).convert('RGB')
    img = img.resize((img_size, img_size))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0).astype(np.float32)
    return img_array

def predict_image(model, metadata, image_path):
    """Predict breed and species for an image"""
    print(f"\n{'='*80}")
    print(f"Testing: {image_path}")
    print(f"{'='*80}")
    
    # Preprocess
    img_array = preprocess_image(image_path)
    
    # Predict
    breed_probs, species_probs = model.predict(img_array, verbose=0)
    
    # Get breed prediction
    breed_idx = np.argmax(breed_probs[0])
    breed_conf = breed_probs[0][breed_idx]
    
    if metadata:
        breed_name = metadata['breed_names'][breed_idx]
        expected_species = metadata['breed_to_species'][breed_name]
    else:
        breed_name = f"Breed_{breed_idx}"
        expected_species = "Unknown"
    
    # Get species prediction
    species_idx = np.argmax(species_probs[0])
    species_conf = species_probs[0][species_idx]
    species_name = "Dog" if species_idx == 0 else "Cat"
    
    # Display results
    print(f"\n🐾 PREDICTION RESULTS:")
    print(f"  Breed: {breed_name}")
    print(f"  Confidence: {breed_conf:.2%}")
    print(f"\n  Species: {species_name}")
    print(f"  Confidence: {species_conf:.2%}")
    
    if metadata:
        print(f"\n  Expected species: {expected_species}")
        if species_name == expected_species:
            print("  ✓ Species matches breed!")
        else:
            print("  ⚠️  Species mismatch!")
    
    # Top 3 breeds
    top3_indices = np.argsort(breed_probs[0])[-3:][::-1]
    print(f"\n  Top 3 breeds:")
    for i, idx in enumerate(top3_indices, 1):
        if metadata:
            name = metadata['breed_names'][idx]
        else:
            name = f"Breed_{idx}"
        conf = breed_probs[0][idx]
        print(f"    {i}. {name} ({conf:.2%})")
    
    return breed_name, species_name, breed_conf, species_conf

def test_folder(model, metadata, folder_path):
    """Test all images in a folder"""
    if not os.path.exists(folder_path):
        print(f"❌ Folder not found: {folder_path}")
        return
    
    image_files = [f for f in os.listdir(folder_path)
                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
    
    if not image_files:
        print(f"❌ No images found in: {folder_path}")
        return
    
    print(f"\nTesting {len(image_files)} images from: {folder_path}")
    
    results = []
    for img_file in image_files:
        img_path = os.path.join(folder_path, img_file)
        try:
            breed, species, breed_conf, species_conf = predict_image(model, metadata, img_path)
            results.append({
                'file': img_file,
                'breed': breed,
                'species': species,
                'breed_conf': breed_conf,
                'species_conf': species_conf
            })
        except Exception as e:
            print(f"❌ Error processing {img_file}: {e}")
    
    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Total images tested: {len(results)}")
    
    if results:
        avg_breed_conf = np.mean([r['breed_conf'] for r in results])
        avg_species_conf = np.mean([r['species_conf'] for r in results])
        print(f"Average breed confidence: {avg_breed_conf:.2%}")
        print(f"Average species confidence: {avg_species_conf:.2%}")
        
        # Breed distribution
        breed_counts = {}
        for r in results:
            breed_counts[r['breed']] = breed_counts.get(r['breed'], 0) + 1
        
        print(f"\nBreed distribution:")
        for breed, count in sorted(breed_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  {breed}: {count}")

def main():
    """Main test function"""
    print("\n" + "="*80)
    print("BREED & SPECIES MODEL TESTER")
    print("="*80)
    
    # Load model
    model, metadata = load_model_and_metadata()
    if model is None:
        return
    
    # Check for test images
    test_folder_path = '../test_images'
    
    if len(sys.argv) > 1:
        # Test specific image
        image_path = sys.argv[1]
        if os.path.exists(image_path):
            predict_image(model, metadata, image_path)
        else:
            print(f"❌ Image not found: {image_path}")
    elif os.path.exists(test_folder_path):
        # Test folder
        test_folder(model, metadata, test_folder_path)
    else:
        print(f"\n⚠️  No test images found")
        print(f"\nUsage:")
        print(f"  1. Test single image:")
        print(f"     py test_trained_model.py path/to/image.jpg")
        print(f"\n  2. Test folder:")
        print(f"     Create folder: {test_folder_path}/")
        print(f"     Add images to folder")
        print(f"     Run: py test_trained_model.py")

if __name__ == '__main__':
    main()
