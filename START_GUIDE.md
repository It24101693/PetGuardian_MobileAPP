# Quick Start Guide - AI Disease Detection

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Java 17+ installed
- MySQL running

## Step 1: Setup AI Service

```bash
cd ai-service
pip install -r requirements.txt
```

## Step 2: Verify Model Path

Make sure your trained model exists at:
```
C:\Users\ASUS\IdeaProjects\AI\pet_disease_model.h5
```

Or update the path in `ai-service/config.py`:
```python
CUSTOM_DISEASE_MODEL_PATH = r"YOUR_MODEL_PATH_HERE"
```

## Step 3: Start AI Service

```bash
cd ai-service
python app.py
```

You should see:
```
✓ Using custom disease model: C:\Users\ASUS\IdeaProjects\AI\pet_disease_model.h5
✓ Model loaded successfully
Starting AI service on http://0.0.0.0:5000
```

## Step 4: Test AI Service

```bash
python test-disease-detection.py
```

Or with an image:
```bash
python test-disease-detection.py path/to/test-image.jpg
```

## Step 5: Start Backend

```bash
cd backend
mvn spring-boot:run
```

Backend will run on: http://localhost:8080

## Step 6: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: http://localhost:5173

## Usage

1. Login to the application
2. Go to Owner Dashboard
3. Click on "AI Disease Scanner" card
4. Select a pet
5. Upload an image of the disease/symptom
6. Click "Start AI Diagnosis"
7. View results:
   - If EMERGENCY: Red alert with "Find Emergency Vet" button
   - If NON-EMERGENCY: Treatment suggestions and home care steps

## Features

✅ Emergency detection with automatic alerts
✅ Treatment suggestions for non-emergency cases
✅ Home care instructions
✅ Confidence scoring
✅ Alternative diagnoses
✅ Direct vet navigation for emergencies
✅ Scan history tracking
✅ Beautiful animations and UI

## Troubleshooting

### AI Service won't start
- Check Python version: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check model path in config.py

### Model not found
- Verify the model file exists at the specified path
- Check file permissions
- Update path in `ai-service/config.py`

### Backend database errors
- Ensure MySQL is running
- Check database credentials in `application.properties`
- Run migrations: `mvn flyway:migrate`

### Frontend can't connect
- Verify AI service is running on port 5000
- Verify backend is running on port 8080
- Check CORS settings

## API Endpoints

### Enhanced Prediction
```
POST http://localhost:5000/predict/enhanced
Content-Type: multipart/form-data
Body: image file
```

### Health Check
```
GET http://localhost:5000/predict/enhanced/health
```

### Get Diseases List
```
GET http://localhost:5000/predict/enhanced/diseases
```

## Configuration

Edit `ai-service/config.py` to customize:
- Model paths
- Confidence thresholds
- Image size limits
- Service port

## Support

For issues or questions, check:
- AI_DISEASE_DETECTION_GUIDE.md (detailed documentation)
- ARCHITECTURE.md (system architecture)
- Backend logs: `backend/logs/`
- AI service console output
