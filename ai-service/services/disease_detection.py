import os
import pickle
import numpy as np
from PIL import Image
import keras
from keras.preprocessing.image import img_to_array

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'dieseasDetect', 'fine_tuned_model.h5')
CLASS_NAMES_PATH = os.path.join(os.path.dirname(__file__), '..', 'dieseasDetect', 'class_names.pkl')

class DiseaseDetectionService:
    def __init__(self):
        self.model = None
        self.class_names = None
        self.input_shape = (224, 224)

    def load_resources(self):
        if self.model is None:
            print(f"Loading AI model from {MODEL_PATH} (Inference-only mode)...")
            try:
                from model_loader import load_model_safe
                self.model = load_model_safe(MODEL_PATH, compile=False)
                print("Model loaded successfully")
                try:
                    shape = self.model.input_shape
                    if hasattr(shape, 'as_list'):
                        shape = shape.as_list()
                    if shape and len(shape) >= 3 and shape[1] and shape[2]:
                        self.input_shape = (shape[1], shape[2])
                        print(f"Input shape: {self.input_shape}")
                except Exception as e:
                    print(f"Using default input shape: {self.input_shape}")
            except Exception as e:
                print(f"Error loading model: {e}")
                import traceback
                traceback.print_exc()
                raise

        if self.class_names is None:
            print(f"Loading class names...")
            try:
                with open(CLASS_NAMES_PATH, 'rb') as f:
                    self.class_names = pickle.load(f)
                print(f"Loaded {len(self.class_names)} classes")
            except Exception as e:
                print(f"Error loading class names: {e}")
                raise

    def preprocess_image(self, image_file):
        image_file.seek(0)
        img = Image.open(image_file).convert('RGB')
        img = img.resize(self.input_shape)
        img_array = img_to_array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def predict(self, image_file):
        try:
            self.load_resources()
            processed_img = self.preprocess_image(image_file)
            predictions = self.model.predict(processed_img, verbose=0)
            score = predictions[0]
            class_idx = np.argmax(score)
            class_name = self.class_names[class_idx]
            probability = float(score[class_idx])
            print(f"Predicted: {class_name} ({probability:.2%})")
            return {
                'diseaseName': class_name,
                'probability': probability,
                'allScores': {self.class_names[i]: float(score[i]) for i in range(len(self.class_names))}
            }
        except Exception as e:
            print(f"Prediction error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

disease_service = DiseaseDetectionService()
