from flask import Flask
from flask_cors import CORS
from routes.prediction import prediction_bp
from routes.breed_prediction import breed_bp
from routes.enhanced_prediction import enhanced_prediction_bp
from services.disease_detection import disease_service
from services.enhanced_disease_detection import enhanced_disease_service
from services.breed_classification import breed_service
from config import AI_SERVICE_PORT, AI_SERVICE_HOST, DEBUG_MODE
import os

# Reduce TensorFlow noise
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
# Enable CORS for all origins during development
CORS(app)

app.register_blueprint(prediction_bp)
app.register_blueprint(breed_bp)
app.register_blueprint(enhanced_prediction_bp)

@app.route('/')
def index():
    return "PetGuardian AI Service - Disease Detection & Breed Classification"



if __name__ == "__main__":
    # Pre-load models on startup
    try:
        print("Pre-loading disease detection model...")
        disease_service.load_resources()
        print("Disease detection model loaded!")
    except Exception as e:
        print(f"Warning: Could not pre-load disease model: {e}")
    
    try:
        print("Pre-loading enhanced disease detection model...")
        enhanced_disease_service.load_resources()
        print("Enhanced disease detection model loaded!")
    except Exception as e:
        print(f"Warning: Could not pre-load enhanced disease model: {e}")
    
    try:
        print("Pre-loading breed classification model...")
        breed_service.load_model()
        print("Breed classification model loaded!")
    except Exception as e:
        print(f"Warning: Could not pre-load breed model: {e}")
        
    print(f"Starting AI service on http://{AI_SERVICE_HOST}:{AI_SERVICE_PORT}")
    app.run(host=AI_SERVICE_HOST, port=AI_SERVICE_PORT, debug=DEBUG_MODE)
