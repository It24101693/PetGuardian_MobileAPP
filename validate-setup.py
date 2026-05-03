#!/usr/bin/env python3
"""
Setup validation script for AI Disease Detection System
Checks all prerequisites and configurations
"""
import os
import sys
import subprocess

def check_command(command, name, min_version=None):
    """Check if a command exists and optionally verify version"""
    try:
        result = subprocess.run([command, '--version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        if result.returncode == 0:
            version = result.stdout.split('\n')[0]
            print(f"✅ {name}: {version}")
            return True
        else:
            print(f"❌ {name}: Not found or error")
            return False
    except FileNotFoundError:
        print(f"❌ {name}: Not installed or not in PATH")
        return False
    except Exception as e:
        print(f"⚠️  {name}: Could not verify ({e})")
        return False

def check_file(path, name):
    """Check if a file exists"""
    if os.path.exists(path):
        size = os.path.getsize(path)
        size_mb = size / (1024 * 1024)
        print(f"✅ {name}: Found ({size_mb:.1f} MB)")
        return True
    else:
        print(f"❌ {name}: Not found at {path}")
        return False

def check_directory(path, name):
    """Check if a directory exists"""
    if os.path.isdir(path):
        print(f"✅ {name}: Found")
        return True
    else:
        print(f"❌ {name}: Not found at {path}")
        return False

def check_port(port, name):
    """Check if a port is available"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    if result == 0:
        print(f"⚠️  {name}: Port {port} is already in use")
        return False
    else:
        print(f"✅ {name}: Port {port} is available")
        return True

def main():
    print("=" * 70)
    print("🐾 PetGuardian AI Disease Detection - Setup Validation")
    print("=" * 70)
    print()
    
    all_checks_passed = True
    
    # Check Python
    print("📦 Checking Prerequisites...")
    print("-" * 70)
    all_checks_passed &= check_command('python', 'Python')
    all_checks_passed &= check_command('node', 'Node.js')
    all_checks_passed &= check_command('java', 'Java')
    all_checks_passed &= check_command('mvn', 'Maven')
    print()
    
    # Check directories
    print("📁 Checking Project Structure...")
    print("-" * 70)
    all_checks_passed &= check_directory('ai-service', 'AI Service Directory')
    all_checks_passed &= check_directory('backend', 'Backend Directory')
    all_checks_passed &= check_directory('frontend', 'Frontend Directory')
    print()
    
    # Check critical files
    print("📄 Checking Critical Files...")
    print("-" * 70)
    all_checks_passed &= check_file('ai-service/app.py', 'AI Service App')
    all_checks_passed &= check_file('ai-service/config.py', 'AI Service Config')
    all_checks_passed &= check_file('ai-service/services/enhanced_disease_detection.py', 'Enhanced Disease Service')
    all_checks_passed &= check_file('ai-service/routes/enhanced_prediction.py', 'Enhanced Prediction Route')
    all_checks_passed &= check_file('ai-service/requirements.txt', 'Python Requirements')
    print()
    
    # Check model file
    print("🤖 Checking AI Model...")
    print("-" * 70)
    model_path = r"C:\Users\ASUS\IdeaProjects\AI\pet_disease_model.h5"
    model_exists = check_file(model_path, 'Disease Detection Model')
    if not model_exists:
        print("   ⚠️  Update model path in ai-service/config.py")
        all_checks_passed = False
    print()
    
    # Check ports
    print("🔌 Checking Port Availability...")
    print("-" * 70)
    all_checks_passed &= check_port(5000, 'AI Service')
    all_checks_passed &= check_port(8080, 'Backend')
    all_checks_passed &= check_port(5173, 'Frontend')
    print()
    
    # Check Python packages
    print("📚 Checking Python Dependencies...")
    print("-" * 70)
    required_packages = ['flask', 'tensorflow', 'keras', 'numpy', 'pillow', 'flask_cors']
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}: Installed")
        except ImportError:
            print(f"❌ {package}: Not installed")
            all_checks_passed = False
    print()
    
    # Summary
    print("=" * 70)
    if all_checks_passed:
        print("✅ ALL CHECKS PASSED!")
        print()
        print("🚀 Ready to start services:")
        print("   1. cd ai-service && python app.py")
        print("   2. cd backend && mvn spring-boot:run")
        print("   3. cd frontend && npm run dev")
        print()
        print("📖 See START_GUIDE.md for detailed instructions")
    else:
        print("❌ SOME CHECKS FAILED")
        print()
        print("Please fix the issues above before starting services.")
        print("See START_GUIDE.md for setup instructions.")
    print("=" * 70)
    
    return 0 if all_checks_passed else 1

if __name__ == "__main__":
    sys.exit(main())
