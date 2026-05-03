@echo off
echo ========================================
echo Starting PetGuardian Services
echo ========================================
echo.

echo This will start all three services in separate windows.
echo Make sure you have run setup-disease-detection.bat first!
echo.
pause

echo Starting AI Service...
start "PetGuardian AI Service" cmd /k "cd ai-service && python app.py"
timeout /t 3 /nobreak >nul

echo Starting Backend...
start "PetGuardian Backend" cmd /k "cd backend && mvn spring-boot:run"
timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "PetGuardian Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo All services starting...
echo ========================================
echo.
echo AI Service: http://localhost:5000
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Wait 30-60 seconds for all services to start.
echo Then open http://localhost:5173 in your browser.
echo.
echo Close this window when done.
pause
