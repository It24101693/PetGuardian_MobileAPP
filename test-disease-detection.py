#!/usr/bin/env python3
"""
Quick test script for the enhanced disease detection system
"""
import requests
import sys
import os

AI_SERVICE_URL = "http://localhost:5000"

def test_health():
    """Test if the enhanced service is running"""
    print("🔍 Testing enhanced disease detection service health...")
    try:
        response = requests.get(f"{AI_SERVICE_URL}/predict/enhanced/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Service is healthy!")
            print(f"   Status: {data.get('status')}")
            print(f"   Model loaded: {data.get('model_loaded')}")
            print(f"   Total diseases: {data.get('total_diseases')}")
            return True
        else:
            print(f"❌ Service returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to AI service. Is it running on port 5000?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_prediction(image_path):
    """Test disease prediction with an image"""
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return False
    
    print(f"\n🔍 Testing disease prediction with: {image_path}")
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{AI_SERVICE_URL}/predict/enhanced", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Prediction successful!")
            print(f"\n📊 Results:")
            print(f"   Disease: {data.get('diseaseName')}")
            print(f"   Probability: {data.get('probability', 0) * 100:.1f}%")
            print(f"   Emergency: {'🚨 YES' if data.get('isEmergency') else '✓ No'}")
            print(f"   Severity: {data.get('severity')}")
            print(f"   Confidence: {data.get('confidence')}")
            
            if data.get('isEmergency'):
                print(f"\n⚠️  EMERGENCY MESSAGE:")
                print(f"   {data.get('urgencyMessage')}")
            
            print(f"\n💊 Treatment:")
            print(f"   {data.get('treatment')}")
            
            if data.get('homeCare'):
                print(f"\n🏠 Home Care Steps:")
                for i, step in enumerate(data.get('homeCare', []), 1):
                    print(f"   {i}. {step}")
            
            if data.get('alternativeDiagnoses'):
                print(f"\n🔬 Alternative Diagnoses:")
                for alt in data.get('alternativeDiagnoses', []):
                    print(f"   - {alt['disease']}: {alt['probability'] * 100:.1f}%")
            
            return True
        else:
            print(f"❌ Prediction failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        return False

def main():
    print("=" * 60)
    print("🐾 PetGuardian AI Disease Detection Test")
    print("=" * 60)
    
    # Test health
    if not test_health():
        print("\n❌ Health check failed. Please start the AI service:")
        print("   cd ai-service")
        print("   python app.py")
        sys.exit(1)
    
    # Test prediction if image provided
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        test_prediction(image_path)
    else:
        print("\n💡 To test prediction, run:")
        print("   python test-disease-detection.py <path-to-image>")
    
    print("\n" + "=" * 60)
    print("✅ Testing complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
