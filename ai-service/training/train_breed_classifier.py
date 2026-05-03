"""
Breed Classification Model Training Script
Train a model to classify pet breeds with a large dataset
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
DATASET_PATH = 'dataset'  # Your dataset folder
MODEL_SAVE_PATH = '../models/pet_breed_classifier_new'
HISTORY_PATH = 'training_history.json'

def create_model(num_breeds, num_species=2):
    """
    Create a multi-output model for breed and species classification
    
    Args:
        num_breeds: Number of breed categories
        num_species: Number of species (default 2 for Dog/Cat)
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
    
    # Dense layers
    x = layers.Dense(512, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    
    # Output 1: Breed categories
    breed_output = layers.Dense(num_breeds, activation='softmax', name='output_0')(x)
    
    # Output 2: Species (Dog/Cat)
    species_output = layers.Dense(num_species, activation='softmax', name='output_1')(x)
    
    # Create model
    model = keras.Model(inputs=inputs, outputs=[breed_output, species_output])
    
    return model, base_model

def prepare_dataset(dataset_path):
    """
    Prepare dataset with data augmentation
    
    Expected folder structure:
    dataset/
        train/
            breed_1/
                image1.jpg
                image2.jpg
            breed_2/
            ...
        validation/
            breed_1/
            breed_2/
            ...
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
    
    return train_generator, val_generator

def train_model():
    """Main training function"""
    
    print("="*80)
    print("BREED CLASSIFICATION MODEL TRAINING")
    print("="*80)
    
    # Check if dataset exists
    if not os.path.exists(DATASET_PATH):
        print(f"\n❌ Dataset folder not found: {DATASET_PATH}")
        print("\nPlease create the dataset folder with this structure:")
        print("""
        dataset/
            train/
                Small_Dog/
                    image1.jpg
                    image2.jpg
                Medium_Dog/
                Large_Dog/
                Small_Cat/
                Medium_Cat/
                Large_Cat/
            validation/
                Small_Dog/
                Medium_Dog/
                Large_Dog/
                Small_Cat/
                Medium_Cat/
                Large_Cat/
        """)
        return
    
    # Prepare dataset
    print("\n1. Loading dataset...")
    try:
        train_gen, val_gen = prepare_dataset(DATASET_PATH)
        num_breeds = train_gen.num_classes
        class_names = list(train_gen.class_indices.keys())
        
        print(f"✓ Dataset loaded successfully")
        print(f"  - Number of breed categories: {num_breeds}")
        print(f"  - Training samples: {train_gen.samples}")
        print(f"  - Validation samples: {val_gen.samples}")
        print(f"  - Class names: {class_names}")
        
        # Save class names
        with open('class_names.json', 'w') as f:
            json.dump(class_names, f, indent=2)
        print(f"  - Class names saved to: class_names.json")
        
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        return
    
    # Create model
    print("\n2. Creating model...")
    model, base_model = create_model(num_breeds=num_breeds)
    print(f"✓ Model created")
    print(f"  - Total parameters: {model.count_params():,}")
    
    # Compile model
    print("\n3. Compiling model...")
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss={
            'output_0': 'categorical_crossentropy',  # Breed loss
            'output_1': 'categorical_crossentropy'   # Species loss
        },
        loss_weights={
            'output_0': 1.0,  # Breed weight
            'output_1': 0.5   # Species weight (less important)
        },
        metrics=['accuracy']
    )
    print("✓ Model compiled")
    
    # Callbacks
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            'best_model.h5',
            monitor='val_loss',
            save_best_only=True,
            verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
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
    
    # Freeze first 100 layers, fine-tune the rest
    for layer in base_model.layers[:100]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE / 10),
        loss={
            'output_0': 'categorical_crossentropy',
            'output_1': 'categorical_crossentropy'
        },
        loss_weights={
            'output_0': 1.0,
            'output_1': 0.5
        },
        metrics=['accuracy']
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
    model.save(MODEL_SAVE_PATH)
    print(f"✓ Model saved to: {MODEL_SAVE_PATH}")
    
    # Save training history
    history_combined = {
        'phase1': history1.history,
        'phase2': history2.history,
        'class_names': class_names,
        'num_breeds': num_breeds,
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
    print(f"✓ Validation results:")
    print(f"  - Total loss: {results[0]:.4f}")
    print(f"  - Breed accuracy: {results[3]:.2%}")
    print(f"  - Species accuracy: {results[4]:.2%}")
    
    print("\n" + "="*80)
    print("TRAINING COMPLETE!")
    print("="*80)
    print(f"\nNext steps:")
    print(f"1. Replace old model: Copy {MODEL_SAVE_PATH} to ../models/pet_breed_category_classifier")
    print(f"2. Update breed_classification.py with class names from class_names.json")
    print(f"3. Test the new model with test images")

if __name__ == '__main__':
    train_model()
