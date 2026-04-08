#!/usr/bin/env sh
set -e

echo "[entrypoint] Running Prisma migrations (deploy)..."
npx prisma migrate deploy

echo "[entrypoint] Starting app..."
node dist/main.js

