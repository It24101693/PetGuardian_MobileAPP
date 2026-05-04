@echo off
echo ========================================
echo PetGuardian - Setup Checker
echo ========================================
echo.

echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    node --version
    echo [OK] Node.js is installed
) else (
    echo [ERROR] Node.js is NOT installed
)
echo.

echo Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    npm --version
    echo [OK] npm is installed
) else (
    echo [ERROR] npm is NOT installed
)
echo.

echo Checking Expo CLI...
where expo >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    expo --version
    echo [OK] Expo CLI is installed
) else (
    echo [WARNING] Expo CLI not found globally (this is OK if using npx)
)
echo.

echo Checking LocalTunnel...
where lt >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] LocalTunnel is installed
) else (
    echo [INFO] LocalTunnel is NOT installed
    echo       Install with: npm install -g localtunnel
)
echo.

echo Checking Cloudflared...
where cloudflared >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    cloudflared --version
    echo [OK] Cloudflared is installed
) else (
    echo [INFO] Cloudflared is NOT installed
    echo       Download from: https://github.com/cloudflare/cloudflared/releases
)
echo.

echo ========================================
echo Checking Backend Dependencies...
echo ========================================
if exist "node-backend\node_modules" (
    echo [OK] Backend node_modules exists
) else (
    echo [WARNING] Backend dependencies not installed
    echo           Run: cd node-backend ^&^& npm install
)
echo.

echo ========================================
echo Checking Mobile Dependencies...
echo ========================================
if exist "mobile\node_modules" (
    echo [OK] Mobile node_modules exists
) else (
    echo [WARNING] Mobile dependencies not installed
    echo           Run: cd mobile ^&^& npm install
)
echo.

echo ========================================
echo Checking Environment Files...
echo ========================================
if exist "mobile\.env" (
    echo [OK] mobile/.env exists
    echo.
    echo Current configuration:
    type mobile\.env
) else (
    echo [ERROR] mobile/.env NOT found
    echo         Copy .env.example to mobile/.env
)
echo.

echo ========================================
echo Testing Railway Backend...
echo ========================================
echo Checking: https://petguardianmobileapp-production.up.railway.app/api
curl -s -o nul -w "HTTP Status: %%{http_code}\n" https://petguardianmobileapp-production.up.railway.app/api
if %ERRORLEVEL% EQU 0 (
    echo [OK] Railway backend is accessible
) else (
    echo [WARNING] Could not reach Railway backend
    echo           Check if it's deployed and running
)
echo.

echo ========================================
echo Summary
echo ========================================
echo.
echo RECOMMENDED SETUP:
echo 1. Use Railway backend (already configured)
echo 2. Run: cd mobile ^&^& npx expo start -c
echo 3. Share QR code with team
echo.
echo ALTERNATIVE (if Railway is down):
echo 1. Install LocalTunnel: npm install -g localtunnel
echo 2. Run: start-with-localtunnel.bat
echo.
echo For detailed instructions, see:
echo - TEAM_TESTING_QUICKSTART.md
echo - REMOTE_TESTING_GUIDE.md
echo.
pause
