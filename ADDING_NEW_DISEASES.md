# Adding New Diseases to the Detection System

## Overview
This guide shows how to add new diseases to the AI disease detection system.

## Step 1: Train Your Model

Ensure your new disease is included in the training data and the model is retrained. The model should output class predictions that match the disease names you want to add.

## Step 2: Update Disease Database

Edit `ai-service/services/enhanced_disease_detection.py` and add your disease to the `DISEASE_DATABASE` dictionary:

### For Emergency Diseases

```python
DISEASE_DATABASE = {
    # ... existing diseases ...
    
    'Your New Emergency Disease': {
        'emergency': True,  # Mark as emergency
        'severity': 'Critical',  # or 'Severe'
        'symptoms': [
            'Symptom 1',
            'Symptom 2',
            'Symptom 3',
            'Symptom 4'
        ],
        'treatment': 'IMMEDIATE VETERINARY CARE REQUIRED - Detailed description of why this is an emergency and what immediate actions are needed.',
        'urgency_message': '🚨 EMERGENCY: Seek veterinary care within [timeframe]'
    },
}
```

### For Non-Emergency Diseases

```python
DISEASE_DATABASE = {
    # ... existing diseases ...
    
    'Your New Non-Emergency Disease': {
        'emergency': False,  # Not an emergency
        'severity': 'Moderate',  # 'Mild', 'Moderate', or 'Severe'
        'symptoms': [
            'Symptom 1',
            'Symptom 2',
            'Symptom 3'
        ],
        'treatment': 'Detailed treatment description. Include medications, procedures, and when to consult a vet.',
        'home_care': [
            'Home care step 1',
            'Home care step 2',
            'Home care step 3',
            'Home care step 4'
        ]
    },
}
```

## Step 3: Update Class Names (if needed)

If you've retrained the model with new classes, update the class names pickle file:

```python
import pickle

class_names = [
    'Disease 1',
    'Disease 2',
    'Your New Disease',
    # ... all disease names
]

with open('ai-service/dieseasDetect/class_names.pkl', 'wb') as f:
    pickle.dump(class_names, f)
```

## Step 4: Test the New Disease

```bash
# Start AI service
cd ai-service
python app.py

# Test with an image
python test-disease-detection.py path/to/test-image.jpg
```

## Step 5: Verify in UI

1. Start all services
2. Go to Owner Dashboard
3. Open AI Disease Scanner
4. Upload a test image
5. Verify:
   - Disease name appears correctly
   - Emergency status is correct
   - Treatment suggestions display
   - Home care steps show (if non-emergency)
   - Urgency message appears (if emergency)

## Disease Configuration Fields

### Required Fields (All Diseases)
- `emergency` (boolean): Is this an emergency?
- `severity` (string): 'Critical', 'Severe', 'Moderate', or 'Mild'
- `symptoms` (array): List of common symptoms
- `treatment` (string): Treatment description

### Emergency-Specific Fields
- `urgency_message` (string): Timeline for seeking care
  - Examples:
    - "🚨 EMERGENCY: Seek care within 30 minutes"
    - "🚨 EMERGENCY: Seek care within 1 hour"
    - "🚨 EMERGENCY: Contact vet immediately"

### Non-Emergency-Specific Fields
- `home_care` (array): Step-by-step home care instructions

## Severity Guidelines

### Critical
- Life-threatening conditions
- Requires immediate hospitalization
- Examples: Parvovirus, Bloat, Rabies

### Severe
- Serious conditions requiring urgent care
- Should see vet within hours
- Examples: Heatstroke, Pyometra

### Moderate
- Requires veterinary attention
- Can wait 24-48 hours if stable
- Examples: Mange, Hot Spots, Bacterial Infections

### Mild
- Can be managed with home care initially
- Vet visit recommended if not improving
- Examples: Ringworm, Allergic Dermatitis

## Emergency Classification Rules

Mark as `emergency: True` if:
- Condition is life-threatening
- Requires immediate medical intervention
- Can rapidly deteriorate without treatment
- Involves vital organ systems
- Highly contagious and dangerous

Mark as `emergency: False` if:
- Can be managed with home care initially
- Not immediately life-threatening
- Stable condition
- Gradual onset
- Responds to over-the-counter treatments

## Example: Adding "Kennel Cough"

```python
'Kennel Cough (Bordetella)': {
    'emergency': False,
    'severity': 'Mild',
    'symptoms': [
        'Dry, hacking cough',
        'Gagging or retching',
        'Nasal discharge',
        'Mild lethargy'
    ],
    'treatment': 'Usually self-limiting within 1-3 weeks. Keep pet warm and humid. Use honey (1 tsp per 20 lbs) to soothe throat. Consult vet if cough persists beyond 3 weeks or worsens.',
    'home_care': [
        'Rest and limit exercise',
        'Use humidifier or steam therapy',
        'Honey for throat soothing',
        'Isolate from other dogs',
        'Monitor for worsening symptoms'
    ]
},
```

## Example: Adding "Bloat" (Already Included)

```python
'Bloat (GDV)': {
    'emergency': True,
    'severity': 'Critical',
    'symptoms': [
        'Distended abdomen',
        'Restlessness',
        'Unproductive vomiting',
        'Rapid breathing'
    ],
    'treatment': 'IMMEDIATE VETERINARY CARE REQUIRED - Life-threatening emergency requiring immediate surgery.',
    'urgency_message': '🚨 EMERGENCY: Seek veterinary care within 30 minutes'
},
```

## Testing Checklist

After adding a new disease:

- [ ] Disease name matches model output exactly
- [ ] Emergency status is appropriate
- [ ] Severity level is correct
- [ ] Symptoms are accurate and helpful
- [ ] Treatment description is clear
- [ ] Home care steps are actionable (if non-emergency)
- [ ] Urgency message is appropriate (if emergency)
- [ ] Test with actual image
- [ ] Verify UI displays correctly
- [ ] Check emergency flow works (if applicable)
- [ ] Verify treatment suggestions show (if non-emergency)

## Best Practices

1. **Be Specific**: Provide detailed, actionable treatment advice
2. **Be Clear**: Use simple language pet owners can understand
3. **Be Safe**: Always include vet consultation advice
4. **Be Accurate**: Research symptoms and treatments thoroughly
5. **Be Consistent**: Follow the same format for all diseases
6. **Be Responsible**: Never claim AI can replace veterinary diagnosis

## Resources

- Veterinary medical databases
- Peer-reviewed veterinary journals
- Consultation with licensed veterinarians
- Pet health organizations (AVMA, ASPCA)

## Notes

- The system automatically handles unknown diseases with a default response
- Emergency detection triggers immediate UI changes
- All results include veterinary disclaimer
- Confidence scoring is automatic based on model output
