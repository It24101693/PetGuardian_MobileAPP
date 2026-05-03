import os
import pickle
import numpy as np
from PIL import Image
import keras
from keras.preprocessing.image import img_to_array
from config import get_disease_model_path, CLASS_NAMES_PATH, DEFAULT_INPUT_SHAPE

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Disease metadata with emergency classification and treatments
DISEASE_DATABASE = {
    'Parvovirus': {
        'emergency': True,
        'severity': 'Critical',
        'symptoms': ['Severe vomiting', 'Bloody diarrhea', 'Lethargy', 'Loss of appetite'],
        'treatment': 'IMMEDIATE VETERINARY CARE REQUIRED - This is a life-threatening condition requiring hospitalization, IV fluids, and intensive care.',
        'urgency_message': '🚨 EMERGENCY: Seek veterinary care within 1 hour'
    },
    'Distemper': {
        'emergency': True,
        'severity': 'Critical',
        'symptoms': ['Fever', 'Nasal discharge', 'Coughing', 'Seizures'],
        'treatment': 'IMMEDIATE VETERINARY CARE REQUIRED - Highly contagious and potentially fatal. Requires immediate professional treatment.',
        'urgency_message': '🚨 EMERGENCY: Seek veterinary care immediately'
    },
    'Rabies': {
        'emergency': True,
        'severity': 'Critical',
        'symptoms': ['Aggression', 'Excessive drooling', 'Paralysis', 'Hydrophobia'],
        'treatment': 'IMMEDIATE VETERINARY CARE REQUIRED - Fatal disease. Quarantine and contact authorities immediately.',
        'urgency_message': '🚨 EMERGENCY: Contact animal control and vet immediately'
    },
    'Bloat (GDV)': {
        'emergency': True,
        'severity': 'Critical',
        'symptoms': ['Distended abdomen', 'Restlessness', 'Unproductive vomiting', 'Rapid breathing'],
        'treatment': 'IMMEDIATE VETERINARY CARE REQUIRED - Life-threatening emergency requiring immediate surgery.',
        'urgency_message': '🚨 EMERGENCY: Seek veterinary care within 30 minutes'
    },
    'Heatstroke': {
        'emergency': True,
        'severity': 'Severe',
        'symptoms': ['Excessive panting', 'Drooling', 'Weakness', 'Collapse'],
        'treatment': 'IMMEDIATE VETERINARY CARE REQUIRED - Cool the pet with water and seek emergency care immediately.',
        'urgency_message': '🚨 EMERGENCY: Cool pet and seek care within 30 minutes'
    },
    'Pyometra': {
        'emergency': True,
        'severity': 'Severe',
        'symptoms': ['Vaginal discharge', 'Lethargy', 'Increased thirst', 'Vomiting'],
        'treatment': 'IMMEDIATE VETERINARY CARE REQUIRED - Life-threatening uterine infection requiring emergency surgery.',
        'urgency_message': '🚨 EMERGENCY: Seek veterinary care within 2 hours'
    },
    'Mange (Sarcoptic)': {
        'emergency': False,
        'severity': 'Moderate',
        'symptoms': ['Intense itching', 'Hair loss', 'Red skin', 'Crusty patches'],
        'treatment': 'Isolate pet from other animals. Bathe with medicated shampoo. Consult vet for prescription anti-parasitic medication (ivermectin or selamectin). Wash all bedding in hot water.',
        'home_care': ['Use prescribed anti-parasitic medication', 'Medicated baths twice weekly', 'Wash bedding daily', 'Isolate from other pets']
    },
    'Ringworm': {
        'emergency': False,
        'severity': 'Mild',
        'symptoms': ['Circular hair loss', 'Scaly patches', 'Mild itching'],
        'treatment': 'Apply antifungal cream (miconazole or clotrimazole) twice daily. Bathe with antifungal shampoo containing ketoconazole. Disinfect environment. Consult vet if spreading.',
        'home_care': ['Antifungal cream application', 'Medicated shampoo baths', 'Disinfect living areas', 'Wash hands after handling']
    },
    'Allergic Dermatitis': {
        'emergency': False,
        'severity': 'Mild',
        'symptoms': ['Itching', 'Red skin', 'Licking paws', 'Ear infections'],
        'treatment': 'Identify and remove allergen (food, pollen, dust). Use hypoallergenic shampoo. Consult vet for antihistamines (Benadryl 1mg/lb) or prescription medication. Consider allergy testing.',
        'home_care': ['Remove suspected allergens', 'Hypoallergenic diet trial', 'Regular bathing', 'Antihistamines as prescribed']
    },
    'Hot Spots (Pyotraumatic Dermatitis)': {
        'emergency': False,
        'severity': 'Moderate',
        'symptoms': ['Moist, red lesions', 'Hair loss', 'Pain', 'Rapid spreading'],
        'treatment': 'Clip hair around affected area. Clean with antiseptic solution (chlorhexidine). Apply topical antibiotic. Use E-collar to prevent licking. Consult vet if not improving in 48 hours.',
        'home_care': ['Keep area clean and dry', 'Apply prescribed topical antibiotics', 'Use E-collar', 'Monitor for spreading']
    },
    'Flea Allergy Dermatitis': {
        'emergency': False,
        'severity': 'Mild',
        'symptoms': ['Intense itching', 'Hair loss on lower back', 'Red bumps', 'Scabs'],
        'treatment': 'Strict flea control for all pets in household. Use prescription flea prevention (Frontline, Advantage). Vacuum home daily. Wash bedding in hot water. Consult vet for anti-itch medication.',
        'home_care': ['Monthly flea prevention', 'Vacuum daily', 'Wash bedding weekly', 'Treat all pets in home']
    },
    'Bacterial Skin Infection (Pyoderma)': {
        'emergency': False,
        'severity': 'Moderate',
        'symptoms': ['Pustules', 'Crusting', 'Hair loss', 'Odor'],
        'treatment': 'Bathe with antibacterial shampoo (chlorhexidine or benzoyl peroxide). Consult vet for oral antibiotics. Keep area clean and dry. May require 3-6 weeks of treatment.',
        'home_care': ['Antibacterial baths 2-3 times weekly', 'Complete antibiotic course', 'Keep skin dry', 'Follow-up with vet']
    },
    'Yeast Infection (Malassezia)': {
        'emergency': False,
        'severity': 'Mild',
        'symptoms': ['Greasy skin', 'Musty odor', 'Itching', 'Darkened skin'],
        'treatment': 'Bathe with antifungal shampoo containing ketoconazole or miconazole. Dry thoroughly after bathing. Consult vet for oral antifungal if severe. Address underlying allergies.',
        'home_care': ['Antifungal shampoo baths', 'Keep skin folds dry', 'Treat underlying allergies', 'Regular grooming']
    },
    'Seborrhea': {
        'emergency': False,
        'severity': 'Mild',
        'symptoms': ['Flaky or greasy skin', 'Odor', 'Itching', 'Hair loss'],
        'treatment': 'Bathe with medicated shampoo (salicylic acid or sulfur-based). Use moisturizing conditioner. Omega-3 supplements. Consult vet to identify underlying cause.',
        'home_care': ['Regular medicated baths', 'Omega-3 fatty acid supplements', 'Moisturizing treatments', 'Treat underlying conditions']
    },
    'Atopic Dermatitis': {
        'emergency': False,
        'severity': 'Moderate',
        'symptoms': ['Chronic itching', 'Ear infections', 'Paw licking', 'Skin infections'],
        'treatment': 'Long-term management with antihistamines, immunotherapy, or Apoquel/Cytopoint. Regular bathing. Omega-3 supplements. Consult veterinary dermatologist for severe cases.',
        'home_care': ['Daily medication as prescribed', 'Regular bathing routine', 'Omega-3 supplements', 'Minimize allergen exposure']
    }
}

class EnhancedDiseaseDetectionService:
    def __init__(self, model_path=None):
        self.model = None
        self.class_names = None
        self.input_shape = DEFAULT_INPUT_SHAPE
        self.model_path = model_path or get_disease_model_path()
        self.class_names_path = CLASS_NAMES_PATH

    def load_resources(self):
        """Load AI model and class names"""
        if self.model is None:
            print(f"Loading enhanced AI model from {self.model_path}...")
            try:
                from model_loader import load_model_safe
                self.model = load_model_safe(self.model_path, compile=False)
                print("✓ Model loaded successfully")
                
                # Get input shape from model
                try:
                    shape = self.model.input_shape
                    if hasattr(shape, 'as_list'):
                        shape = shape.as_list()
                    if shape and len(shape) >= 3 and shape[1] and shape[2]:
                        self.input_shape = (shape[1], shape[2])
                        print(f"✓ Input shape: {self.input_shape}")
                except Exception as e:
                    print(f"Using default input shape: {self.input_shape}")
            except Exception as e:
                print(f"✗ Error loading model: {e}")
                import traceback
                traceback.print_exc()
                raise

        if self.class_names is None:
            print(f"Loading class names...")
            try:
                with open(self.class_names_path, 'rb') as f:
                    self.class_names = pickle.load(f)
                print(f"✓ Loaded {len(self.class_names)} disease classes")
            except Exception as e:
                print(f"✗ Error loading class names: {e}")
                raise

    def preprocess_image(self, image_file):
        """Preprocess image for model prediction"""
        image_file.seek(0)
        img = Image.open(image_file).convert('RGB')
        img = img.resize(self.input_shape)
        img_array = img_to_array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def get_disease_info(self, disease_name):
        """Get comprehensive disease information"""
        # Try exact match first
        if disease_name in DISEASE_DATABASE:
            return DISEASE_DATABASE[disease_name]
        
        # Try case-insensitive match
        for key in DISEASE_DATABASE:
            if key.lower() == disease_name.lower():
                return DISEASE_DATABASE[key]
        
        # Default for unknown diseases
        return {
            'emergency': False,
            'severity': 'Unknown',
            'symptoms': ['Consult veterinarian for proper diagnosis'],
            'treatment': 'Consult a veterinarian for proper diagnosis and treatment plan.',
            'home_care': ['Monitor symptoms', 'Document changes', 'Schedule vet appointment']
        }

    def predict(self, image_file):
        """Perform disease prediction with enhanced metadata"""
        try:
            self.load_resources()
            
            # Preprocess and predict
            processed_img = self.preprocess_image(image_file)
            predictions = self.model.predict(processed_img, verbose=0)
            score = predictions[0]
            
            # Get top prediction
            class_idx = np.argmax(score)
            disease_name = self.class_names[class_idx]
            probability = float(score[class_idx])
            
            # Get disease information
            disease_info = self.get_disease_info(disease_name)
            
            # Get top 3 predictions for additional context
            top_3_indices = np.argsort(score)[-3:][::-1]
            alternative_diagnoses = [
                {
                    'disease': self.class_names[i],
                    'probability': float(score[i])
                }
                for i in top_3_indices[1:]  # Skip the top prediction
            ]
            
            print(f"✓ Predicted: {disease_name} ({probability:.2%}) - Emergency: {disease_info['emergency']}")
            
            # Build comprehensive response
            result = {
                'diseaseName': disease_name,
                'probability': probability,
                'isEmergency': disease_info['emergency'],
                'severity': disease_info['severity'],
                'symptoms': disease_info.get('symptoms', []),
                'treatment': disease_info['treatment'],
                'homeCare': disease_info.get('home_care', []),
                'urgencyMessage': disease_info.get('urgency_message', ''),
                'alternativeDiagnoses': alternative_diagnoses,
                'confidence': 'high' if probability > 0.8 else 'medium' if probability > 0.6 else 'low',
                'allScores': {self.class_names[i]: float(score[i]) for i in range(len(self.class_names))}
            }
            
            return result
            
        except Exception as e:
            print(f"✗ Prediction error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

# Create service instance
enhanced_disease_service = EnhancedDiseaseDetectionService()
