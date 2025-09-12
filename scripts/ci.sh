#!/usr/bin/env bash
set -euo pipefail

echo "== CI: build frontend =="
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="${WEB_DIR:-apps/web}"

cd "$ROOT_DIR/$WEB_DIR"
npm ci
npm run typecheck --if-present
npm run lint --if-present
npm run build
echo "== CI ok =="
