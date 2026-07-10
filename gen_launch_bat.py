# Generate ASCII-only launcher bat for Feida HR System
content = r'''@echo off
title Feida Smart HR System v1.0.0
echo ========================================
echo   Feida Smart HR System v1.0.0
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

node dist\server\standalone.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server failed to start
    echo Try running: npm run dev
    pause
)
'''
with open(r'd:\feida\启动系统.bat', 'w', encoding='ascii', newline='\r\n') as f:
    f.write(content)
print('written 启动系统.bat')
