# AI Disease Detection System - Flow Diagram

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     OWNER DASHBOARD                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🎯 AI Disease Scanner Card                              │  │
│  │  "Emergency detection & treatment"                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            │ Click                               │
│                            ▼                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              DISEASE SCANNER DIALOG                              │
│                                                                  │
│  Step 1: Select Pet                                             │
│  ┌────────────────────────────────┐                            │
│  │ [Dropdown: Choose a pet...]    │                            │
│  └────────────────────────────────┘                            │
│                                                                  │
│  Step 2: Upload Disease Image                                   │
│  ┌────────────────────────────────┐                            │
│  │  📷 Click to upload            │                            │
│  │  "Clear photo of affected area"│                            │
│  └────────────────────────────────┘                            │
│                                                                  │
│  ┌────────────────────────────────┐                            │
│  │  ✨ Start AI Diagnosis         │                            │
│  └────────────────────────────────┘                            │
│                            │                                     │
│                            │ Click                               │
│                            ▼                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   AI ANALYSIS PHASE                              │
│                                                                  │
│  ┌────────────────────────────────┐                            │
│  │  🤖 AI analyzing patterns...   │                            │
│  │  [Scanning beam animation]     │                            │
│  │  "Checking emergency indicators"│                            │
│  └────────────────────────────────┘                            │
│                            │                                     │
│                            │ Processing                          │
│                            ▼                                     │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  AI DECISION │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌─────────────────┐      ┌─────────────────┐
    │   EMERGENCY?    │      │  NON-EMERGENCY  │
    │   isEmergency   │      │   isEmergency   │
    │   = true        │      │   = false       │
    └────────┬────────┘      └────────┬────────┘
             │                        │
             ▼                        ▼

┌─────────────────────────────────────────────────────────────────┐
│                  🚨 EMERGENCY FLOW                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ⚠️  EMERGENCY DETECTED                                │    │
│  │  [Pulsing red alert icon]                              │    │
│  │                                                         │    │
│  │  Disease: Parvovirus                                   │    │
│  │  Severity: CRITICAL                                    │    │
│  │  Confidence: 95%                                       │    │
│  │                                                         │    │
│  │  🚨 EMERGENCY: Seek veterinary care within 1 hour     │    │
│  │                                                         │    │
│  │  Treatment: IMMEDIATE VETERINARY CARE REQUIRED         │    │
│  │  [Full emergency instructions]                         │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  📞 Find Emergency Vet Now                   │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            │ Click                               │
│                            ▼                                     │
│                  ┌──────────────────┐                           │
│                  │  VET SEARCH PAGE │                           │
│                  │  (Auto-filtered) │                           │
│                  └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               ✅ NON-EMERGENCY FLOW                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  📊 DIAGNOSIS REPORT                                   │    │
│  │                                                         │    │
│  │  Disease: Ringworm                                     │    │
│  │  Severity: MILD                                        │    │
│  │  Confidence: 87%                                       │    │
│  │  Match: 87%                                            │    │
│  │                                                         │    │
│  │  Common Symptoms:                                      │    │
│  │  • Circular hair loss                                  │    │
│  │  • Scaly patches                                       │    │
│  │  • Mild itching                                        │    │
│  │                                                         │    │
│  │  💊 Treatment Plan:                                    │    │
│  │  Apply antifungal cream twice daily. Bathe with       │    │
│  │  antifungal shampoo. Disinfect environment.           │    │
│  │                                                         │    │
│  │  🏠 Home Care Steps:                                   │    │
│  │  ✓ Antifungal cream application                       │    │
│  │  ✓ Medicated shampoo baths                            │    │
│  │  ✓ Disinfect living areas                             │    │
│  │  ✓ Wash hands after handling                          │    │
│  │                                                         │    │
│  │  🔬 Alternative Possibilities:                         │    │
│  │  - Mange: 8.2%                                         │    │
│  │  - Allergic Dermatitis: 3.1%                          │    │
│  │                                                         │    │
│  │  ⚠️  Veterinary Disclaimer                             │    │
│  │  AI screening does not replace professional diagnosis  │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  ✅ Save Diagnosis Report                    │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  🔍 Find Veterinarian (Optional)             │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            │ Save                                │
│                            ▼                                     │
│                  ┌──────────────────┐                           │
│                  │  SCAN HISTORY    │                           │
│                  │  (Saved to DB)   │                           │
│                  └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Flow

```
┌──────────────┐
│   FRONTEND   │
│  (React)     │
└──────┬───────┘
       │ POST /predict/enhanced
       │ FormData: { image: File }
       ▼
┌──────────────────────────────────────┐
│      AI SERVICE (Flask)              │
│      Port: 5000                      │
│                                      │
│  /predict/enhanced                   │
│  ├─ Validate image                   │
│  ├─ Preprocess (resize, normalize)   │
│  ├─ Model.predict()                  │
│  ├─ Get disease info from database   │
│  ├─ Classify emergency status        │
│  └─ Return enhanced result           │
└──────┬───────────────────────────────┘
       │ JSON Response:
       │ {
       │   diseaseName, probability,
       │   isEmergency, severity,
       │   treatment, homeCare,
       │   urgencyMessage, etc.
       │ }
       ▼
┌──────────────────────────────────────┐
│      FRONTEND LOGIC                  │
│                                      │
│  if (isEmergency) {                  │
│    → Show emergency modal            │
│    → Navigate to vet search          │
│  } else {                            │
│    → Show treatment suggestions      │
│    → Display home care steps         │
│    → Option to save report           │
│  }                                   │
└──────┬───────────────────────────────┘
       │ POST /api/symptom-scans
       │ (if user saves)
       ▼
┌──────────────────────────────────────┐
│   BACKEND (Spring Boot)              │
│   Port: 8080                         │
│                                      │
│  /api/symptom-scans                  │
│  ├─ Save to database                 │
│  ├─ Create notification              │
│  └─ Return saved scan                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│      DATABASE (MySQL)                │
│                                      │
│  ai_symptom_scans table              │
│  ├─ id, pet_id, disease_name         │
│  ├─ probability, severity            │
│  ├─ is_emergency ⭐ NEW              │
│  ├─ confidence_level ⭐ NEW          │
│  ├─ home_care ⭐ NEW                 │
│  ├─ urgency_message ⭐ NEW           │
│  └─ created_at                       │
└──────────────────────────────────────┘
```

## Data Flow Example

### Emergency Case: Parvovirus

```json
{
  "diseaseName": "Parvovirus",
  "probability": 0.94,
  "isEmergency": true,
  "severity": "Critical",
  "symptoms": [
    "Severe vomiting",
    "Bloody diarrhea",
    "Lethargy",
    "Loss of appetite"
  ],
  "treatment": "IMMEDIATE VETERINARY CARE REQUIRED - Life-threatening...",
  "homeCare": [],
  "urgencyMessage": "🚨 EMERGENCY: Seek veterinary care within 1 hour",
  "alternativeDiagnoses": [
    { "disease": "Distemper", "probability": 0.03 },
    { "disease": "Bacterial Infection", "probability": 0.02 }
  ],
  "confidence": "high"
}
```

### Non-Emergency Case: Ringworm

```json
{
  "diseaseName": "Ringworm",
  "probability": 0.87,
  "isEmergency": false,
  "severity": "Mild",
  "symptoms": [
    "Circular hair loss",
    "Scaly patches",
    "Mild itching"
  ],
  "treatment": "Apply antifungal cream twice daily. Bathe with antifungal shampoo...",
  "homeCare": [
    "Antifungal cream application",
    "Medicated shampoo baths",
    "Disinfect living areas",
    "Wash hands after handling"
  ],
  "urgencyMessage": "",
  "alternativeDiagnoses": [
    { "disease": "Mange", "probability": 0.08 },
    { "disease": "Allergic Dermatitis", "probability": 0.03 }
  ],
  "confidence": "high"
}
```

## Component Hierarchy

```
OwnerDashboard
└── DiseaseScanner (Card + Dialog)
    ├── Pet Selection Dropdown
    ├── Image Upload Area
    │   ├── Preview with scanning animation
    │   └── File input
    ├── Start AI Diagnosis Button
    ├── Results Display
    │   ├── Emergency Alert (conditional)
    │   │   ├── Pulsing icon
    │   │   ├── Urgency message
    │   │   └── Find Emergency Vet button
    │   ├── Disease Card
    │   │   ├── Disease name
    │   │   ├── Confidence badge
    │   │   ├── Severity badge
    │   │   ├── Symptoms list
    │   │   ├── Treatment plan
    │   │   ├── Home care steps (non-emergency)
    │   │   ├── Alternative diagnoses
    │   │   └── Disclaimer
    │   └── Action Buttons
    │       ├── Save Report (non-emergency)
    │       ├── Find Veterinarian (non-emergency)
    │       └── Connect to Emergency Vet (emergency)
    └── Emergency Alert Modal (conditional)
        ├── Large warning icon
        ├── Emergency message
        └── Find Emergency Vet button
```

## State Management

```typescript
// Scanner States
const [open, setOpen] = useState(false);
const [selectedPet, setSelectedPet] = useState('');
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState('');
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [results, setResults] = useState<ScanResult | null>(null);
const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);

// Result Structure
interface ScanResult {
    diseaseName: string;
    probability: number;
    isEmergency: boolean;
    severity: string;
    symptoms: string[];
    treatment: string;
    homeCare: string[];
    urgencyMessage: string;
    alternativeDiagnoses: Array<{
        disease: string;
        probability: number;
    }>;
    confidence: string;
}
```

## Animation Timeline

```
0.0s: Dialog opens (fade in)
0.3s: Upload area appears
0.5s: Button becomes interactive
      │
      │ User uploads image
      ▼
0.0s: Image preview appears
0.2s: Preview scales to full size
      │
      │ User clicks "Start AI Diagnosis"
      ▼
0.0s: Scanning overlay appears
0.1s: Scanning beam starts moving
0.5s: "AI analyzing..." text pulses
      │
      │ AI processing (2-5 seconds)
      ▼
0.0s: Results fade in from right
0.3s: Severity bar animates
0.5s: Emergency alert (if applicable)
0.8s: Action buttons appear
```

## Error Handling Flow

```
Image Upload
├─ Invalid type → Alert: "Please upload valid image"
├─ Too large → Alert: "Image must be less than 5MB"
└─ Valid → Continue

AI Analysis
├─ Service down → Alert: "AI service not running"
├─ Model error → Alert: "Analysis failed"
└─ Success → Display results

Save Scan
├─ No pet selected → Alert: "Please select a pet"
├─ Network error → Alert: "Failed to save scan"
└─ Success → Alert: "Scan saved successfully!"
```

## Security & Safety

```
┌─────────────────────────────────────┐
│  Image Validation                   │
│  ├─ Type check (jpg, png, webp)     │
│  ├─ Size check (< 5MB)              │
│  └─ Format validation                │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  AI Processing                      │
│  ├─ Secure file handling             │
│  ├─ Error boundaries                 │
│  └─ Timeout protection               │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Result Display                     │
│  ├─ Always show disclaimer           │
│  ├─ Confidence transparency          │
│  ├─ Alternative diagnoses            │
│  └─ Professional consultation advice │
└─────────────────────────────────────┘
```

## Performance Optimization

- Model pre-loaded on service startup
- Image preprocessing optimized
- Lazy loading of components
- Efficient state management
- Debounced API calls
- Cached model predictions (optional)

## Monitoring Points

1. **AI Service Health**: `/predict/enhanced/health`
2. **Prediction Success Rate**: Log successful vs failed predictions
3. **Emergency Detection Rate**: Track emergency vs non-emergency
4. **Average Response Time**: Monitor prediction latency
5. **User Actions**: Track vet navigation after emergency detection
