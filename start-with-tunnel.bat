@echo off
echo ========================================
echo PetGuardian - Start with Cloudflare Tunnel
echo ========================================
echo.

REM Check if cloudflared is installed
where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: cloudflared is not installed!
    echo.
    echo Please install it first:
    echo 1. Download from: https://github.com/cloudflare/cloudflared/releases
    echo 2. Or use: choco install cloudflared
    echo.
    pause
    exit /b 1
)

echo Starting backend server...
start "Backend Server" cmd /k "cd node-backend && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Cloudflare tunnel...
echo.
echo IMPORTANT: Copy the tunnel URL that appears below!
echo It will look like: https://random-name.trycloudflare.com
echo.
echo Update mobile/.env with:
echo API_BASE_URL=https://your-tunnel-url.trycloudflare.com/api
echo PUBLIC_WEB_URL=https://your-tunnel-url.trycloudflare.com
echo.
pause

start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:8080"

echo.
echo Tunnel started! Update your .env file, then press any key to start Expo...
pause

echo Starting Expo...
cd mobile
start "Expo Server" cmd /k "npx expo start -c"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo 1. Copy the tunnel URL from the Cloudflare Tunnel window
echo 2. Update mobile/.env with the tunnel URL
echo 3. Restart Expo if needed
echo 4. Share the Expo QR code with your team
echo.
pause
