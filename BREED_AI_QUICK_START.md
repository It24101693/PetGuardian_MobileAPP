# Breed Classification AI - Quick Start Guide

## ✅ What Was Implemented

I've successfully integrated your breed classification model into the pet registration process!

**When users upload a pet photo:**
1. Image is sent to AI service
2. Model predicts species (Dog/Cat) and breed
3. Results auto-fill the registration form
4. User can review and edit before submitting

## 🚀 How to Start

### Step 1: Start the AI Service

```bash
cd ai-service
python app.py
```

**Expected Output:**
```
Pre-loading disease detection model...
Disease detection model loaded!
Pre-loading breed classification model...
Breed classification model loaded!
Starting AI service on http://0.0.0.0:5000
```

### Step 2: Test the Breed Prediction

**Quick Test with curl:**
```bash
curl -X POST http://127.0.0.1:5000/predict-breed -F "image=@test_dog.jpg"
```

**Expected Response:**
```json
{
  "species": "Dog",
  "breed": "Golden Retriever",
  "confidence": 0.95,
  "top3Predictions": [...]
}
```

### Step 3: Test in the Frontend

1. Make sure frontend is running: `npm run dev`
2. Go to Owner Dashboard
3. Click "Add New Pet"
4. Upload a pet photo
5. Watch the AI analyze it!
6. Species and breed fields will auto-fill

## 📁 Files Created/Modified

### New Files:
- ✅ `ai-service/services/breed_classification.py` - AI model service
- ✅ `ai-service/routes/breed_prediction.py` - API endpoint
- ✅ `BREED_CLASSIFICATION_IMPLEMENTATION.md` - Full documentation

### Modified Files:
- ✅ `ai-service/app.py` - Added breed prediction route
- ✅ `frontend/src/app/services/api.ts` - Added predictBreed() function
- ✅ `frontend/src/app/components/pages/OwnerDashboard.tsx` - Integrated AI predictions

## 🎯 Key Features

1. **Real AI Predictions**
   - Uses your trained model from `models/pet_breed_category_classifier`
   - Predicts species and breed
   - Shows confidence score

2. **Smart UI**
   - Loading animation during analysis
   - Auto-fills form fields
   - Shows top 3 predictions
   - Confidence progress bar

3. **Fallback Support**
   - If AI service is down, uses mock predictions
   - Doesn't block registration
   - User can always edit predictions

## 🔧 Customization

### Update Supported Breeds

Edit `ai-service/services/breed_classification.py`:

```python
BREED_CATEGORIES = {
    'Your_Breed_Name': {'species': 'Dog', 'breed': 'Your Breed Name'},
    # Add your breeds here
}
```

### Change Model Path

If your model is in a different location:

```python
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'your', 'model', 'path')
```

## ⚠️ Important Notes

1. **Model Format:** Your model is in SavedModel format (✅ Supported)
2. **Input Size:** Model will auto-detect input size (default: 224x224)
3. **Preprocessing:** Images are automatically resized and normalized
4. **CORS:** Already configured for localhost development

## 🧪 Testing

### Test 1: Health Check
```bash
curl http://127.0.0.1:5000/breed-health
```

Should return:
```json
{
  "status": "healthy",
  "service": "breed-classification",
  "model_loaded": true
}
```

### Test 2: Predict with Image
```bash
curl -X POST http://127.0.0.1:5000/predict-breed \
  -F "image=@path/to/pet/photo.jpg"
```

### Test 3: Frontend Integration
1. Upload a dog photo → Should predict dog breed
2. Upload a cat photo → Should predict cat breed
3. Check console for AI logs
4. Verify form auto-fills

## 🐛 Troubleshooting

### AI Service Won't Start

**Error:** `ModuleNotFoundError: No module named 'tensorflow'`

**Fix:**
```bash
cd ai-service
pip install -r requirements.txt
```

### Model Not Found

**Error:** `OSError: SavedModel file does not exist`

**Fix:** Verify model path:
```bash
ls ai-service/models/pet_breed_category_classifier/
# Should show: saved_model.pb, variables/, assets/
```

### Predictions Always Wrong

**Possible Causes:**
1. Wrong breed categories in code
2. Model needs different preprocessing
3. Image quality issues

**Fix:** Check model output classes and update `BREED_CATEGORIES`

### Frontend Shows "AI breed prediction failed"

**Causes:**
1. AI service not running
2. Port 5000 blocked
3. CORS issue

**Fix:**
```bash
# Check if service is running
curl http://127.0.0.1:5000/health

# Check breed endpoint
curl http://127.0.0.1:5000/breed-health
```

## 📊 What Happens During Registration

```
User uploads photo
       ↓
Frontend sends to AI service (port 5000)
       ↓
AI preprocesses image (resize, normalize)
       ↓
Model predicts breed
       ↓
Returns: species, breed, confidence, top 3
       ↓
Frontend auto-fills form
       ↓
User reviews and edits if needed
       ↓
Submits registration
```

## 🎉 Success Indicators

You'll know it's working when:
- ✅ AI service starts without errors
- ✅ Console shows "Breed classification model loaded!"
- ✅ Upload triggers "Analyzing image..." animation
- ✅ Species and breed fields auto-fill
- ✅ Confidence bar shows percentage
- ✅ Top 3 predictions display

## 📝 Next Steps

1. **Test with various pet photos**
   - Different breeds
   - Different angles
   - Different lighting

2. **Adjust breed categories**
   - Match your model's actual output classes
   - Add more breeds if needed

3. **Monitor accuracy**
   - Track how often users edit AI predictions
   - Collect feedback

4. **Optimize performance**
   - Consider model quantization
   - Add caching for common breeds
   - Use GPU if available

## 💡 Tips

- **Good Photos:** Clear, well-lit, pet facing camera
- **Bad Photos:** Blurry, dark, multiple pets, far away
- **Confidence:** >80% = very confident, <50% = uncertain
- **Editing:** Users can always edit AI predictions
- **Fallback:** System works even if AI service is down

## 🆘 Need Help?

Check these files for more details:
- `BREED_CLASSIFICATION_IMPLEMENTATION.md` - Full technical documentation
- `ai-service/services/breed_classification.py` - Model code
- `ai-service/routes/breed_prediction.py` - API endpoint

Console logs will show:
- Model loading status
- Prediction results
- Error messages
- Confidence scores

Happy testing! 🐕🐈
