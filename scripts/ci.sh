#!/usr/bin/env bash
set -euo pipefail

echo "== CI: root install & build (apps/web) =="

# Install once at the repo root using the root package-lock.json
npm ci

# Optional checks (won't fail if scripts don't exist)
npm run lint --if-present
npm run typecheck --if-present

# Build the web app via root script proxy to apps/web
npm run build

echo "== CI ok =="
