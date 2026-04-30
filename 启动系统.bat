@echo off
chcp 65001 >nul
title 飞达智能HR系统
echo ========================================
echo       飞达智能HR系统 - 启动中
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js
    echo.
    echo 请先安装 Node.js 22
    echo 下载地址: https://nodejs.org/zh-cn/download/
    echo.
    pause
    exit /b 1
)

REM 检查 Node 版本
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Node.js 版本: %NODE_VERSION%
echo.

REM 启动系统
echo 正在启动服务器...
node server\standalone.js

if %errorlevel% neq 0 (
    echo.
    echo [错误] 启动失败，请检查日志
    pause
)
