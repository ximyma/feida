@echo off
title Feida Smart HR System v1.2.0
echo ========================================
echo   Feida Smart HR System v1.2.0
echo   AI-Powered HR / CMS / Shop Platform
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
    echo.
)

REM Check if built
if not exist "dist\server\standalone.js" (
    echo [INFO] Building project...
    call npm run build
    if %errorlevel% neq 0 (
        echo [ERROR] Build failed - try: npm run dev
        pause
        exit /b 1
    )
    echo.
)

echo Starting server...
echo Web  : http://localhost:3000
echo API  : http://localhost:3000/api
echo.

REM Kill existing process on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
    echo [INFO] Found old process PID=%%a on port 3000, killing...
    taskkill /F /PID %%a >nul 2>nul
    timeout /t 2 /nobreak >nul
)

node dist\server\standalone.js

if %errorlevel% equ 0 goto done

REM Retry on EADDRINUSE
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
    echo [INFO] Port still in use PID=%%a, force killing...
    taskkill /F /PID %%a >nul 2>nul
    timeout /t 2 /nobreak >nul
)
echo [INFO] Retrying...
node dist\server\standalone.js
if %errorlevel% equ 0 goto done

echo.
echo [ERROR] Server failed to start
echo Try running: npm run dev
pause
exit /b 1

:done
echo.
echo Server is running. Press Ctrl+C to stop.
echo Open http://localhost:3000 in your browser.
pause
