# Breed Classification AI Integration

## Overview
Successfully integrated the breed classification model into the pet registration process. When users upload a pet photo, the AI automatically predicts the species and breed.

## Implementation Details

### Backend (AI Service)

#### New Files Created:

1. **`ai-service/services/breed_classification.py`**
   - Loads the SavedModel from `models/pet_breed_category_classifier`
   - Preprocesses images (resize, normalize)
   - Returns species, breed, and confidence
   - Provides top 3 predictions

2. **`ai-service/routes/breed_prediction.py`**
   - New endpoint: `POST /predict-breed`
   - Accepts multipart/form-data with image
   - Returns JSON with breed prediction

#### Modified Files:

1. **`ai-service/app.py`**
   - Registered breed prediction blueprint
   - Pre-loads breed model on startup
   - Added health check endpoint

### Frontend

#### Modified Files:

1. **`frontend/src/app/services/api.ts`**
   - Added `predictBreed()` function
   - Calls `http://127.0.0.1:5000/predict-breed`

2. **`frontend/src/app/components/pages/OwnerDashboard.tsx`**
   - Updated `handleImageUpload()` to call breed AI
   - Shows AI predictions with confidence score
   - Displays top 3 breed possibilities
   - Auto-fills species and breed fields
   - Falls back to mock data if AI service unavailable

## API Endpoints

### Breed Prediction
```
POST http://127.0.0.1:5000/predict-breed
Content-Type: multipart/form-data

Body:
- image: (file)

Response:
{
  "species": "Dog",
  "breed": "Golden Retriever",
  "confidence": 0.95,
  "top3Predictions": [
    {"species": "Dog", "breed": "Golden Retriever", "confidence": 0.95},
    {"species": "Dog", "breed": "Labrador Retriever", "confidence": 0.03},
    {"species": "Dog", "breed": "Yellow Labrador", "confidence": 0.01}
  ]
}
```

### Health Check
```
GET http://127.0.0.1:5000/breed-health

Response:
{
  "status": "healthy",
  "service": "breed-classification",
  "model_loaded": true
}
```

## Supported Breeds

The model currently supports these breeds (you may need to adjust based on your actual model):

**Dogs:**
- Beagle
- Boxer
- Bulldog
- Chihuahua
- German Shepherd
- Golden Retriever
- Labrador Retriever
- Poodle
- Rottweiler
- Yorkshire Terrier

**Cats:**
- Abyssinian
- Bengal
- Birman
- British Shorthair
- Maine Coon
- Persian
- Ragdoll
- Russian Blue
- Siamese
- Sphynx

## How to Use

### 1. Start the AI Service

```bash
cd ai-service
python app.py
```

You should see:
```
Pre-loading disease detection model...
Disease detection model loaded!
Pre-loading breed classification model...
Breed classification model loaded!
Starting AI service on http://0.0.0.0:5000
```

### 2. Test the Breed Prediction

**Using curl:**
```bash
curl -X POST http://127.0.0.1:5000/predict-breed \
  -F "image=@path/to/dog.jpg"
```

**Using the Frontend:**
1. Go to Owner Dashboard
2. Click "Add New Pet"
3. Upload a pet photo
4. Wait for AI analysis (shows loading animation)
5. Species and breed fields auto-fill
6. Review and edit if needed
7. Complete registration

## Features

### AI Prediction Display
- ✅ Shows predicted species and breed
- ✅ Displays confidence percentage with progress bar
- ✅ Shows top 3 alternative predictions
- ✅ Auto-fills form fields
- ✅ User can edit predictions before submitting

### Error Handling
- ✅ Falls back to mock predictions if AI service unavailable
- ✅ Shows error messages in console
- ✅ Doesn't block registration if AI fails
- ✅ Validates image file types

### Performance
- ✅ Model pre-loaded on startup (fast predictions)
- ✅ Async processing (doesn't block UI)
- ✅ Loading animation during analysis
- ✅ Caches model in memory

## Customizing Breed Categories

If your model has different breeds, update the `BREED_CATEGORIES` dictionary in `ai-service/services/breed_classification.py`:

```python
BREED_CATEGORIES = {
    'Your_Breed_Name': {'species': 'Dog', 'breed': 'Your Breed Name'},
    # Add more breeds...
}
```

## Troubleshooting

### Model Not Loading

**Problem:** Error loading breed classification model

**Solutions:**
1. Check model path is correct:
   ```python
   MODEL_PATH = 'ai-service/models/pet_breed_category_classifier'
   ```

2. Verify model files exist:
   ```
   models/pet_breed_category_classifier/
   ├── saved_model.pb
   ├── variables/
   └── assets/
   ```

3. Check TensorFlow version compatibility

### Predictions Are Wrong

**Problem:** AI predicts wrong breed

**Solutions:**
1. Check if breed is in `BREED_CATEGORIES`
2. Verify image quality (clear, well-lit)
3. Ensure image shows the pet clearly
4. Model may need retraining with more data

### AI Service Not Responding

**Problem:** Frontend shows "AI breed prediction failed"

**Solutions:**
1. Check AI service is running on port 5000
2. Test endpoint directly:
   ```bash
   curl http://127.0.0.1:5000/breed-health
   ```
3. Check CORS is enabled in Flask
4. Verify firewall allows port 5000

### Slow Predictions

**Problem:** Takes too long to predict

**Solutions:**
1. Ensure model is pre-loaded on startup
2. Check image size (resize large images)
3. Use GPU if available (install tensorflow-gpu)
4. Consider model optimization (quantization)

## Testing Checklist

- [ ] AI service starts without errors
- [ ] Breed health endpoint returns healthy
- [ ] Upload dog image → predicts dog breed
- [ ] Upload cat image → predicts cat breed
- [ ] Confidence score displays correctly
- [ ] Top 3 predictions show
- [ ] Form auto-fills with predictions
- [ ] Can edit predictions before submitting
- [ ] Works with different image formats (jpg, png)
- [ ] Falls back gracefully if AI service down
- [ ] Registration completes successfully

## Future Enhancements

- [ ] Add more breed categories
- [ ] Support for other pets (rabbits, birds, etc.)
- [ ] Age estimation from photo
- [ ] Weight estimation
- [ ] Gender detection
- [ ] Multiple pet detection in one image
- [ ] Breed mix detection
- [ ] Save prediction history
- [ ] Model performance metrics
- [ ] A/B testing different models

## Performance Metrics

Track these metrics to improve the model:

- Prediction accuracy
- Average confidence score
- User edit rate (how often users change AI predictions)
- Prediction time
- Model size
- Memory usage

## Security Considerations

- ✅ Validates file types (images only)
- ✅ Limits file size (handled by Flask)
- ✅ Sanitizes filenames
- ✅ No file storage (processes in memory)
- ✅ CORS configured for development
- ⚠️ Add rate limiting for production
- ⚠️ Add authentication for production API

## Production Deployment

### Environment Variables
```bash
# AI Service
AI_SERVICE_PORT=5000
MODEL_PATH=/app/models/pet_breed_category_classifier
TF_CPP_MIN_LOG_LEVEL=2

# Frontend
VITE_AI_SERVICE_URL=https://your-ai-service.com
```

### Docker Support
Consider containerizing the AI service:
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

### Scaling
- Use load balancer for multiple AI service instances
- Consider serverless (AWS Lambda, Google Cloud Functions)
- Cache predictions for common breeds
- Use CDN for model files

## Support

If you encounter issues:
1. Check console logs (both frontend and backend)
2. Test AI endpoint directly with curl
3. Verify model files are present
4. Check TensorFlow version compatibility
5. Review error messages in browser console
