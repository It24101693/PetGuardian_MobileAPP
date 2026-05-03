# 🐾 PetGuardian AI Disease Detection System

> Advanced AI-powered disease detection with emergency classification and treatment suggestions

## 🌟 Overview

This system uses your trained AI model to analyze pet disease images, automatically detect emergencies, provide treatment suggestions, and route users to veterinary care when needed.

## ✨ Key Features

### 🚨 Emergency Detection
- Automatically identifies 6 critical diseases
- Immediate red alert with pulsing animations
- Urgency timeline (e.g., "Seek care within 1 hour")
- One-click navigation to emergency vet search

### 💊 Treatment Suggestions
- Detailed treatment plans for 9 non-emergency diseases
- Step-by-step home care instructions
- Medication recommendations
- When to consult a vet

### 🎨 Beautiful UI
- Smooth scanning beam animations
- Color-coded severity indicators
- Confidence scoring display
- Alternative diagnoses
- Responsive design

### 🛡️ Safety First
- Veterinary disclaimer on all results
- Confidence transparency
- Alternative diagnoses shown
- No medical claims without context

## 🚀 Quick Start

### 1. Setup (One-time)
```bash
# Run setup script
setup-disease-detection.bat

# Or manually:
cd ai-service && pip install -r requirements.txt
cd frontend && npm install
```

### 2. Start Services
```bash
# Terminal 1: AI Service
cd ai-service
python app.py

# Terminal 2: Backend
cd backend
mvn spring-boot:run

# Terminal 3: Frontend
cd frontend
npm run dev
```

### 3. Test
```bash
python test-disease-detection.py
```

### 4. Use
1. Open http://localhost:5173
2. Login as pet owner
3. Click "AI Disease Scanner"
4. Upload image and analyze!

## 📊 Disease Coverage

| Disease | Severity | Emergency | Treatment Type |
|---------|----------|-----------|----------------|
| Parvovirus | Critical | ✅ Yes | Immediate hospitalization |
| Distemper | Critical | ✅ Yes | Immediate professional care |
| Rabies | Critical | ✅ Yes | Quarantine + authorities |
| Bloat (GDV) | Critical | ✅ Yes | Emergency surgery |
| Heatstroke | Severe | ✅ Yes | Cool + emergency care |
| Pyometra | Severe | ✅ Yes | Emergency surgery |
| Mange | Moderate | ❌ No | Anti-parasitic medication |
| Ringworm | Mild | ❌ No | Antifungal treatment |
| Allergic Dermatitis | Mild | ❌ No | Allergen removal + antihistamines |
| Hot Spots | Moderate | ❌ No | Antiseptic + topical antibiotics |
| Flea Allergy | Mild | ❌ No | Flea control |
| Bacterial Infection | Moderate | ❌ No | Antibacterial treatment |
| Yeast Infection | Mild | ❌ No | Antifungal treatment |
| Seborrhea | Mild | ❌ No | Medicated shampoo |
| Atopic Dermatitis | Moderate | ❌ No | Long-term management |

## 🎬 User Experience

### Emergency Case Flow
```
Upload Image → AI Analysis → 🚨 EMERGENCY ALERT → Find Vet → Get Care
```

### Non-Emergency Case Flow
```
Upload Image → AI Analysis → Treatment Plan → Home Care → Save Report
```

## 🔧 Configuration

### Model Path
Edit `ai-service/config.py`:
```python
CUSTOM_DISEASE_MODEL_PATH = r"C:\Users\ASUS\IdeaProjects\AI\pet_disease_model.h5"
```

### Service Ports
- AI Service: `5000`
- Backend: `8080`
- Frontend: `5173`

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `START_GUIDE.md` | Quick start instructions |
| `AI_DISEASE_DETECTION_GUIDE.md` | Technical implementation details |
| `DISEASE_DETECTION_FLOW.md` | Visual flow diagrams |
| `ADDING_NEW_DISEASES.md` | How to add more diseases |
| `FEATURE_DEMO.md` | Demo script and use cases |
| `DISEASE_DETECTION_CHECKLIST.md` | Implementation checklist |

## 🧪 Testing

### Automated Test
```bash
python test-disease-detection.py path/to/image.jpg
```

### Manual Test
1. Start all services
2. Login to application
3. Open AI Disease Scanner
4. Upload test image
5. Verify results display correctly

### Health Check
```bash
curl http://localhost:5000/predict/enhanced/health
```

## 🎯 API Endpoints

### Enhanced Prediction
```http
POST /predict/enhanced
Content-Type: multipart/form-data

Response:
{
  "diseaseName": "string",
  "probability": 0.95,
  "isEmergency": true,
  "severity": "Critical",
  "treatment": "string",
  "homeCare": ["step1", "step2"],
  "urgencyMessage": "string",
  "confidence": "high"
}
```

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────→│    Flask     │────→│   Model     │
│  Frontend   │←────│  AI Service  │     │   (.h5)     │
└─────────────┘     └──────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│ Spring Boot │────→│    MySQL     │
│   Backend   │     │   Database   │
└─────────────┘     └──────────────┘
```

## 💡 Usage Tips

1. **Best Image Quality**: Clear, well-lit photos of affected area
2. **Emergency Cases**: System auto-detects and alerts
3. **Save Reports**: Track disease history over time
4. **Confidence Scores**: Higher is better (>80% is high confidence)
5. **Alternative Diagnoses**: Consider other possibilities
6. **Always Consult Vet**: AI is a screening tool, not a diagnosis

## 🐛 Troubleshooting

### AI Service Won't Start
- Check Python version: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Verify model path in `config.py`

### Model Not Found
- Check file exists: `C:\Users\ASUS\IdeaProjects\AI\pet_disease_model.h5`
- Update path in `ai-service/config.py`
- Check file permissions

### Database Errors
- Ensure MySQL is running
- Run migration: `mvn spring-boot:run`
- Check credentials in `application.properties`

### Frontend Connection Issues
- Verify AI service on port 5000
- Verify backend on port 8080
- Check CORS settings

## 📞 Support

For issues or questions:
1. Check console logs (AI service, backend, frontend)
2. Review documentation files
3. Run test script: `python test-disease-detection.py`
4. Verify all services are running

## 🎉 Success!

Your AI disease detection system is ready to:
- ✅ Analyze disease images
- ✅ Detect emergencies automatically
- ✅ Provide treatment suggestions
- ✅ Navigate to vet care
- ✅ Track scan history
- ✅ Deliver beautiful UX

---

**Model**: `pet_disease_model.h5`
**Status**: ✅ Production Ready
**Version**: 1.0.0
