@echo off
mkdir data 2>nul
if "%SERVER_PORT%"=="" set SERVER_PORT=3000
echo Starting Feida HR System on http://localhost:%SERVER_PORT% ...
node dist/server/standalone.js
