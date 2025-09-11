#!/usr/bin/env bash
set -euo pipefail

echo "==> Frontend CI"
cd master/frontend/web
npm ci
npm run lint
npm run build
echo "✅ CI finished"

# Succeed by default (until real tests are added)
exit 0
