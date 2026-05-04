@echo off
echo ========================================
echo Starting PetGuardian Mobile Architecture
echo ========================================
echo.

echo Starting Node.js Backend...
start "PetGuardian Node Backend" cmd /k "cd node-backend && npm run dev"
timeout /t 2 /nobreak >nul

echo Starting AI Service...
start "PetGuardian AI Service" cmd /k "cd ai-service && .venv\Scripts\python app.py"
timeout /t 2 /nobreak >nul

echo Starting Mobile App...
start "PetGuardian Mobile App" cmd /k "cd mobile && npx expo start -c"

echo.
echo ========================================
echo All services starting...
echo ========================================
echo.
echo 1. The Node Backend should be running on port 5001.
echo 2. The AI Service should be running on port 5000.
echo 3. The Mobile App window will show a QR code.
echo.
echo Please scan the QR code in the Mobile App terminal using:
echo - Android: The "Expo Go" app
echo - iOS: The built-in Camera app (with Expo Go installed)
echo.
pause
