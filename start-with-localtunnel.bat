@echo off
echo ========================================
echo PetGuardian - Start with LocalTunnel
echo ========================================
echo.

REM Check if localtunnel is installed
where lt >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing localtunnel...
    call npm install -g localtunnel
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install localtunnel
        pause
        exit /b 1
    )
)

echo Starting backend server...
start "Backend Server" cmd /k "cd node-backend && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting LocalTunnel...
echo.
set /p SUBDOMAIN="Enter a subdomain name (e.g., petguardian-yourname): "

start "LocalTunnel" cmd /k "lt --port 8080 --subdomain %SUBDOMAIN%"

echo.
echo Tunnel URL will be: https://%SUBDOMAIN%.loca.lt
echo.
echo Update mobile/.env with:
echo API_BASE_URL=https://%SUBDOMAIN%.loca.lt/api
echo PUBLIC_WEB_URL=https://%SUBDOMAIN%.loca.lt
echo.
echo Press any key after updating .env file...
pause

echo Starting Expo...
cd mobile
start "Expo Server" cmd /k "npx expo start -c"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Tunnel URL: https://%SUBDOMAIN%.loca.lt
echo Share the Expo QR code with your team!
echo.
pause
