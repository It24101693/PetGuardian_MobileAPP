"""
AI Service Configuration
Centralized configuration for model paths and service settings
"""
import os

# Model Paths
CUSTOM_DISEASE_MODEL_PATH = r"C:\Users\ASUS\IdeaProjects\AI\pet_disease_model.h5"
DEFAULT_DISEASE_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'dieseasDetect', 'fine_tuned_model.h5')
CLASS_NAMES_PATH = os.path.join(os.path.dirname(__file__), 'dieseasDetect', 'class_names.pkl')

# Breed Classification Model
BREED_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'pet_breed_category_classifier')
BREED_MODEL_H5_PATH = os.path.join(os.path.dirname(__file__), 'models', 'pet_breed_model.h5')

# Service Settings
AI_SERVICE_PORT = 5000
AI_SERVICE_HOST = '0.0.0.0'
DEBUG_MODE = False

# Image Processing
MAX_IMAGE_SIZE_MB = 5
SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
DEFAULT_INPUT_SHAPE = (224, 224)

# Model Selection
def get_disease_model_path():
    """Get the disease model path, preferring custom model if it exists"""
    if os.path.exists(CUSTOM_DISEASE_MODEL_PATH):
        print(f"[OK] Using custom disease model: {CUSTOM_DISEASE_MODEL_PATH}")
        return CUSTOM_DISEASE_MODEL_PATH
    else:
        print(f"[WARN] Custom model not found, using default: {DEFAULT_DISEASE_MODEL_PATH}")
        return DEFAULT_DISEASE_MODEL_PATH

# Confidence Thresholds
CONFIDENCE_HIGH = 0.8
CONFIDENCE_MEDIUM = 0.6

# Emergency Response Settings
EMERGENCY_NOTIFICATION_ENABLED = True
AUTO_VET_SEARCH_ON_EMERGENCY = True
