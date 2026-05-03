"""
Train a model to predict specific pet breeds and species
This model will predict:
- Breed: Specific breed name (Beagle, Persian, etc.)
- Species: Dog or Cat
"""
import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import json
from datetime import datetime

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.001

# Paths
DATASET_PATH = 'dataset'
MODEL_SAVE_PATH = '../models/pet_breed_species_classifier'
HISTORY_PATH = 'training_history.json'

def determine_species_from_breed(breed_name):
    """
    Determine species from breed name
    Assumes breed folders are named like: Beagle, Golden_Retriever, Persian, Siamese
    """
    # Common dog breed keywords
    dog_keywords = ['dog', 'retriever', 'shepherd', 'terrier', 'bulldog', 'poodle', 
                    'beagle', 'boxer', 'husky', 'corgi', 'dachshund', 'chihuahua',
                    'labrador', 'golden', 'german', 'rottweiler', 'doberman', 'mastiff',
                    'spaniel', 'pointer', 'setter', 'hound']
    
    # Common cat breed keywords
    cat_keywords = ['cat', 'persian', 'siamese', 'maine', 'ragdoll', 'bengal',
                    'sphynx', 'british', 'russian', 'abyssinian', 'birman',
                    'burmese', 'himalayan', 'scottish', 'exotic']
    
    breed_lower = breed_name.lower()
    
    # Check for dog keywords
    for keyword in dog_keywords:
        if keyword in breed_lower:
            return 'Dog'
    
    # Check for cat keywords
    for keyword in cat_keywords:
        if keyword in breed_lower:
            return 'Cat'
    
    # Default: try to guess from common patterns
    # If it has multiple words and second word is capitalized, likely a dog breed
    # (e.g., Golden_Retriever, German_Shepherd)
    if '_' in breed_name:
        parts = breed_name.split('_')
        if len(parts) >= 2 and parts[1][0].isupper():
            return 'Dog'
    
    # Default to Dog if uncertain
    print(f"⚠️  Could not determine species for '{breed_name}', defaulting to Dog")
    return 'Dog'

def create_dual_output_model(num_breeds):
    """
    Create a model with two outputs:
    - Output 0: Breed classification (num_breeds classes)
    - Output 1: Species classification (2 classes: Dog, Cat)
    """
    # Base model (MobileNetV2 - efficient and accurate)
    base_model = MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model initially
    base_model.trainable = False
    
    # Input layer
    inputs = keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3), name='image')
    
    # Preprocessing
    x = layers.Rescaling(1./255)(inputs)
    
    # Base model
    x = base_model(x, training=False)
    
    # Global pooling
    x = layers.GlobalAveragePooling2D()(x)
    
    # Shared dense layers
    x = layers.Dense(512, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    
    # Output 1: Breed classification
    breed_output = layers.Dense(num_breeds, activation='softmax', name='breed_output')(x)
    
    # Output 2: Species classification (Dog/Cat)
    species_output = layers.Dense(2, activation='softmax', name='species_output')(x)
    
    # Create model
    model = keras.Model(inputs=inputs, outputs=[breed_output, species_output])
    
    return model, base_model

class DualOutputDataGenerator(keras.utils.Sequence):
    """
    Custom data generator that provides both breed and species labels
    """
    def __init__(self, image_generator, breed_to_species_map):
        self.image_generator = image_generator
        self.breed_to_species_map = breed_to_species_map
        self.num_breeds = len(breed_to_species_map)
        
    def __len__(self):
        return len(self.image_generator)
    
    def __getitem__(self, idx):
        # Get batch from image generator
        batch_x, batch_breed_y = self.image_generator[idx]
        
        # Create species labels
        batch_species_y = np.zeros((len(batch_breed_y), 2))
        
        for i, breed_label in enumerate(batch_breed_y):
            breed_idx = np.argmax(breed_label)
            breed_name = list(self.breed_to_species_map.keys())[breed_idx]
            species = self.breed_to_species_map[breed_name]
            species_idx = 0 if species == 'Dog' else 1
            batch_species_y[i, species_idx] = 1
        
        return batch_x, {'breed_output': batch_breed_y, 'species_output': batch_species_y}

def prepare_dataset(dataset_path):
    """
    Prepare dataset with data augmentation
    
    Expected folder structure:
    dataset/
        train/
            Beagle/
                image1.jpg
                image2.jpg
            Golden_Retriever/
            Persian/
            Siamese/
            ...
        validation/
            (same structure)
    """
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescaling=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        shear_range=0.2,
        fill_mode='nearest'
    )
    
    # Only rescaling for validation
    val_datagen = ImageDataGenerator(rescaling=1./255)
    
    # Load training data
    train_generator = train_datagen.flow_from_directory(
        os.path.join(dataset_path, 'train'),
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )
    
    # Load validation data
    val_generator = val_datagen.flow_from_directory(
        os.path.join(dataset_path, 'validation'),
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    # Create breed to species mapping
    breed_names = list(train_generator.class_indices.keys())
    breed_to_species = {breed: determine_species_from_breed(breed) for breed in breed_names}
    
    # Wrap generators for dual output
    train_dual = DualOutputDataGenerator(train_generator, breed_to_species)
    val_dual = DualOutputDataGenerator(val_generator, breed_to_species)
    
    return train_dual, val_dual, breed_names, breed_to_species

def train_model():
    """Main training function"""
    
    print("="*80)
    print("BREED & SPECIES CLASSIFICATION MODEL TRAINING")
    print("="*80)
    
    # Check if dataset exists
    if not os.path.exists(DATASET_PATH):
        print(f"\n❌ Dataset folder not found: {DATASET_PATH}")
        print("\nPlease create the dataset folder with this structure:")
        print("""
        dataset/
            train/
                Beagle/
                    image1.jpg
                    image2.jpg
                Boxer/
                Bulldog/
                Chihuahua/
                German_Shepherd/
                Golden_Retriever/
                Labrador_Retriever/
                Poodle/
                Rottweiler/
                Yorkshire_Terrier/
                Persian/
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
                (same structure)
        """)
        return
    
    # Prepare dataset
    print("\n1. Loading dataset...")
    try:
        train_gen, val_gen, breed_names, breed_to_species = prepare_dataset(DATASET_PATH)
        num_breeds = len(breed_names)
        
        print(f"✓ Dataset loaded successfully")
        print(f"  - Number of breeds: {num_breeds}")
        print(f"  - Breed names: {breed_names}")
        print(f"\n  - Species mapping:")
        for breed, species in breed_to_species.items():
            print(f"    {breed} → {species}")
        
        # Save metadata
        metadata = {
            'breed_names': breed_names,
            'breed_to_species': breed_to_species,
            'num_breeds': num_breeds
        }
        with open('model_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"\n  - Metadata saved to: model_metadata.json")
        
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Create model
    print("\n2. Creating model...")
    model, base_model = create_dual_output_model(num_breeds=num_breeds)
    print(f"✓ Model created")
    print(f"  - Total parameters: {model.count_params():,}")
    print(f"  - Trainable parameters: {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")
    
    # Compile model
    print("\n3. Compiling model...")
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss={
            'breed_output': 'categorical_crossentropy',
            'species_output': 'categorical_crossentropy'
        },
        loss_weights={
            'breed_output': 1.0,  # Primary task
            'species_output': 0.3  # Secondary task (easier)
        },
        metrics={
            'breed_output': ['accuracy', 'top_k_categorical_accuracy'],
            'species_output': ['accuracy']
        }
    )
    print("✓ Model compiled")
    
    # Callbacks
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            'best_model.keras',
            monitor='val_breed_output_accuracy',
            save_best_only=True,
            verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_breed_output_accuracy',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        keras.callbacks.TensorBoard(
            log_dir=f'logs/{datetime.now().strftime("%Y%m%d-%H%M%S")}',
            histogram_freq=1
        )
    ]
    
    # Train model (Phase 1: Frozen base)
    print("\n4. Training model (Phase 1: Transfer Learning)...")
    print(f"  - Epochs: {EPOCHS // 2}")
    print(f"  - Batch size: {BATCH_SIZE}")
    print(f"  - Learning rate: {LEARNING_RATE}")
    
    history1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS // 2,
        callbacks=callbacks,
        verbose=1
    )
    
    # Fine-tuning (Phase 2: Unfreeze base)
    print("\n5. Fine-tuning model (Phase 2: Unfreezing layers)...")
    base_model.trainable = True
    
    # Freeze first 100 layers
    for layer in base_model.layers[:100]:
        layer.trainable = False
    
    print(f"  - Trainable parameters: {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE / 10),
        loss={
            'breed_output': 'categorical_crossentropy',
            'species_output': 'categorical_crossentropy'
        },
        loss_weights={
            'breed_output': 1.0,
            'species_output': 0.3
        },
        metrics={
            'breed_output': ['accuracy', 'top_k_categorical_accuracy'],
            'species_output': ['accuracy']
        }
    )
    
    history2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS // 2,
        callbacks=callbacks,
        verbose=1
    )
    
    # Save final model
    print("\n6. Saving model...")
    
    # Save as SavedModel format (compatible with TensorFlow Serving)
    model.save(MODEL_SAVE_PATH, save_format='tf')
    print(f"✓ Model saved to: {MODEL_SAVE_PATH}")
    
    # Also save as Keras format
    model.save('final_model.keras')
    print(f"✓ Keras model saved to: final_model.keras")
    
    # Save training history
    history_combined = {
        'phase1': {k: [float(v) for v in vals] for k, vals in history1.history.items()},
        'phase2': {k: [float(v) for v in vals] for k, vals in history2.history.items()},
        'metadata': metadata,
        'config': {
            'img_size': IMG_SIZE,
            'batch_size': BATCH_SIZE,
            'epochs': EPOCHS,
            'learning_rate': LEARNING_RATE
        }
    }
    
    with open(HISTORY_PATH, 'w') as f:
        json.dump(history_combined, f, indent=2)
    print(f"✓ Training history saved to: {HISTORY_PATH}")
    
    # Evaluate model
    print("\n7. Evaluating model...")
    results = model.evaluate(val_gen)
    
    print(f"\n✓ Final validation results:")
    print(f"  - Breed accuracy: {results[3]:.2%}")
    print(f"  - Breed top-3 accuracy: {results[4]:.2%}")
    print(f"  - Species accuracy: {results[6]:.2%}")
    
    print("\n" + "="*80)
    print("TRAINING COMPLETE!")
    print("="*80)
    print(f"\nYour model can now predict:")
    print(f"  - {num_breeds} different breeds")
    print(f"  - 2 species (Dog/Cat)")
    print(f"\nNext steps:")
    print(f"1. Test model: py test_trained_model.py")
    print(f"2. Deploy model: Copy {MODEL_SAVE_PATH} to ../models/pet_breed_category_classifier")
    print(f"3. Update breed_classification.py with breeds from model_metadata.json")

if __name__ == '__main__':
    train_model()
