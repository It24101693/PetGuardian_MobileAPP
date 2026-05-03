from flask import Blueprint, request, jsonify
from services.disease_detection import disease_service

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Perform prediction
        result = disease_service.predict(file)
        return jsonify(result)
    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

@prediction_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'AI Service is running'})
