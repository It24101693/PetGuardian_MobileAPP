import os
import numpy as np
from PIL import Image
import tensorflow as tf
import keras
from keras.preprocessing.image import img_to_array

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'pet_breed_model.h5')

# --- Class names from test_model.py ---
CLASS_NAMES = [
    'Abyssinian', 'american_bulldog', 'american_pit_bull_terrier', 'basset_hound', 'beagle', 
    'Bengal', 'Birman', 'Bombay', 'boxer', 'British_Shorthair', 'chihuahua', 'Egyptian_Mau', 
    'english_cocker_spaniel', 'english_setter', 'german_shorthaired', 'great_pyrenees', 'havanese', 
    'japanese_chin', 'keeshond', 'leonberger', 'Maine_Coon', 'miniature_pinscher', 'newfoundland', 
    'Persian', 'pomeranian', 'pug', 'Ragdoll', 'Russian_Blue', 'saint_bernard', 'samoyed', 
    'scottish_terrier', 'shiba_inu', 'Siamese', 'Sphynx', 'staffordshire_bull_terrier', 
    'wheaten_terrier', 'yorkshire_terrier'
]

# --- Cat breed names (from test_model.py) ---
CAT_BREEDS = {
    'Abyssinian', 'Bengal', 'Birman', 'Bombay', 'British_Shorthair',
    'Egyptian_Mau', 'Maine_Coon', 'Persian', 'Ragdoll', 'Russian_Blue',
    'Siamese', 'Sphynx'
}

# --- Helper to format breed names for display ---
def format_breed_name(name):
    return name.replace('_', ' ').title()

class BreedClassificationService:
    def __init__(self):
        self.model = None
        self.input_shape = (224, 224)
        
    def load_model(self):
        """Load the breed classification model (.h5)"""
        if self.model is None:
            if not os.path.exists(MODEL_PATH):
                print(f"Error: Model file not found at {MODEL_PATH}")
                return
                
            print(f"Loading breed classification model from {MODEL_PATH}...")
            try:
                # Load using safe loader that handles DTypePolicy
                from model_loader import load_model_safe
                self.model = load_model_safe(MODEL_PATH, compile=False)
                print("Breed classification model (.h5) loaded successfully")
            except Exception as e:
                print(f"Error loading breed classification model: {e}")
                raise
    
    def preprocess_image(self, image_file):
        """Preprocess image for breed classification"""
        try:
            # Reset file pointer
            image_file.seek(0)
            
            # Open and convert image
            img = Image.open(image_file).convert('RGB')
            
            # Resize to model input size (224, 224 as per test_model.py)
            img = img.resize(self.input_shape)
            
            # Convert to array and normalize
            img_array = img_to_array(img)
            img_array = img_array / 255.0  # Normalize to [0, 1]
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array.astype(np.float32)
            
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            raise
    
    def predict(self, image_file):
        """Predict breed from image"""
        try:
            # Load model if not already loaded
            self.load_model()
            
            if self.model is None:
                raise Exception("Model could not be loaded")
                
            # Preprocess image
            processed_img = self.preprocess_image(image_file)
            
            # Make prediction
            preds = self.model.predict(processed_img)
            score = preds[0]
            
            # Get top prediction
            class_idx = np.argmax(score)
            confidence = float(score[class_idx])
            
            # Class name and formatting
            predicted_class = CLASS_NAMES[class_idx]
            breed_name = format_breed_name(predicted_class)
            
            # Determine species
            species = "Cat" if predicted_class in CAT_BREEDS else "Dog"
            
            print(f"Predicted: {breed_name} ({species}) - Confidence: {confidence:.2%}")
            
            # Get top 3 predictions
            top_3_indices = np.argsort(score)[-3:][::-1]
            top_3_predictions = []
            
            for idx in top_3_indices:
                name = CLASS_NAMES[idx]
                top_3_predictions.append({
                    'species': "Cat" if name in CAT_BREEDS else "Dog",
                    'breed': format_breed_name(name),
                    'confidence': float(score[idx])
                })
            
            return {
                'species': species,
                'breed': breed_name,
                'confidence': confidence,
                'top3Predictions': top_3_predictions
            }
            
        except Exception as e:
            print(f"Breed prediction error: {str(e)}")
            raise

# Create singleton instance
breed_service = BreedClassificationService()
