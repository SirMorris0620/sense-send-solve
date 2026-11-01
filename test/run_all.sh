#!/usr/bin/env bash
# Runs every automated check. Used by GitHub Actions (CI) and safe to run on your computer.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "== 1. Syntax check =="
for f in src/js/*.js src/content/*.js; do node --check "$f"; done
node -e "new Function(require('fs').readFileSync('backend/Code.gs','utf8'))"
echo "== 2. Build (preview mode for tests) =="
SSS_PREVIEW=1 python3 build.py
echo "== 3. Backend tests against a mock Apps Script (fresh mock for each test) =="
for t in security_test assess_test signin_test flow_test; do
  node test/backend/mock_server.js > /tmp/sss_mock.log 2>&1 & MOCK=$!
  trap 'kill $MOCK 2>/dev/null || true' EXIT
  sleep 2
  echo "-- $t"; python3 test/backend/$t.py
  kill $MOCK; trap - EXIT; sleep 1
done
echo "== 4. Front-end smoke test (every module, every sandbox, 3 boards) =="
python3 test/smoke.py desktop
echo "ALL CHECKS PASSED"
