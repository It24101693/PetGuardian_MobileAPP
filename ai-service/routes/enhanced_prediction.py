from flask import Blueprint, request, jsonify
from services.enhanced_disease_detection import enhanced_disease_service
import os

enhanced_prediction_bp = Blueprint('enhanced_prediction', __name__)

@enhanced_prediction_bp.route('/predict/enhanced', methods=['POST'])
def predict_enhanced():
    """Enhanced disease prediction with emergency detection and treatment suggestions"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Perform enhanced prediction
        result = enhanced_disease_service.predict(file)
        return jsonify(result)
    except Exception as e:
        print(f"Error during enhanced prediction: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_prediction_bp.route('/predict/enhanced/diseases', methods=['GET'])
def get_disease_database():
    """Get list of all diseases the model can detect"""
    try:
        enhanced_disease_service.load_resources()
        return jsonify({
            'diseases': enhanced_disease_service.class_names,
            'total': len(enhanced_disease_service.class_names)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@enhanced_prediction_bp.route('/predict/enhanced/health', methods=['GET'])
def health_check():
    """Health check for enhanced prediction service"""
    try:
        enhanced_disease_service.load_resources()
        return jsonify({
            'status': 'healthy',
            'service': 'Enhanced Disease Detection',
            'model_loaded': enhanced_disease_service.model is not None,
            'classes_loaded': enhanced_disease_service.class_names is not None,
            'total_diseases': len(enhanced_disease_service.class_names) if enhanced_disease_service.class_names else 0
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500
