#!/usr/bin/env bash
set -euo pipefail
echo "== CI: root install & build (apps/web) =="
npm ci
npm run lint --if-present
npm run typecheck --if-present
npm run build
echo "== CI ok =="
