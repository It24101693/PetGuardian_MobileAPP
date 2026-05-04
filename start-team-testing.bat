@echo off
color 0A
echo.
echo  ========================================
echo   PetGuardian - Team Testing Launcher
echo  ========================================
echo.
echo  Choose your setup:
echo.
echo  [1] Railway Backend (Recommended)
echo      - No tunnel needed
echo      - Always accessible
echo      - Just scan QR code
echo.
echo  [2] LocalTunnel
echo      - Quick setup
echo      - Free
echo      - Good for development
echo.
echo  [3] Cloudflare Tunnel
echo      - Most reliable
echo      - Free
echo      - Best for long sessions
echo.
echo  [4] Check Setup
echo      - Verify everything is working
echo.
echo  [5] Exit
echo.
echo  ========================================
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto railway
if "%choice%"=="2" goto localtunnel
if "%choice%"=="3" goto cloudflare
if "%choice%"=="4" goto check
if "%choice%"=="5" goto end
goto invalid

:railway
echo.
echo Starting with Railway backend...
echo.
echo Backend URL: https://petguardianmobileapp-production.up.railway.app
echo.
echo Make sure mobile/.env has:
echo API_BASE_URL=https://petguardianmobileapp-production.up.railway.app/api
echo PUBLIC_WEB_URL=https://petguardianmobileapp-production.up.railway.app
echo.
pause
echo.
echo Starting Expo...
cd mobile
npx expo start -c
goto end

:localtunnel
echo.
echo Checking LocalTunnel installation...
where lt >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing LocalTunnel...
    call npm install -g localtunnel
)
echo.
call start-with-localtunnel.bat
goto end

:cloudflare
echo.
echo Checking Cloudflared installation...
where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Cloudflared is not installed!
    echo.
    echo Please install it first:
    echo 1. Download from: https://github.com/cloudflare/cloudflared/releases
    echo 2. Or use: choco install cloudflared
    echo.
    pause
    goto end
)
echo.
call start-with-tunnel.bat
goto end

:check
echo.
call check-setup.bat
goto end

:invalid
echo.
echo Invalid choice! Please enter 1-5.
echo.
pause
goto end

:end
echo.
echo Goodbye!
timeout /t 2 /nobreak >nul
