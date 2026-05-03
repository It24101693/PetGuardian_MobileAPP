from flask import Blueprint, request, jsonify
from services.breed_classification import breed_service
from werkzeug.utils import secure_filename
import os

breed_bp = Blueprint('breed', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@breed_bp.route('/predict-breed', methods=['POST'])
def predict_breed():
    """
    Endpoint to predict pet breed from uploaded image
    
    Expected: multipart/form-data with 'image' field
    Returns: JSON with species, breed, and confidence
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, bmp, webp'}), 400
        
        # Make prediction
        result = breed_service.predict(file)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error in breed prediction endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@breed_bp.route('/breed-health', methods=['GET'])
def breed_health():
    """Health check endpoint for breed classification service"""
    try:
        breed_service.load_model()
        return jsonify({
            'status': 'healthy',
            'service': 'breed-classification',
            'model_loaded': breed_service.model is not None
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500
