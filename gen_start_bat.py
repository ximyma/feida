#!/usr/bin/env python3
# Generate ASCII-only start.bat (no Chinese, per project .bat rule).
content = (
    "@echo off\r\n"
    "mkdir data 2>nul\r\n"
    'if "%SERVER_PORT%"=="" set SERVER_PORT=3000\r\n'
    "echo Starting Feida HR System on http://localhost:%SERVER_PORT% ...\r\n"
    "node dist/server/standalone.js\r\n"
)
with open("start.bat", "w", encoding="ascii", newline="") as f:
    f.write(content)
print("start.bat written (ascii)")
