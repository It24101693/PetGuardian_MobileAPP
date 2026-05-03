@echo off
echo ========================================
echo PetGuardian AI Disease Detection Setup
echo ========================================
echo.

echo [1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)
python --version
echo.

echo [2/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo.

echo [3/4] Checking Java installation...
java -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17+ from https://adoptium.net/
    pause
    exit /b 1
)
java -version
echo.

echo [4/4] Checking model file...
set MODEL_PATH=C:\Users\ASUS\IdeaProjects\AI\pet_disease_model.h5
if exist "%MODEL_PATH%" (
    echo ✓ Model file found: %MODEL_PATH%
) else (
    echo WARNING: Model file not found at: %MODEL_PATH%
    echo Please update the path in ai-service\config.py
)
echo.

echo ========================================
echo Setup Check Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Install AI service dependencies:
echo    cd ai-service
echo    pip install -r requirements.txt
echo.
echo 2. Install frontend dependencies:
echo    cd frontend
echo    npm install
echo.
echo 3. Start services (in separate terminals):
echo    Terminal 1: cd ai-service ^&^& python app.py
echo    Terminal 2: cd backend ^&^& mvn spring-boot:run
echo    Terminal 3: cd frontend ^&^& npm run dev
echo.
echo 4. Test the system:
echo    python test-disease-detection.py
echo.
pause
