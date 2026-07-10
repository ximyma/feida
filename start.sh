#!/usr/bin/env bash
set -e
mkdir -p data
export SERVER_PORT="${SERVER_PORT:-3000}"
echo "Starting Feida HR System on http://localhost:${SERVER_PORT} ..."
exec node dist/server/standalone.js
