# AI Disease Detection System - Implementation Guide

## Overview
Enhanced AI-powered disease detection system with emergency classification, treatment suggestions, and automatic vet navigation for critical cases.

## Features

### 1. Advanced Disease Detection
- Uses trained model: `C:\Users\ASUS\IdeaProjects\AI\pet_disease_model.h5`
- Detects multiple pet diseases with confidence scoring
- Provides alternative diagnoses for comprehensive assessment

### 2. Emergency Classification
The system automatically classifies diseases into two categories:

**Emergency Diseases** (Immediate vet care required):
- Parvovirus
- Distemper
- Rabies
- Bloat (GDV)
- Heatstroke
- Pyometra

**Non-Emergency Diseases** (Treatment suggestions provided):
- Mange (Sarcoptic)
- Ringworm
- Allergic Dermatitis
- Hot Spots
- Flea Allergy Dermatitis
- Bacterial Skin Infection
- Yeast Infection
- Seborrhea
- Atopic Dermatitis

### 3. Smart Response System

#### For Emergency Cases:
- 🚨 Immediate emergency alert modal
- Urgency timeline (e.g., "Seek care within 30 minutes")
- Direct navigation to vet search page
- Critical action buttons highlighted in red
- Pulsing animations to draw attention

#### For Non-Emergency Cases:
- Detailed treatment plan
- Step-by-step home care instructions
- Severity classification (Mild/Moderate/Severe)
- Option to save diagnosis report
- Optional vet consultation link

## Architecture

### Backend (Java Spring Boot)
```
backend/src/main/java/com/petguardian/
├── model/entity/SymptomScan.java (Enhanced with emergency fields)
├── controller/SymptomScanController.java
└── service/SymptomScanService.java
```

### AI Service (Python Flask)
```
ai-service/
├── services/
│   ├── enhanced_disease_detection.py (New enhanced service)
│   └── disease_detection.py (Legacy service)
├── routes/
│   ├── enhanced_prediction.py (New enhanced endpoint)
│   └── prediction.py (Legacy endpoint)
└── app.py (Updated with custom model path)
```

### Frontend (React + TypeScript)
```
frontend/src/app/
├── components/
│   └── DiseaseScanner.tsx (New standalone component)
├── components/pages/
│   └── OwnerDashboard.tsx (Integrated with DiseaseScanner)
└── services/
    └── api.ts (Added diagnoseEnhanced endpoint)
```

## API Endpoints

### Enhanced Prediction
```
POST /predict/enhanced
Content-Type: multipart/form-data
Body: { image: File }

Response:
{
  "diseaseName": "string",
  "probability": 0.95,
  "isEmergency": true,
  "severity": "Critical",
  "symptoms": ["symptom1", "symptom2"],
  "treatment": "string",
  "homeCare": ["step1", "step2"],
  "urgencyMessage": "string",
  "alternativeDiagnoses": [
    { "disease": "string", "probability": 0.05 }
  ],
  "confidence": "high"
}
```

### Health Check
```
GET /predict/enhanced/health

Response:
{
  "status": "healthy",
  "service": "Enhanced Disease Detection",
  "model_loaded": true,
  "classes_loaded": true,
  "total_diseases": 15
}
```

## Database Schema

### New Fields in `ai_symptom_scans`
- `is_emergency` (BOOLEAN): Emergency classification flag
- `confidence_level` (VARCHAR): AI confidence (high/medium/low)
- `home_care` (TEXT): Home care instructions
- `urgency_message` (VARCHAR): Emergency urgency message

## UI/UX Flow

### Normal Flow (Non-Emergency)
1. User selects pet
2. User uploads disease image
3. AI analyzes and shows diagnosis
4. Treatment suggestions displayed
5. Home care steps provided
6. User can save report or find vet

### Emergency Flow
1. User selects pet
2. User uploads disease image
3. AI detects emergency condition
4. 🚨 Emergency modal appears immediately
5. Urgency message displayed with timeline
6. "Find Emergency Vet" button prominently shown
7. Direct navigation to vet search page

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd ai-service
pip install -r requirements.txt
```

### 2. Verify Model Path
Ensure the trained model exists at:
```
C:\Users\ASUS\IdeaProjects\AI\pet_disease_model.h5
```

### 3. Run Database Migration
The migration will automatically run on next backend startup, or manually:
```bash
cd backend
mvn flyway:migrate
```

### 4. Start Services
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

## Testing

### Test Enhanced Endpoint
```bash
curl -X POST http://localhost:5000/predict/enhanced \
  -F "image=@test_image.jpg"
```

### Test Health Check
```bash
curl http://localhost:5000/predict/enhanced/health
```

## Safety Features

1. **Validation**: Image type and size validation
2. **Error Handling**: Graceful fallbacks for unknown diseases
3. **Disclaimers**: Clear veterinary disclaimer on all results
4. **Confidence Scoring**: Transparency about AI certainty
5. **Alternative Diagnoses**: Shows other possibilities
6. **Emergency Detection**: Automatic critical case identification

## Customization

### Adding New Diseases
Edit `ai-service/services/enhanced_disease_detection.py`:

```python
DISEASE_DATABASE = {
    'New Disease': {
        'emergency': False,  # or True
        'severity': 'Moderate',
        'symptoms': ['symptom1', 'symptom2'],
        'treatment': 'Treatment description',
        'home_care': ['step1', 'step2']
    }
}
```

### Adjusting Emergency Thresholds
Modify the `get_disease_info()` method to customize emergency classification logic.

## Animations

The UI includes smooth animations:
- Scanning beam effect during analysis
- Pulsing emergency alerts
- Smooth transitions between states
- Scale animations on buttons
- Fade-in results display

## Notes

- The system uses the custom trained model at the specified path
- Falls back to default model if custom model not found
- Emergency detection is based on disease database metadata
- All diagnoses include veterinary disclaimer
- System supports both legacy and enhanced endpoints for backward compatibility
